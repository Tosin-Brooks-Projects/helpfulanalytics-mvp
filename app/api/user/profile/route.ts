import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { db } from "@/lib/firebase-admin"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        // @ts-ignore
        const userId = session?.userId
        console.log("DEBUG: Profile API - Session UserId:", userId)

        if (!userId) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
        }

        const userDoc = await db.collection("users").doc(userId).get()
        console.log("DEBUG: Profile API - Firestore Doc Exists:", userDoc.exists)

        if (!userDoc.exists) {
            console.log("DEBUG: Profile API - User not found in Firestore")
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const userData = userDoc.data()
        console.log("DEBUG: Profile API - Firestore Data:", JSON.stringify(userData, null, 2))

        return NextResponse.json({ ...userData, id: userDoc.id })
    } catch (error) {
        console.error("Error fetching user profile:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
