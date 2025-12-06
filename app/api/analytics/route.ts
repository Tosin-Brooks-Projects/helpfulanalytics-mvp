import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        // @ts-ignore
        if (!session?.accessToken) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const propertyId = searchParams.get("propertyId")
        const reportType = searchParams.get("reportType") || "overview"
        const startDate = searchParams.get("startDate") || "30daysAgo"
        const endDate = searchParams.get("endDate") || "today"

        if (!propertyId) {
            return NextResponse.json({ error: "Property ID is required" }, { status: 400 })
        }

        // @ts-ignore
        const accessToken = session.accessToken

        let response

        switch (reportType) {
            case "overview":
                response = await getOverviewData(accessToken, propertyId, startDate, endDate)
                break
            case "pages":
                response = await getTopPagesData(accessToken, propertyId, startDate, endDate)
                break
            case "devices":
                response = await getDevicesData(accessToken, propertyId, startDate, endDate)
                break
            case "locations":
                response = await getLocationsData(accessToken, propertyId, startDate, endDate)
                break
            case "acquisition":
                response = await getAcquisitionData(accessToken, propertyId, startDate, endDate)
                break
            default:
                return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error("Analytics API error:", error)
        return NextResponse.json(
            { error: "Failed to fetch analytics data", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 },
        )
    }
}

// Helper to run GA4 reports via fetch
async function runReport(accessToken: string, propertyId: string, requestBody: any) {
    const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`GA4 API Error (${response.status}): ${errorText}`)
    }

    return await response.json()
}

async function getOverviewData(accessToken: string, propertyId: string, startDate: string, endDate: string) {
    const [metricsResponse, trafficResponse] = await Promise.all([
        runReport(accessToken, propertyId, {
            dateRanges: [{ startDate, endDate }],
            metrics: [
                { name: "sessions" },
                { name: "totalUsers" },
                { name: "screenPageViews" },
                { name: "bounceRate" },
                { name: "averageSessionDuration" },
            ],
        }),
        runReport(accessToken, propertyId, {
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: "sessionDefaultChannelGroup" }],
            metrics: [{ name: "sessions" }],
            orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
            limit: 10,
        }),
    ])

    const metrics = metricsResponse.rows?.[0]?.metricValues || []
    const trafficSources = trafficResponse.rows || []

    const totalSessions = Number.parseInt(metrics[0]?.value || "0")

    return {
        metrics: {
            sessions: Number.parseInt(metrics[0]?.value || "0"),
            users: Number.parseInt(metrics[1]?.value || "0"),
            pageViews: Number.parseInt(metrics[2]?.value || "0"),
            bounceRate: Number.parseFloat(metrics[3]?.value || "0"),
            avgSessionDuration: Number.parseFloat(metrics[4]?.value || "0"),
        },
        trafficSources: trafficSources.map((row: any) => ({
            source: row.dimensionValues?.[0]?.value || "Unknown",
            sessions: Number.parseInt(row.metricValues?.[0]?.value || "0"),
            percentage:
                totalSessions > 0 ? (Number.parseInt(row.metricValues?.[0]?.value || "0") / totalSessions) * 100 : 0,
        })),
    }
}

async function getTopPagesData(accessToken: string, propertyId: string, startDate: string, endDate: string) {
    const response = await runReport(accessToken, propertyId, {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
        metrics: [
            { name: "screenPageViews" },
            { name: "sessions" },
            { name: "averageSessionDuration" },
            { name: "bounceRate" },
        ],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: 20,
    })

    const rows = response.rows || []
    const totalPageViews = rows.reduce(
        (sum: number, row: any) => sum + Number.parseInt(row.metricValues?.[0]?.value || "0"),
        0,
    )

    return {
        pages: rows.map((row: any) => {
            const pageViews = Number.parseInt(row.metricValues?.[0]?.value || "0")
            return {
                pagePath: row.dimensionValues?.[0]?.value || "/",
                pageTitle: row.dimensionValues?.[1]?.value || "Untitled",
                pageViews,
                uniquePageViews: Number.parseInt(row.metricValues?.[1]?.value || "0"),
                avgTimeOnPage: Number.parseFloat(row.metricValues?.[2]?.value || "0"),
                bounceRate: Number.parseFloat(row.metricValues?.[3]?.value || "0"),
                percentage: totalPageViews > 0 ? (pageViews / totalPageViews) * 100 : 0,
            }
        }),
        totalPageViews,
    }
}

async function getDevicesData(accessToken: string, propertyId: string, startDate: string, endDate: string) {
    const [devicesResponse, browsersResponse] = await Promise.all([
        runReport(accessToken, propertyId, {
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: "deviceCategory" }],
            metrics: [
                { name: "sessions" },
                { name: "totalUsers" },
                { name: "bounceRate" },
                { name: "averageSessionDuration" },
            ],
            orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        }),
        runReport(accessToken, propertyId, {
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: "browser" }],
            metrics: [{ name: "sessions" }],
            orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
            limit: 10,
        }),
    ])

    const deviceRows = devicesResponse.rows || []
    const browserRows = browsersResponse.rows || []

    const totalSessions = deviceRows.reduce(
        (sum: number, row: any) => sum + Number.parseInt(row.metricValues?.[0]?.value || "0"),
        0,
    )
    const totalBrowserSessions = browserRows.reduce(
        (sum: number, row: any) => sum + Number.parseInt(row.metricValues?.[0]?.value || "0"),
        0,
    )

    return {
        devices: deviceRows.map((row: any) => {
            const sessions = Number.parseInt(row.metricValues?.[0]?.value || "0")
            return {
                deviceCategory: row.dimensionValues?.[0]?.value || "Unknown",
                sessions,
                users: Number.parseInt(row.metricValues?.[1]?.value || "0"),
                bounceRate: Number.parseFloat(row.metricValues?.[2]?.value || "0"),
                avgSessionDuration: Number.parseFloat(row.metricValues?.[3]?.value || "0"),
                percentage: totalSessions > 0 ? (sessions / totalSessions) * 100 : 0,
            }
        }),
        browsers: browserRows.map((row: any) => {
            const sessions = Number.parseInt(row.metricValues?.[0]?.value || "0")
            return {
                browser: row.dimensionValues?.[0]?.value || "Unknown",
                sessions,
                percentage: totalBrowserSessions > 0 ? (sessions / totalBrowserSessions) * 100 : 0,
            }
        }),
        totalSessions,
    }
}

async function getLocationsData(accessToken: string, propertyId: string, startDate: string, endDate: string) {
    const response = await runReport(accessToken, propertyId, {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "country" }, { name: "countryId" }],
        metrics: [
            { name: "sessions" },
            { name: "totalUsers" },
            { name: "bounceRate" },
            { name: "averageSessionDuration" },
        ],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 20,
    })

    const rows = response.rows || []
    const totalSessions = rows.reduce(
        (sum: number, row: any) => sum + Number.parseInt(row.metricValues?.[0]?.value || "0"),
        0,
    )

    return {
        countries: rows.map((row: any) => {
            const sessions = Number.parseInt(row.metricValues?.[0]?.value || "0")
            return {
                country: row.dimensionValues?.[0]?.value || "Unknown",
                countryCode: row.dimensionValues?.[1]?.value || "XX",
                sessions,
                users: Number.parseInt(row.metricValues?.[1]?.value || "0"),
                bounceRate: Number.parseFloat(row.metricValues?.[2]?.value || "0"),
                avgSessionDuration: Number.parseFloat(row.metricValues?.[3]?.value || "0"),
                percentage: totalSessions > 0 ? (sessions / totalSessions) * 100 : 0,
            }
        }),
        totalSessions,
    }
}

async function getAcquisitionData(accessToken: string, propertyId: string, startDate: string, endDate: string) {
    const response = await runReport(accessToken, propertyId, {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "sessionSource" }, { name: "sessionMedium" }],
        metrics: [
            { name: "sessions" },
            { name: "totalUsers" },
            { name: "newUsers" },
            { name: "bounceRate" },
            { name: "averageSessionDuration" },
        ],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: 20,
    })

    const rows = response.rows || []
    const totalSessions = rows.reduce(
        (sum: number, row: any) => sum + Number.parseInt(row.metricValues?.[0]?.value || "0"),
        0,
    )

    return {
        sources: rows.map((row: any) => {
            const sessions = Number.parseInt(row.metricValues?.[0]?.value || "0")
            return {
                source: row.dimensionValues?.[0]?.value || "Unknown",
                medium: row.dimensionValues?.[1]?.value || "Unknown",
                sessions,
                users: Number.parseInt(row.metricValues?.[1]?.value || "0"),
                newUsers: Number.parseInt(row.metricValues?.[2]?.value || "0"),
                bounceRate: Number.parseFloat(row.metricValues?.[3]?.value || "0"),
                avgSessionDuration: Number.parseFloat(row.metricValues?.[4]?.value || "0"),
                percentage: totalSessions > 0 ? (sessions / totalSessions) * 100 : 0,
            }
        }),
        totalSessions,
    }
}
