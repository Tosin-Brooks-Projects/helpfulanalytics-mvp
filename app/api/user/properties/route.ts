import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { db } from "@/lib/firebase-admin"

export const dynamic = "force-dynamic"

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

        // Check subscription limit here if we wanted to restrict # of properties
        // For now, we save it as the "active" or "primary" property
        await db.collection("users").doc(userId).set({
            activeProperty: {
                id: propertyId,
                name: propertyName,
                accountId: accountId,
                updatedAt: new Date()
            },
            // Initialize basic subscription if not present
            subscription: {
                tier: "free",
                status: "active",
            }
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
