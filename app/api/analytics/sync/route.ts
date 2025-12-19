import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { db as adminDb } from "@/lib/firebase-admin"
import { subDays, format } from "date-fns"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
    // 1. Security Check
    // Ideally this is protected by a secret key for Cron Jobs
    // or strictly limited to authenticated admins.
    // For this MVP, we'll allow any authenticated user to trigger their own sync.
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // @ts-ignore
    const accessToken = session.accessToken
    // @ts-ignore
    const userId = session.user.id || session.userId

    console.log("Sync Route Debug:", {
        hasSession: !!session,
        hasAccessToken: !!accessToken,
        userId,
        userIdType: typeof userId
    })

    if (!accessToken) {
        return NextResponse.json({ error: "No access token found" }, { status: 401 })
    }

    try {
        // 2. Fetch Targeted or All Properties
        const { searchParams } = new URL(req.url)
        const propertyIdOverride = searchParams.get("propertyId")

        let properties = []

        if (propertyIdOverride) {
            // Targeted sync for a single property
            if (propertyIdOverride === "demo-property") {
                properties = [{ id: "demo-property", name: "Demo Property" }]
            } else {
                // We still need the display name, but for now we'll just use the ID as name
                // or fetch account summaries if needed.
                properties = [{ id: propertyIdOverride, name: "Selected Property" }]
            }
        } else {
            // Full sync: Fetch User Properties
            const propertiesRes = await fetch("https://analyticsadmin.googleapis.com/v1beta/accountSummaries", {
                headers: { Authorization: `Bearer ${accessToken}` },
            })
            const propertiesData = await propertiesRes.json()

            if (propertiesData.accountSummaries) {
                for (const account of propertiesData.accountSummaries) {
                    if (account.propertySummaries) {
                        for (const prop of account.propertySummaries) {
                            properties.push({
                                id: prop.property,
                                name: prop.displayName
                            })
                        }
                    }
                }
            }
            // Add Demo Property to list
            properties.push({ id: "demo-property", name: "Demo Property" })
        }

        // 3. Define Date Range (Yesterday)
        const yesterday = subDays(new Date(), 1)
        const dateStr = format(yesterday, "yyyy-MM-dd") // "2023-10-25"

        const results = []

        // 4. Loop & Sync
        for (const prop of properties) {
            let metricsPromise

            if (prop.id === "demo-property") {
                metricsPromise = Promise.resolve({
                    sessions: Math.floor(Math.random() * 5000) + 1000,
                    bounceRate: Math.random() * 0.5 + 0.2,
                    users: Math.floor(Math.random() * 4000) + 800,
                    pageViews: Math.floor(Math.random() * 15000) + 3000,
                    avgSessionDuration: Math.floor(Math.random() * 200) + 60
                })
            } else {
                metricsPromise = runReport(accessToken, prop.id, {
                    dateRanges: [{ startDate: dateStr, endDate: dateStr }],
                    metrics: [
                        { name: "sessions" },
                        { name: "bounceRate" },
                        { name: "totalUsers" },
                        { name: "screenPageViews" },
                        { name: "averageSessionDuration" }
                    ]
                }).then(data => {
                    const m = data.rows?.[0]?.metricValues
                    return {
                        sessions: parseInt(m?.[0]?.value || "0"),
                        bounceRate: parseFloat(m?.[1]?.value || "0"),
                        users: parseInt(m?.[2]?.value || "0"),
                        pageViews: parseInt(m?.[3]?.value || "0"),
                        avgSessionDuration: parseFloat(m?.[4]?.value || "0")
                    }
                })
            }

            try {
                const metrics = await metricsPromise

                // 5. Store in Firestore
                const safePropId = prop.id.replace("/", "_")

                console.log(`Syncing property: ${prop.name}`, {
                    userId,
                    safePropId,
                    dateStr,
                    metricsSet: !!metrics
                })

                if (!userId) throw new Error("User ID is missing for Firestore path")
                if (!safePropId) throw new Error("Property ID is missing for Firestore path")

                await adminDb
                    .collection("users")
                    .doc(userId)
                    .collection("properties")
                    .doc(safePropId)
                    .collection("daily_metrics")
                    .doc(dateStr)
                    .set({
                        ...metrics,
                        date: dateStr,
                        syncedAt: new Date().toISOString()
                    })

                results.push({ property: prop.name, status: "synced", metrics })

            } catch (err: any) {
                console.error(`Failed to sync ${prop.name}:`, err)
                results.push({ property: prop.name, status: "failed", error: err.message })
            }
        }

        return NextResponse.json({ success: true, date: dateStr, results })

    } catch (error: any) {
        console.error("Sync error:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

async function runReport(accessToken: string, propertyId: string, requestBody: any) {
    const resourceName = propertyId.startsWith("properties/") ? propertyId : `properties/${propertyId}`
    const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/${resourceName}:runReport`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
        const txt = await response.text()
        throw new Error(txt)
    }
    return await response.json()
}
