import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { db } from "@/lib/firebase-admin"

export const dynamic = "force-dynamic"

export async function GET() {
    const session = await getServerSession(authOptions)

    // @ts-ignore
    if (!session?.userId) {
        return new NextResponse("Unauthorized", { status: 401 })
    }

    try {
        // @ts-ignore
        const userId = session.userId
        const userDoc = await db.collection("users").doc(userId).get()
        const userData = userDoc.data()

        // If no user data yet (rare if logged in, but possible), return basics
        if (!userData) {
            return NextResponse.json({})
        }

        // Build subscription with defaults
        const rawSub = userData.subscription || {
            tier: "starter",
            status: "active",
        }

        // Serialize Firestore Timestamps to ISO strings
        const subscription: Record<string, any> = { ...rawSub }

        if (subscription.stripeCurrentPeriodEnd) {
            // Firestore Timestamp has toDate(), plain Date has toISOString()
            const d = subscription.stripeCurrentPeriodEnd
            subscription.stripeCurrentPeriodEnd = typeof d.toDate === 'function'
                ? d.toDate().toISOString()
                : d instanceof Date
                    ? d.toISOString()
                    : d
        }

        if (subscription.trialEndsAt) {
            const d = subscription.trialEndsAt
            subscription.trialEndsAt = typeof d.toDate === 'function'
                ? d.toDate().toISOString()
                : d instanceof Date
                    ? d.toISOString()
                    : d
        }

        // For trial/starter users without an explicit end date, compute from account creation
        if (!subscription.stripeCurrentPeriodEnd && !subscription.trialEndsAt) {
            const createdAt = userData.createdAt
            if (createdAt) {
                const created = typeof createdAt.toDate === 'function'
                    ? createdAt.toDate()
                    : new Date(createdAt)
                subscription.trialEndsAt = new Date(created.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString()
            } else {
                subscription.trialEndsAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
            }
        }

        return NextResponse.json({
            id: userId,
            email: session.user?.email,
            subscription
        })

    } catch (error) {
        console.error("Error fetching user data:", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
