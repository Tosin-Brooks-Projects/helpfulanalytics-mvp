import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { db } from "@/lib/firebase-admin"
import { pricingData } from "@/config/subscriptions"

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
    // ... rest of existing POST implementation logic ...
    // Note: I need to preserve the POST logic.
    // Since replace_file_content replaces the chunk, I should be careful to only insert GET before POST or handle it correctly.
    // Actually, I should probably reuse the file content if I'm not careful.
    // Wait, let me read the file again to be sure I have the exact context for POST or just append GET before it.
    // I can insert GET before POST.

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

        // Check subscription limit
        const userDoc = await db.collection("users").doc(userId).get()
        const userData = userDoc.data()
        const subscription = userData?.subscription



        // Default to free tier if no subscription
        // Note: We might want to handle "canceled" status by reverting to free limits or blocking access.
        // For now, let's assume active/trialing gives access, others revert to free/starter.
        const tierName = (subscription?.status === 'active' || subscription?.status === 'trialing')
            ? subscription.tier
            : 'starter'

        // Find tier config
        // Case insensitive match
        const tierConfig = pricingData.find(t => t.title.toLowerCase() === tierName?.toLowerCase())
        // Default to Starter limits if not found
        const maxProperties = tierConfig?.maxProperties ?? 1

        // Count existing properties
        const propertiesSnap = await db.collection("users").doc(userId).collection("properties").get()
        const currentCount = propertiesSnap.size

        if (currentCount >= maxProperties) {
            return NextResponse.json({
                error: `Plan limit reached. You can only add ${maxProperties} properties on the ${tierConfig?.title || 'Starter'} plan.`
            }, { status: 403 })
        }

        // We can still update the "active" property reference even if limit is reached 
        // IF the property already exists in the collection.
        // But the previous code was doing a `set` on the user doc for `activeProperty`.
        // Let's assume this endpoint is for "Adding/Selecting" a property. 
        // If it's just selecting, we shouldn't block. 
        // But the code below adds it to the `properties` subcollection. 
        // So we should check if it already exists there.

        const propertyRef = db.collection("users").doc(userId).collection("properties").doc(propertyId.replace("properties/", ""))
        const propertyDoc = await propertyRef.get()

        // If it doesn't exist, we are adding a NEW property -> Check Limit
        if (!propertyDoc.exists && currentCount >= maxProperties) {
            return NextResponse.json({
                error: `Plan limit reached. You can only add ${maxProperties} properties on the ${tierConfig?.title || 'Starter'} plan.`
            }, { status: 403 })
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
                    status: "active",
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
