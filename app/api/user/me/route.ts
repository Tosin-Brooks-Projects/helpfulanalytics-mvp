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

        // Ensure subscription has defaults if missing
        const subscription = userData.subscription || {
            tier: "starter",
            status: "active",
            // If they are brand new and we are just generating this on the fly:
            trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
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
