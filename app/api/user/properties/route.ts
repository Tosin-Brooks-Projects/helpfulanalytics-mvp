import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { db } from "@/lib/firebase-admin"
import { pricingData } from "@/config/subscriptions"
import { getSubscriptionStatus } from "@/lib/subscription"

export const dynamic = "force-dynamic"

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

        return NextResponse.json({ properties, deletionUsage })
    } catch (error) {
        console.error("Error fetching user properties:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)

    // @ts-ignore
    if (!session?.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { propertyId, propertyName, accountId } = body

        if (!propertyId) {
            return NextResponse.json({ error: "Property ID required" }, { status: 400 })
        }

        // @ts-ignore
        const userId = session.userId

        // Fetch user data and existing properties
        const userDoc = await db.collection("users").doc(userId).get()
        const userData = userDoc.data()
        
        const subInfo = getSubscriptionStatus(userData)

        const tierName = subInfo.isPremium
            ? subInfo.tier
            : 'starter'

        const tierConfig = pricingData.find(t => t.title.toLowerCase() === tierName?.toLowerCase())
        const maxProperties = tierConfig?.maxProperties ?? 1

        // Check if the property already exists (re-selecting vs adding new)
        const propertyRef = db.collection("users").doc(userId).collection("properties").doc(propertyId.replace("properties/", ""))
        const propertyDoc = await propertyRef.get()

        // Only enforce limit when adding a NEW property
        if (!propertyDoc.exists) {
            const propertiesSnap = await db.collection("users").doc(userId).collection("properties").get()
            const currentCount = propertiesSnap.size

            if (currentCount >= maxProperties) {
                return NextResponse.json({
                    error: `Plan limit reached. You can only add ${maxProperties} properties on the ${tierConfig?.title || 'Starter'} plan.`
                }, { status: 403 })
            }
        }

        await db.collection("users").doc(userId).set({
            activeProperty: {
                id: propertyId,
                name: propertyName,
                accountId: accountId,
                updatedAt: new Date()
            },
            isOnboarded: true, // Mark as onboarded after saving first property
            // Initialize basic subscription if not present (only if it's completely missing)
            ...(!userData?.subscription ? {
                subscription: {
                    tier: "starter",
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

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error("Error saving property:", error)
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
        const propertyRef = db.collection("users").doc(userId).collection("properties").doc(propertyId)
        const userRef = db.collection("users").doc(userId)

        // Rate Limit Check for Deletion
        // Run transaction or just optimistic check (doc read -> write)
        const userDoc = await userRef.get()
        const userData = userDoc.data()

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
        await propertyRef.delete()

        // 2. Update Limit & Active Check
        const updates: any = {
            deletionRateLimit: {
                count: delLimit.count + 1,
                resetAt: delLimit.resetAt
            }
        }

        if (userData?.activeProperty?.id === propertyId) {
            updates.activeProperty = null
        }

        await userRef.update(updates)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting property:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
