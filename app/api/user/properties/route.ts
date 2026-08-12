import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { db } from "@/lib/firebase-admin"
import { pricingData, PER_PROPERTY_TIER, PER_PROPERTY_DEFAULT_CAP } from "@/config/subscriptions"
import { getSubscriptionStatus } from "@/lib/subscription"
import { logOnboardingEvent } from "@/lib/onboarding/log"
import { getEffectivePropertyLimit } from "@/lib/property-limits"
import { stripe } from "@/lib/stripe"

export const dynamic = "force-dynamic"

function normalizePropertyId(propertyId: string) {
    return propertyId.replace(/^properties\//, "")
}

function isPerProperty(tier: string | undefined) {
    return String(tier).toLowerCase() === PER_PROPERTY_TIER
}

// Best-effort mirror of the Firestore property count onto the Stripe
// subscription quantity. Firestore is the source of truth: a Stripe
// failure here is logged but never blocks or rolls back the property
// write, so the failure mode is under-billing, never invisible over-billing.
async function syncStripeQuantity(userData: any, quantity: number) {
    const stripeSubscriptionId = userData?.subscription?.stripeSubscriptionId
    if (!stripeSubscriptionId) return

    const cachedItemId = userData.subscription.stripeSubscriptionItemId

    try {
        const itemId = cachedItemId
            ?? (await stripe.subscriptions.retrieve(stripeSubscriptionId)).items.data[0].id
        await stripe.subscriptionItems.update(itemId, { quantity })
    } catch (err) {
        // The cached item id may be stale (e.g. price swapped outside this app).
        // Refetch the live item id once before giving up.
        if (cachedItemId) {
            try {
                const liveItemId = (await stripe.subscriptions.retrieve(stripeSubscriptionId)).items.data[0].id
                await stripe.subscriptionItems.update(liveItemId, { quantity })
                return
            } catch (retryErr) {
                console.error("[PROPERTIES] Stripe quantity sync retry failed", retryErr)
            }
        }
        console.error("[PROPERTIES] Stripe quantity sync failed", err)
    }
}

export async function GET() {
    const session = await getServerSession(authOptions)

    // @ts-ignore
    if (!session?.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // @ts-ignore
    const userId = session.userId

    try {
        const [userDoc, propertiesSnap] = await Promise.all([
            db.collection("users").doc(userId).get(),
            db.collection("users").doc(userId).collection("properties").get()
        ])

        const properties = propertiesSnap.docs.map(doc => doc.data())
        const userData = userDoc.data()
        const deletionUsage = userData?.deletionRateLimit || { count: 0, resetAt: Date.now() + 30 * 24 * 60 * 60 * 1000 }
        const subInfo = getSubscriptionStatus(userData)
        const tierConfig = pricingData.find(t => t.title.toLowerCase() === subInfo.tier?.toLowerCase())
        const propertyLimit = getEffectivePropertyLimit(session, userData, tierConfig?.maxProperties ?? 1)

        return NextResponse.json({ properties, deletionUsage, propertyLimit })
    } catch (error) {
        console.error("Error fetching user properties:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)

    // @ts-ignore
    if (!session?.userId) {
        await logOnboardingEvent({
            email: session?.user?.email, step: "save_property.unauthorized", status: "error",
            message: "No userId on session",
        })
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // @ts-ignore
    const userId = session.userId
    const email = session?.user?.email

    await logOnboardingEvent({ userId, email, step: "save_property.start", status: "info" })

    try {
        const body = await request.json()
        const { propertyId, propertyName, accountId } = body

        if (!propertyId) {
            await logOnboardingEvent({
                userId, email, step: "save_property.missing_property_id", status: "error",
                message: "Property ID missing from request body",
            })
            return NextResponse.json({ error: "Property ID required" }, { status: 400 })
        }

        // Fetch user data and existing properties
        const userDoc = await db.collection("users").doc(userId).get()
        const userData = userDoc.data()
        
        const subInfo = getSubscriptionStatus(userData)
        const perProperty = isPerProperty(subInfo.tier)

        let maxProperties: number
        let tierConfig: (typeof pricingData)[number] | undefined
        if (perProperty) {
            maxProperties = getEffectivePropertyLimit(session, userData, PER_PROPERTY_DEFAULT_CAP)
        } else {
            const tierName = subInfo.isPremium
                ? subInfo.tier
                : 'starter'

            tierConfig = pricingData.find(t => t.title.toLowerCase() === tierName?.toLowerCase())
            maxProperties = getEffectivePropertyLimit(session, userData, tierConfig?.maxProperties ?? 1)
        }

        // Check if the property already exists (re-selecting vs adding new)
        const normalizedPropertyId = normalizePropertyId(propertyId)
        const propertyRef = db.collection("users").doc(userId).collection("properties").doc(normalizedPropertyId)
        const propertyDoc = await propertyRef.get()
        const isNewProperty = !propertyDoc.exists
        let currentCount = 0

        // Only enforce limit when adding a NEW property
        if (isNewProperty) {
            const propertiesSnap = await db.collection("users").doc(userId).collection("properties").get()
            currentCount = propertiesSnap.size

            if (currentCount >= maxProperties) {
                const planLabel = perProperty ? "Per-Property" : (tierConfig?.title || "Starter")
                await logOnboardingEvent({
                    userId, email, step: "save_property.plan_limit_reached", status: "error",
                    message: `Plan limit reached (${currentCount}/${maxProperties})`,
                    meta: { tier: planLabel, maxProperties, currentCount },
                })
                return NextResponse.json({
                    error: `Plan limit reached. You can only add ${maxProperties} properties on the ${planLabel} plan.`
                }, { status: 403 })
            }
        }

        const activeProperty = {
            id: propertyId,
            name: propertyName,
            accountId: accountId,
            updatedAt: new Date()
        }

        await db.collection("users").doc(userId).set({
            activeProperty,
            isOnboarded: true, // Mark as onboarded after saving first property
            // Initialize basic subscription if not present (only if it's completely missing)
            ...(!userData?.subscription ? {
                subscription: {
                    tier: PER_PROPERTY_TIER,
                    status: "free",
                }
            } : {}),
        }, { merge: true })

        // Also add to a subcollection of properties if we want to support multiple later
        await db.collection("users").doc(userId).collection("properties").doc(propertyId.replace("properties/", "")).set({
            id: propertyId,
            name: propertyName,
            accountId: accountId,
            addedAt: new Date()
        })

        if (perProperty && isNewProperty) {
            const freshSnap = await db.collection("users").doc(userId).collection("properties").get()
            await syncStripeQuantity(userData, freshSnap.size)
        }

        await logOnboardingEvent({
            userId, email, step: "save_property.success", status: "info",
            meta: { propertyId, propertyName },
        })

        return NextResponse.json({ success: true, activeProperty })

    } catch (error: any) {
        console.error("Error saving property:", error)
        await logOnboardingEvent({
            userId, email, step: "save_property.exception", status: "error",
            message: error?.message || String(error),
        })
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    const session = await getServerSession(authOptions)

    // @ts-ignore
    if (!session?.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { propertyId, name, timezone } = body

        if (!propertyId) {
            return NextResponse.json({ error: "Property ID required" }, { status: 400 })
        }

        // @ts-ignore
        const userId = session.userId
        const normalizedPropertyId = normalizePropertyId(propertyId)
        const userRef = db.collection("users").doc(userId)
        const propertyRef = userRef.collection("properties").doc(normalizedPropertyId)
        const propertyDoc = await propertyRef.get()

        if (!propertyDoc.exists) {
            return NextResponse.json({ error: "Property not found" }, { status: 404 })
        }

        const updates = {
            ...(name !== undefined ? { name } : {}),
            ...(timezone !== undefined ? { timezone } : {}),
            updatedAt: new Date(),
        }

        await propertyRef.set(updates, { merge: true })

        const userDoc = await userRef.get()
        const userData = userDoc.data()
        let activeProperty = userData?.activeProperty ?? null
        if (normalizePropertyId(userData?.activeProperty?.id || "") === normalizedPropertyId) {
            activeProperty = {
                ...(userData?.activeProperty || {}),
                id: propertyId,
                ...(name !== undefined ? { name } : {}),
                ...(timezone !== undefined ? { timezone } : {}),
                updatedAt: new Date(),
            }
            await userRef.set({ activeProperty }, { merge: true })
        }

        return NextResponse.json({ success: true, activeProperty })
    } catch (error) {
        console.error("Error updating property:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const propertyId = searchParams.get("propertyId")

    // @ts-ignore
    if (!session?.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!propertyId) {
        return NextResponse.json({ error: "Property ID required" }, { status: 400 })
    }

    // @ts-ignore
    const userId = session.userId

    try {
        const normalizedPropertyId = normalizePropertyId(propertyId)
        const userRef = db.collection("users").doc(userId)
        const propertiesRef = userRef.collection("properties")
        const propertyRef = propertiesRef.doc(normalizedPropertyId)

        // Rate Limit Check for Deletion
        // Run transaction or just optimistic check (doc read -> write)
        const userDoc = await userRef.get()
        const userData = userDoc.data()

        const propertyDoc = await propertyRef.get()
        const activePropertyId = normalizePropertyId(userData?.activeProperty?.id || "")

        if (!propertyDoc.exists && activePropertyId !== normalizedPropertyId) {
            return NextResponse.json({ error: "Property not found" }, { status: 404 })
        }

        const now = Date.now()
        const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000
        let delLimit = userData?.deletionRateLimit || { count: 0, resetAt: now + THIRTY_DAYS }

        if (now > delLimit.resetAt) {
            delLimit = { count: 0, resetAt: now + THIRTY_DAYS }
        }

        if (delLimit.count >= 5) {
            return NextResponse.json({ error: "Monthly deletion limit reached (5/month)." }, { status: 429 })
        }

        // 1. Delete property
        if (propertyDoc.exists) {
            await propertyRef.delete()
        }

        // 2. Update Limit & Active Check
        const updates: any = {
            deletionRateLimit: {
                count: delLimit.count + 1,
                resetAt: delLimit.resetAt
            }
        }

        if (activePropertyId === normalizedPropertyId) {
            const remainingPropertiesSnap = await propertiesRef.get()
            const nextProperty = remainingPropertiesSnap.docs
                .filter(doc => doc.id !== normalizedPropertyId)
                .map(doc => doc.data())[0]

            updates.activeProperty = nextProperty ? {
                id: nextProperty.id,
                name: nextProperty.name,
                accountId: nextProperty.accountId || null,
                updatedAt: new Date(),
            } : null
        }

        await userRef.update(updates)

        if (isPerProperty(userData?.subscription?.tier)) {
            const remainingSnap = await propertiesRef.get()
            await syncStripeQuantity(userData, remainingSnap.size)
        }

        return NextResponse.json({ success: true, activeProperty: updates.activeProperty ?? userData?.activeProperty ?? null })
    } catch (error) {
        console.error("Error deleting property:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
