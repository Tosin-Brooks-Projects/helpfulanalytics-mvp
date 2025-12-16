import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        // @ts-ignore
        if (!session) {
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

        let response

        // Check for Demo Property
        if (propertyId === "demo-property") {
            switch (reportType) {
                case "overview": response = await getMockOverviewData(); break;
                case "pages": response = await getMockTopPagesData(); break;
                case "devices": response = await getMockDevicesData(); break;
                case "locations": response = await getMockLocationsData(); break;
                case "acquisition": response = await getMockAcquisitionData(); break;
                case "realtime": response = await getMockRealtimeData(); break;
                default:
                    return NextResponse.json({ error: "Invalid report type" }, { status: 400 })
            }
            return NextResponse.json(response)
        }

        // Real Google Analytics Data Fetching
        // @ts-ignore
        const accessToken = session.accessToken

        // Check if access token exists for real data only
        if (!accessToken) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
        }

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
            case "realtime":
                response = await getRealtimeData(accessToken, propertyId)
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

// Mock Data Generators for Demo Property
export async function getMockOverviewData() {
    return {
        metrics: {
            sessions: 12543,
            users: 8932,
            pageViews: 45210,
            bounceRate: 0.42,
            avgSessionDuration: 185,
        },
        trafficSources: [
            { source: "Direct", sessions: 4500, percentage: 35.8 },
            { source: "Organic Search", sessions: 3800, percentage: 30.2 },
            { source: "Social", sessions: 2100, percentage: 16.7 },
            { source: "Referral", sessions: 1500, percentage: 11.9 },
            { source: "Email", sessions: 643, percentage: 5.1 },
        ],
    }
}

async function getMockTopPagesData() {
    const pages = [
        { path: "/", title: "Home | Linear Analytics", views: 12000 },
        { path: "/features", title: "Features - Powerful Insights", views: 8500 },
        { path: "/pricing", title: "Pricing & Plans", views: 6200 },
        { path: "/blog/analytics-tips", title: "5 Tips for Better Analytics", views: 4100 },
        { path: "/docs/getting-started", title: "Documentation: Getting Started", views: 3500 },
        { path: "/login", title: "Login", views: 2800 },
        { path: "/signup", title: "Create Account", views: 2100 },
        { path: "/blog/trends-2024", title: "Analytics Trends for 2024", views: 1800 },
        { path: "/about", title: "About Us", views: 1500 },
        { path: "/contact", title: "Contact Support", views: 1200 },
    ]

    const totalViews = pages.reduce((acc, p) => acc + p.views, 0)

    return {
        pages: pages.map(p => ({
            pagePath: p.path,
            pageTitle: p.title,
            pageViews: p.views,
            uniquePageViews: Math.floor(p.views * 0.8),
            avgTimeOnPage: Math.floor(Math.random() * 60) + 30,
            bounceRate: Number((Math.random() * 0.4 + 0.3).toFixed(2)),
            percentage: (p.views / totalViews) * 100
        })),
        totalPageViews: totalViews
    }
}

async function getMockDevicesData() {
    return {
        devices: [
            { deviceCategory: "desktop", sessions: 6500, users: 5000, bounceRate: 0.38, avgSessionDuration: 210, percentage: 51.8 },
            { deviceCategory: "mobile", sessions: 5200, users: 4100, bounceRate: 0.52, avgSessionDuration: 140, percentage: 41.4 },
            { deviceCategory: "tablet", sessions: 843, users: 700, bounceRate: 0.45, avgSessionDuration: 180, percentage: 6.7 },
        ],
        browsers: [
            { browser: "Chrome", sessions: 7200, percentage: 57.3 },
            { browser: "Safari", sessions: 3100, percentage: 24.7 },
            { browser: "Firefox", sessions: 1200, percentage: 9.5 },
            { browser: "Edge", sessions: 800, percentage: 6.3 },
            { browser: "Other", sessions: 243, percentage: 1.9 },
        ],
        totalSessions: 12543
    }
}

async function getMockLocationsData() {
    return {
        countries: [
            { country: "United States", countryCode: "US", sessions: 5400, percentage: 43 },
            { country: "United Kingdom", countryCode: "GB", sessions: 1800, percentage: 14.3 },
            { country: "Germany", countryCode: "DE", sessions: 1200, percentage: 9.5 },
            { country: "Canada", countryCode: "CA", sessions: 950, percentage: 7.5 },
            { country: "India", countryCode: "IN", sessions: 850, percentage: 6.7 },
            { country: "France", countryCode: "FR", sessions: 700, percentage: 5.5 },
            { country: "Australia", countryCode: "AU", sessions: 600, percentage: 4.7 },
            { country: "Brazil", countryCode: "BR", sessions: 500, percentage: 3.9 },
            { country: "Japan", countryCode: "JP", sessions: 350, percentage: 2.7 },
            { country: "Netherlands", countryCode: "NL", sessions: 193, percentage: 1.5 },
        ],
        totalSessions: 12543
    }
}

async function getMockAcquisitionData() {
    return {
        sources: [
            { source: "google", medium: "organic", sessions: 4200, users: 3100, newUsers: 2800, bounceRate: 0.41, avgSessionDuration: 190, percentage: 33.4 },
            { source: "(direct)", medium: "(none)", sessions: 3800, users: 2900, newUsers: 1500, bounceRate: 0.35, avgSessionDuration: 220, percentage: 30.2 },
            { source: "twitter.com", medium: "referral", sessions: 1200, users: 950, newUsers: 800, bounceRate: 0.48, avgSessionDuration: 150, percentage: 9.5 },
            { source: "newsletter", medium: "email", sessions: 950, users: 800, newUsers: 200, bounceRate: 0.32, avgSessionDuration: 240, percentage: 7.5 },
            { source: "linkedin.com", medium: "referral", sessions: 850, users: 700, newUsers: 600, bounceRate: 0.55, avgSessionDuration: 170, percentage: 6.7 },
        ],
        totalSessions: 12543
    }
}

async function getMockRealtimeData() {
    return {
        activeUsers: Math.floor(Math.random() * 50) + 20, // Random between 20-70
        pages: [
            { path: "/", title: "Home", active: Math.floor(Math.random() * 15) + 5 },
            { path: "/features", title: "Features", active: Math.floor(Math.random() * 8) + 2 },
            { path: "/pricing", title: "Pricing", active: Math.floor(Math.random() * 5) + 1 },
            { path: "/blog/analytics-tips", title: "Blog Post", active: Math.floor(Math.random() * 4) + 1 },
            { path: "/docs", title: "Documentation", active: Math.floor(Math.random() * 3) + 1 },
        ]
    }
}

// Helper to run GA4 reports via fetch
export async function runReport(accessToken: string, propertyId: string, requestBody: any) {
    // propertyId coming from DB/Frontend is usually 'properties/12345' (Full Resource Name)
    // If it *doesn't* start with 'properties/', we might need to add it, but based on our setup it does.
    // The API expects: https://analyticsdata.googleapis.com/v1beta/properties/12345:runReport
    // So if propertyId is 'properties/12345', we should use `.../v1beta/${propertyId}:runReport`

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
        const errorText = await response.text()
        throw new Error(`GA4 API Error (${response.status}): ${errorText}`)
    }

    return await response.json()
}

export async function getOverviewData(accessToken: string, propertyId: string, startDate: string, endDate: string) {
    const [metricsResponse, trafficResponse, pagesResponse, locationsResponse] = await Promise.all([
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
        runReport(accessToken, propertyId, {
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
            metrics: [{ name: "screenPageViews" }],
            orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
            limit: 10,
        }),
        runReport(accessToken, propertyId, {
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: "country" }],
            metrics: [{ name: "sessions" }],
            orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
            limit: 10,
        }),
    ])

    const metrics = metricsResponse.rows?.[0]?.metricValues || []
    const trafficSources = trafficResponse.rows || []
    const pageRows = pagesResponse.rows || []
    const countryRows = locationsResponse.rows || []

    const totalSessions = Number.parseInt(metrics[0]?.value || "0")
    const totalPageViews = Number.parseInt(metrics[2]?.value || "0")

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
        topPages: pageRows.map((row: any) => ({
            path: row.dimensionValues?.[0]?.value || "/",
            title: row.dimensionValues?.[1]?.value || "Untitled",
            views: Number.parseInt(row.metricValues?.[0]?.value || "0"),
            percentage: totalPageViews > 0 ? (Number.parseInt(row.metricValues?.[0]?.value || "0") / totalPageViews) * 100 : 0,
        })),
        topCountries: countryRows.map((row: any) => ({
            country: row.dimensionValues?.[0]?.value || "Unknown",
            sessions: Number.parseInt(row.metricValues?.[0]?.value || "0"),
            percentage: totalSessions > 0 ? (Number.parseInt(row.metricValues?.[0]?.value || "0") / totalSessions) * 100 : 0,
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

async function getRealtimeData(accessToken: string, propertyId: string) {
    // GA4 Realtime API
    const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            metrics: [{ name: "activeUsers" }],
            dimensions: [{ name: "unifiedScreenName" }], // or pagePath
            limit: 10,
        }),
    })

    if (!response.ok) {
        // Fallback or throw
        return { activeUsers: 0, pages: [] }
    }

    const data = await response.json()
    const rows = data.rows || []

    const totalActive = rows.reduce((sum: number, row: any) => sum + parseInt(row.metricValues?.[0]?.value || "0"), 0)

    return {
        activeUsers: totalActive,
        pages: rows.map((row: any) => ({
            path: row.dimensionValues?.[0]?.value || "Unknown",
            active: parseInt(row.metricValues?.[0]?.value || "0"),
            title: row.dimensionValues?.[0]?.value || "Unknown", // Realtime API is limited on dimensions
        })),
    }
}
