import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { BetaAnalyticsDataClient } from "@google-analytics/data"
import { logOnboardingEvent } from "@/lib/onboarding/log"

// Note: For properties lists, we strictly should use the Google Analytics Admin API.
// However, @google-analytics/data is primarily for reports.
// We often need 'googleapis' package for account management or plain fetch calls.
// Since we want to keep it simple and likely don't have 'googleapis' installed yet (checking package.json earlier didn't show it),
// we will use a direct fetch to the Admin API.

export const dynamic = "force-dynamic"

export async function GET() {
    const session = await getServerSession(authOptions)
    // @ts-ignore
    const userId = session?.userId
    const email = session?.user?.email

    await logOnboardingEvent({ userId, email, step: "fetch_properties.start", status: "info" })

    // @ts-ignore
    if (session?.error === "RefreshAccessTokenError") {
        await logOnboardingEvent({
            userId, email, step: "fetch_properties.refresh_token_error", status: "error",
            message: "Google access token refresh failed (likely missing refresh_token)",
        })
        return NextResponse.json({ error: "ReauthRequired" }, { status: 401 })
    }

    // @ts-ignore
    const accessToken = session?.accessToken

    if (!accessToken) {
        await logOnboardingEvent({
            userId, email, step: "fetch_properties.no_access_token", status: "error",
            message: "No access token on session",
        })
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
            await logOnboardingEvent({
                userId, email, step: "fetch_properties.admin_api_error", status: "error",
                message: error.error?.message || "Failed to fetch properties",
                meta: { status: response.status },
            })
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

        // Inject Demo Property for all users
        properties.push({
            id: "demo-property",
            name: "Demo Property (Mock Data)",
            accountId: "demo-account"
        })

        await logOnboardingEvent({
            userId, email, step: "fetch_properties.success", status: "info",
            meta: { count: properties.length },
        })

        return NextResponse.json({ properties })
    } catch (error: any) {
        await logOnboardingEvent({
            userId, email, step: "fetch_properties.exception", status: "error",
            message: error?.message || String(error),
        })
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
