import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { BetaAnalyticsDataClient } from "@google-analytics/data"

// Note: For properties lists, we strictly should use the Google Analytics Admin API.
// However, @google-analytics/data is primarily for reports.
// We often need 'googleapis' package for account management or plain fetch calls.
// Since we want to keep it simple and likely don't have 'googleapis' installed yet (checking package.json earlier didn't show it),
// we will use a direct fetch to the Admin API.

export async function GET() {
    const session = await getServerSession(authOptions)

    // @ts-ignore
    const accessToken = session?.accessToken

    if (!accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        // List Account Summaries (includes properties)
        const response = await fetch("https://analyticsadmin.googleapis.com/v1beta/accountSummaries", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        })

        if (!response.ok) {
            const error = await response.json()
            return NextResponse.json({ error: error.error?.message || "Failed to fetch properties" }, { status: response.status })
        }

        const data = await response.json()

        // Flatten structure to just get properties with their names and IDs
        const properties = []
        if (data.accountSummaries) {
            for (const account of data.accountSummaries) {
                if (account.propertySummaries) {
                    for (const prop of account.propertySummaries) {
                        properties.push({
                            id: prop.property, // Format: 'properties/123456'
                            name: prop.displayName,
                            accountId: account.account
                        })
                    }
                }
            }
        }

        return NextResponse.json({ properties })
    } catch (error) {
        console.error("Error fetching properties:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
