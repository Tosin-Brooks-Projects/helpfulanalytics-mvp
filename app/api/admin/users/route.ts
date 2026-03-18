import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { db } from "@/lib/firebase-admin"
import { getSubscriptionStatus } from "@/lib/subscription"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const requesterDoc = await db.collection("users").doc(session.user.id).get()
    const requesterRole = requesterDoc.exists ? requesterDoc.data()?.role : undefined
    if (requesterRole !== "admin") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
        const snapshot = await db.collection("users")
            .orderBy("createdAt", "desc")
            .limit(100)
            .get()

        const users = snapshot.docs.map(doc => {
            const data = doc.data()
            const subInfo = getSubscriptionStatus(data)
            return {
                id: doc.id,
                email: data.email,
                name: data.name,
                image: data.image,
                role: data.role || "user",
                tier: (data.subscription?.tier as string) || "starter",
                status: subInfo.status,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
                lastSeen: data.lastSeen?.toDate ? data.lastSeen.toDate().toISOString() : data.lastSeen,
                isOnboarded: data.isOnboarded ?? false,
            }
        })

        return NextResponse.json({ users })
    } catch (error) {
        console.error("Admin users error:", error)
        return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }
}
