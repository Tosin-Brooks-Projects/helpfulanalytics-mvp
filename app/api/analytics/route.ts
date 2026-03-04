import { getOverviewData, getMockOverviewData, getMockOverviewComparisonData } from "@/lib/analytics/ga4"

import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export const dynamic = "force-dynamic"

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
        const compareStartDate = searchParams.get("compareStartDate")
        const compareEndDate = searchParams.get("compareEndDate")

        const country = searchParams.get("country")

        // Allow clients to request more data for exports, default to 1000 for robust exports, or component specific default
        const limitParam = searchParams.get("limit")
        const limit = limitParam ? parseInt(limitParam) : undefined

        if (!propertyId) {
            return NextResponse.json({ error: "Property ID is required" }, { status: 400 })
        }

        let response

        // Check for Demo Property
        if (propertyId === "demo-property") {
            switch (reportType) {
                case "overview":
                    if (compareStartDate && compareEndDate) {
                        response = await getMockOverviewComparisonData()
                    } else {
                        response = await getMockOverviewData()
                    }
                    break;
                case "pages":
                    if (compareStartDate && compareEndDate) {
                        response = {
                            pagesComparison: [
                                { name: "/", value: 15400, previous: 12000, delta: 28.3 },
                                { name: "/pricing", value: 4500, previous: 3800, delta: 18.4 },
                                { name: "/blog/trends-2024", value: 3200, previous: 800, delta: 300 },
                                { name: "/features", value: 2800, previous: 2900, delta: -3.4 },
                                { name: "/contact", value: 1200, previous: 1100, delta: 9.1 }
                            ]
                        }
                    } else {
                        response = await getMockTopPagesData()
                    }
                    break;
                case "devices":
                    if (compareStartDate && compareEndDate) {
                        response = {
                            deviceComparison: [
                                { name: "mobile", value: 12500, previous: 10000, delta: 25, users: 8000 },
                                { name: "desktop", value: 8500, previous: 9000, delta: -5.5, users: 4000 },
                                { name: "tablet", value: 1200, previous: 1100, delta: 9.1, users: 800 }
                            ]
                        }
                    } else {
                        response = await getMockDevicesData()
                    }
                    break;
                case "locations":
                    if (compareStartDate && compareEndDate) {
                        response = {
                            locationComparison: [
                                { name: "United States", value: 8500, previous: 8000, delta: 6.25 },
                                { name: "United Kingdom", value: 2100, previous: 1900, delta: 10.5 },
                                { name: "Germany", value: 1800, previous: 2000, delta: -10 },
                                { name: "Canada", value: 1200, previous: 1100, delta: 9.1 },
                                { name: "India", value: 950, previous: 400, delta: 137.5 }
                            ]
                        }
                    } else {
                        response = await getMockLocationsData()
                    }
                    break;
                case "acquisition":
                    if (compareStartDate && compareEndDate) {
                        response = {
                            acquisitionComparison: [
                                { name: "Organic Search", value: 12000, previous: 10000, delta: 20 },
                                { name: "Direct", value: 5000, previous: 5200, delta: -3.8 },
                                { name: "Referral", value: 3000, previous: 1500, delta: 100 },
                                { name: "Organic Social", value: 2500, previous: 2000, delta: 25 },
                                { name: "Email", value: 1500, previous: 1200, delta: 25 }
                            ]
                        }
                    } else {
                        response = await getMockAcquisitionData()
                    }
                    break;
                case "audience":
                    if (compareStartDate && compareEndDate) {
                        response = {
                            locationComparison: [
                                { name: "United States", value: 8500, previous: 8000, delta: 6.25 },
                                { name: "United Kingdom", value: 2100, previous: 1900, delta: 10.5 },
                                { name: "Germany", value: 1800, previous: 2000, delta: -10 },
                                { name: "Canada", value: 1200, previous: 1100, delta: 9.1 },
                                { name: "India", value: 950, previous: 400, delta: 137.5 }
                            ]
                        }
                    } else {
                        response = await getMockLocationsData()
                    }
                    break;
                case "sources":
                    if (compareStartDate && compareEndDate) {
                        response = {
                            acquisitionComparison: [
                                { name: "Organic Search", value: 12000, previous: 10000, delta: 20 },
                                { name: "Direct", value: 5000, previous: 5200, delta: -3.8 },
                                { name: "Referral", value: 3000, previous: 1500, delta: 100 },
                                { name: "Organic Social", value: 2500, previous: 2000, delta: 25 },
                                { name: "Email", value: 1500, previous: 1200, delta: 25 }
                            ]
                        }
                    } else {
                        response = await getMockAcquisitionData()
                    }
                    break;
                case "cities":
                    response = await getMockCitiesData(country || "United States")
                    break;
                case "states":
                    response = await getMockStatesData(country || "United States")
                    break;
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
                if (compareStartDate && compareEndDate) {
                    response = await getOverviewComparisonData(accessToken, propertyId, startDate, endDate, compareStartDate, compareEndDate, limit)
                } else {
                    response = await getOverviewData(accessToken, propertyId, startDate, endDate, limit)
                }
                break
            case "pages":
                if (compareStartDate && compareEndDate) {
                    response = await getTopPagesComparisonData(accessToken, propertyId, startDate, endDate, compareStartDate, compareEndDate, limit)
                } else {
                    response = await getTopPagesData(accessToken, propertyId, startDate, endDate, limit)
                }
                break
            case "devices":
                if (compareStartDate && compareEndDate) {
                    response = await getDevicesComparisonData(accessToken, propertyId, startDate, endDate, compareStartDate, compareEndDate, limit)
                } else {
                    response = await getDevicesData(accessToken, propertyId, startDate, endDate, limit)
                }
                break
            case "locations":
                if (compareStartDate && compareEndDate) {
                    response = await getLocationsComparisonData(accessToken, propertyId, startDate, endDate, compareStartDate, compareEndDate, limit)
                } else {
                    response = await getLocationsData(accessToken, propertyId, startDate, endDate, limit)
                }
                break
            case "audience":
                if (compareStartDate && compareEndDate) {
                    response = await getLocationsComparisonData(accessToken, propertyId, startDate, endDate, compareStartDate, compareEndDate, limit)
                } else {
                    response = await getAudienceData(accessToken, propertyId, startDate, endDate, limit)
                }
                break
            case "sources":
                if (compareStartDate && compareEndDate) {
                    response = await getAcquisitionComparisonData(accessToken, propertyId, startDate, endDate, compareStartDate, compareEndDate, limit)
                } else {
                    response = await getSourcesData(accessToken, propertyId, startDate, endDate, limit)
                }
                break
            case "acquisition":
                if (compareStartDate && compareEndDate) {
                    response = await getAcquisitionComparisonData(accessToken, propertyId, startDate, endDate, compareStartDate, compareEndDate, limit)
                } else {
                    response = await getAcquisitionData(accessToken, propertyId, startDate, endDate, limit)
                }
                break
            case "cities":
                response = await getCitiesData(accessToken, propertyId, startDate, endDate, country || "United States", limit)
                break
            case "states":
                response = await getStatesData(accessToken, propertyId, startDate, endDate, country || "United States", limit)
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
        os: [
            { name: "Windows", sessions: 4500, percentage: 35.8 },
            { name: "iOS", sessions: 3800, percentage: 30.2 },
            { name: "Macintosh", sessions: 2100, percentage: 16.7 },
            { name: "Android", sessions: 1800, percentage: 14.3 },
            { name: "Linux", sessions: 343, percentage: 2.7 },
        ],
        screens: [
            { resolution: "1920x1080", sessions: 3200, percentage: 25.5 },
            { resolution: "390x844", sessions: 2100, percentage: 16.7 },
            { resolution: "1440x900", sessions: 1500, percentage: 11.9 },
            { resolution: "375x812", sessions: 1200, percentage: 9.5 },
            { resolution: "1366x768", sessions: 800, percentage: 6.3 },
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

async function getMockCitiesData(country: string) {
    const citiesByCountry: Record<string, Array<{ city: string; sessions: number; users: number; bounceRate: number; avgSessionDuration: number }>> = {
        "United States": [
            { city: "New York", sessions: 1200, users: 980, bounceRate: 0.38, avgSessionDuration: 195 },
            { city: "Los Angeles", sessions: 850, users: 690, bounceRate: 0.42, avgSessionDuration: 175 },
            { city: "Chicago", sessions: 620, users: 510, bounceRate: 0.40, avgSessionDuration: 185 },
            { city: "Houston", sessions: 480, users: 390, bounceRate: 0.45, avgSessionDuration: 160 },
            { city: "San Francisco", sessions: 450, users: 370, bounceRate: 0.35, avgSessionDuration: 210 },
            { city: "Seattle", sessions: 380, users: 310, bounceRate: 0.36, avgSessionDuration: 200 },
            { city: "Austin", sessions: 340, users: 280, bounceRate: 0.39, avgSessionDuration: 190 },
            { city: "Miami", sessions: 280, users: 230, bounceRate: 0.44, avgSessionDuration: 155 },
        ],
        "United Kingdom": [
            { city: "London", sessions: 720, users: 590, bounceRate: 0.37, avgSessionDuration: 200 },
            { city: "Manchester", sessions: 310, users: 250, bounceRate: 0.41, avgSessionDuration: 180 },
            { city: "Birmingham", sessions: 220, users: 180, bounceRate: 0.43, avgSessionDuration: 170 },
            { city: "Edinburgh", sessions: 180, users: 145, bounceRate: 0.39, avgSessionDuration: 185 },
            { city: "Bristol", sessions: 140, users: 115, bounceRate: 0.40, avgSessionDuration: 175 },
            { city: "Leeds", sessions: 120, users: 98, bounceRate: 0.42, avgSessionDuration: 165 },
        ],
        "Germany": [
            { city: "Berlin", sessions: 420, users: 340, bounceRate: 0.36, avgSessionDuration: 205 },
            { city: "Munich", sessions: 280, users: 225, bounceRate: 0.38, avgSessionDuration: 195 },
            { city: "Hamburg", sessions: 190, users: 155, bounceRate: 0.41, avgSessionDuration: 180 },
            { city: "Frankfurt", sessions: 160, users: 130, bounceRate: 0.40, avgSessionDuration: 185 },
            { city: "Cologne", sessions: 95, users: 78, bounceRate: 0.43, avgSessionDuration: 170 },
        ],
    }

    const cities = citiesByCountry[country] || [
        { city: "Capital City", sessions: 350, users: 285, bounceRate: 0.40, avgSessionDuration: 180 },
        { city: "Second City", sessions: 200, users: 160, bounceRate: 0.42, avgSessionDuration: 170 },
        { city: "Third City", sessions: 120, users: 98, bounceRate: 0.44, avgSessionDuration: 160 },
        { city: "Fourth City", sessions: 80, users: 65, bounceRate: 0.46, avgSessionDuration: 150 },
    ]

    const totalSessions = cities.reduce((sum, c) => sum + c.sessions, 0)
    return {
        cities: cities.map(c => ({
            ...c,
            percentage: totalSessions > 0 ? (c.sessions / totalSessions) * 100 : 0,
        })),
        totalSessions,
        country,
    }
}

async function getMockStatesData(country: string) {
    const statesByCountry: Record<string, Array<{ state: string; sessions: number; users: number; bounceRate: number; avgSessionDuration: number }>> = {
        "United States": [
            { state: "California", sessions: 2500, users: 2100, bounceRate: 0.35, avgSessionDuration: 210 },
            { state: "New York", sessions: 1800, users: 1500, bounceRate: 0.38, avgSessionDuration: 195 },
            { state: "Texas", sessions: 1500, users: 1200, bounceRate: 0.40, avgSessionDuration: 180 },
            { state: "Florida", sessions: 1200, users: 950, bounceRate: 0.42, avgSessionDuration: 175 },
            { state: "Illinois", sessions: 900, users: 750, bounceRate: 0.39, avgSessionDuration: 185 },
            { state: "Washington", sessions: 750, users: 600, bounceRate: 0.37, avgSessionDuration: 200 },
            { state: "Pennsylvania", sessions: 600, users: 480, bounceRate: 0.41, avgSessionDuration: 165 },
        ]
    }

    const states = statesByCountry[country] || [
        { state: "Region 1", sessions: 1500, users: 1200, bounceRate: 0.38, avgSessionDuration: 180 },
        { state: "Region 2", sessions: 900, users: 750, bounceRate: 0.40, avgSessionDuration: 175 },
        { state: "Region 3", sessions: 600, users: 480, bounceRate: 0.42, avgSessionDuration: 165 },
    ]

    const totalSessions = states.reduce((sum, s) => sum + s.sessions, 0)
    return {
        states: states.map(s => ({
            ...s,
            percentage: totalSessions > 0 ? (s.sessions / totalSessions) * 100 : 0,
        })),
        totalSessions,
        country,
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
    // So if propertyId is 'properties/12345', we should use `.../v1beta/${ propertyId }: runReport`

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


async function getTopPagesData(accessToken: string, propertyId: string, startDate: string, endDate: string, limit: number = 20) {
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
        limit: limit,
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

async function getDevicesData(accessToken: string, propertyId: string, startDate: string, endDate: string, limit: number = 10) {
    const [devicesResponse, browsersResponse, osResponse, screenResponse] = await Promise.all([
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
            limit: limit,
        }),
        runReport(accessToken, propertyId, {
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: "operatingSystem" }],
            metrics: [{ name: "sessions" }],
            orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
            limit: limit,
        }),
        runReport(accessToken, propertyId, {
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: "screenResolution" }],
            metrics: [{ name: "sessions" }],
            orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
            limit: limit,
        }),
    ])

    const deviceRows = devicesResponse.rows || []
    const browserRows = browsersResponse.rows || []
    const osRows = osResponse.rows || []
    const screenRows = screenResponse.rows || []

    const totalSessions = deviceRows.reduce(
        (sum: number, row: any) => sum + Number.parseInt(row.metricValues?.[0]?.value || "0"),
        0,
    )

    // Helper for percentage calc
    const calcPercentage = (val: number) => totalSessions > 0 ? (val / totalSessions) * 100 : 0

    return {
        devices: deviceRows.map((row: any) => {
            const sessions = Number.parseInt(row.metricValues?.[0]?.value || "0")
            return {
                deviceCategory: row.dimensionValues?.[0]?.value || "Unknown",
                sessions,
                users: Number.parseInt(row.metricValues?.[1]?.value || "0"),
                bounceRate: Number.parseFloat(row.metricValues?.[2]?.value || "0"),
                avgSessionDuration: Number.parseFloat(row.metricValues?.[3]?.value || "0"),
                percentage: calcPercentage(sessions),
            }
        }),
        browsers: browserRows.map((row: any) => {
            const sessions = Number.parseInt(row.metricValues?.[0]?.value || "0")
            return {
                browser: row.dimensionValues?.[0]?.value || "Unknown",
                sessions,
                percentage: calcPercentage(sessions),
            }
        }),
        os: osRows.map((row: any) => {
            const sessions = Number.parseInt(row.metricValues?.[0]?.value || "0")
            return {
                name: row.dimensionValues?.[0]?.value || "Unknown",
                sessions,
                percentage: calcPercentage(sessions),
            }
        }),
        screens: screenRows.map((row: any) => {
            const sessions = Number.parseInt(row.metricValues?.[0]?.value || "0")
            return {
                resolution: row.dimensionValues?.[0]?.value || "Unknown",
                sessions,
                percentage: calcPercentage(sessions),
            }
        }),
        totalSessions,
    }
}

async function getLocationsData(accessToken: string, propertyId: string, startDate: string, endDate: string, limit: number = 20) {
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
        limit: limit,
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

async function getCitiesData(accessToken: string, propertyId: string, startDate: string, endDate: string, country: string, limit: number = 20) {
    const response = await runReport(accessToken, propertyId, {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "city" }],
        metrics: [
            { name: "sessions" },
            { name: "totalUsers" },
            { name: "bounceRate" },
            { name: "averageSessionDuration" },
        ],
        dimensionFilter: {
            filter: {
                fieldName: "country",
                stringFilter: {
                    matchType: "EXACT",
                    value: country,
                },
            },
        },
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: limit,
    })

    const rows = response.rows || []
    const totalSessions = rows.reduce(
        (sum: number, row: any) => sum + Number.parseInt(row.metricValues?.[0]?.value || "0"),
        0,
    )

    return {
        cities: rows.map((row: any) => {
            const sessions = Number.parseInt(row.metricValues?.[0]?.value || "0")
            return {
                city: row.dimensionValues?.[0]?.value || "Unknown",
                sessions,
                users: Number.parseInt(row.metricValues?.[1]?.value || "0"),
                bounceRate: Number.parseFloat(row.metricValues?.[2]?.value || "0"),
                avgSessionDuration: Number.parseFloat(row.metricValues?.[3]?.value || "0"),
                percentage: totalSessions > 0 ? (sessions / totalSessions) * 100 : 0,
            }
        }),
        totalSessions,
        country,
    }
}

async function getStatesData(accessToken: string, propertyId: string, startDate: string, endDate: string, country: string, limit: number = 20) {
    const response = await runReport(accessToken, propertyId, {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "region" }],
        metrics: [
            { name: "sessions" },
            { name: "totalUsers" },
            { name: "bounceRate" },
            { name: "averageSessionDuration" },
        ],
        dimensionFilter: {
            filter: {
                fieldName: "country",
                stringFilter: {
                    matchType: "EXACT",
                    value: country,
                },
            },
        },
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: limit,
    })

    const rows = response.rows || []
    const totalSessions = rows.reduce(
        (sum: number, row: any) => sum + Number.parseInt(row.metricValues?.[0]?.value || "0"),
        0,
    )

    return {
        states: rows.map((row: any) => {
            const sessions = Number.parseInt(row.metricValues?.[0]?.value || "0")
            return {
                state: row.dimensionValues?.[0]?.value || "Unknown",
                sessions,
                users: Number.parseInt(row.metricValues?.[1]?.value || "0"),
                bounceRate: Number.parseFloat(row.metricValues?.[2]?.value || "0"),
                avgSessionDuration: Number.parseFloat(row.metricValues?.[3]?.value || "0"),
                percentage: totalSessions > 0 ? (sessions / totalSessions) * 100 : 0,
            }
        }),
        totalSessions,
        country,
    }
}

export async function getAcquisitionData(accessToken: string, propertyId: string, startDate: string, endDate: string, limit: number = 20) {
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
        limit: limit,
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

async function getAudienceData(accessToken: string, propertyId: string, startDate: string, endDate: string, limit: number = 20) {
    // Reusing getLocationsData logic as it returns countries
    return getLocationsData(accessToken, propertyId, startDate, endDate, limit)
}

async function getSourcesData(accessToken: string, propertyId: string, startDate: string, endDate: string, limit: number = 20) {
    // Reusing getAcquisitionData logic as it returns sources
    return getAcquisitionData(accessToken, propertyId, startDate, endDate, limit)
}
async function getOverviewComparisonData(accessToken: string, propertyId: string, startDate: string, endDate: string, compareStartDate: string, compareEndDate: string, limit: number = 10) {
    // We run parallel reports for both Primary and Secondary date ranges.
    // GA4 supports multiple dateRanges in one request, but processing them into "Current vs Previous" structure is clearer if we just get them back and map them.
    // Alternatively, using the 'date_range' dimension index is efficient. Let's use the single request with 2 ranges method.

    const dateRanges = [
        { startDate, endDate }, // range 0 (Current)
        { startDate: compareStartDate, endDate: compareEndDate } // range 1 (Previous)
    ]

    const [metricsResponse, trafficResponse, pagesResponse] = await Promise.all([
        // 1. Top Level Metrics
        runReport(accessToken, propertyId, {
            dateRanges,
            metrics: [
                { name: "sessions" },
                { name: "totalUsers" },
                { name: "screenPageViews" },
                { name: "bounceRate" },
                { name: "engagementRate" },
                { name: "averageSessionDuration" },
            ],
            // No dimensions implies we get 1 row per date range
        }),
        // 2. Traffic Sources
        runReport(accessToken, propertyId, {
            dateRanges,
            dimensions: [{ name: "sessionDefaultChannelGroup" }],
            metrics: [{ name: "sessions" }],
            orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
            limit: limit,
        }),
        // 3. Top Pages
        runReport(accessToken, propertyId, {
            dateRanges,
            dimensions: [{ name: "pagePath" }, { name: "pageTitle" }],
            metrics: [{ name: "screenPageViews" }],
            orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
            limit: limit,
        }),
    ])

    // --- Helper to parse GA4 multi-range rows ---
    // The API returns distinct rows for range 0 and range 1.
    // We need to merge them to calculate deltas.

    // Parsing Top Level Metrics
    // Expected: 2 rows (one for each range) or fewer if no data
    const currentMetrics = metricsResponse.rows?.find((r: any) => r.dimensionValues?.some((d: any) => d.value === "date_range_0")) || metricsResponse.rows?.[0]
    const previousMetrics = metricsResponse.rows?.find((r: any) => r.dimensionValues?.some((d: any) => d.value === "date_range_1")) || metricsResponse.rows?.[1]

    // Fallback if the dimension isn't explicitly returned (happens if no dimensions requested, but actually runReport adds 'date_range' dimension implicitly if multiple ranges used? 
    // Actually, usually it does. If not, array order matches ranges? 
    // Testing shows: if you pass 2 date ranges, you MUST usually ask for 'date_range' dimension to distinguish confidently, OR rely on row output.
    // Safest: Use 2 separate parallel calls for big aggregations to avoid ambiguity if 'date_range' dimension isn't automatically added or if implicit order is fragile.
    // BUT, let's try strict index logic if we trust the API (rows are labeled if 'dateRange' dimension is present).

    // Let's assume simpler separate calls for robustness in this prompt context to avoid "date_range" dimension parsing hell on complex nested reports.
    // Actually, distinct calls are easier to debug.

    // RE-STRATEGY: Separate Calls for standard `getOverviewData`.
    // It's cleaner to reuse the existing `getOverviewData` function and just call it twice.
    const [currentData, previousData] = await Promise.all([
        getOverviewData(accessToken, propertyId, startDate, endDate, limit),
        getOverviewData(accessToken, propertyId, compareStartDate, compareEndDate, limit)
    ])

    // Now merge and calculate deltas
    const calculateDelta = (current: number, previous: number) => {
        if (!previous) return current > 0 ? 100 : 0
        return ((current - previous) / previous) * 100
    }

    const metricsWithDelta = {
        sessions: {
            value: currentData.metrics.sessions,
            previous: previousData.metrics.sessions,
            delta: calculateDelta(currentData.metrics.sessions, previousData.metrics.sessions)
        },
        users: {
            value: currentData.metrics.activeUsers,
            previous: previousData.metrics.activeUsers,
            delta: calculateDelta(currentData.metrics.activeUsers, previousData.metrics.activeUsers)
        },
        pageViews: {
            value: currentData.metrics.screenPageViews,
            previous: previousData.metrics.screenPageViews,
            delta: calculateDelta(currentData.metrics.screenPageViews, previousData.metrics.screenPageViews)
        },
        bounceRate: {
            value: currentData.metrics.bounceRate,
            previous: previousData.metrics.bounceRate,
            delta: currentData.metrics.bounceRate - previousData.metrics.bounceRate // Percentage point diff for rates
        },
        engagementRate: {
            value: 100 - currentData.metrics.bounceRate,
            previous: 100 - previousData.metrics.bounceRate,
            delta: (100 - currentData.metrics.bounceRate) - (100 - previousData.metrics.bounceRate)
        },
        avgSessionDuration: {
            value: currentData.metrics.averageSessionDuration,
            previous: previousData.metrics.averageSessionDuration,
            delta: calculateDelta(currentData.metrics.averageSessionDuration, previousData.metrics.averageSessionDuration)
        }
    }

    // Merge Traffic Sources (Top 5 comparison)
    // We map current sources, and find matching previous source to get delta
    const trafficSourcesWithDelta = (currentData as any).trafficSources.slice(0, 10).map((source: any) => {
        const prev = (previousData as any).trafficSources.find((p: any) => p.source === source.source)
        return {
            ...source,
            previousSessions: prev ? prev.users : 0,
            delta: calculateDelta(source.users, prev ? prev.users : 0)
        }
    })

    // Merge Top Pages
    const topPagesWithDelta = (currentData as any).pages.slice(0, 10).map((page: any) => {
        const prev = (previousData as any).pages.find((p: any) => p.path === page.path)
        return {
            ...page,
            previousViews: prev ? prev.views : 0,
            delta: calculateDelta(page.views, prev ? prev.views : 0)
        }
    })

    // Sessions Over Time - we might need to overlay them.
    // They likely have different lengths or start dates. 
    // We returns them as two separate arrays for the frontend to align by "Day N" or similar.
    const chartData = {
        current: currentData.sessionsData,
        previous: previousData.sessionsData
    }

    return {
        isVersus: true,
        metrics: metricsWithDelta,
        trafficSources: trafficSourcesWithDelta,
        topPages: topPagesWithDelta,
        chartData: chartData,
        deviceBreakdown: currentData.devices // Just show current for donut usually
    }
}

// --- Comparison Functions ---

async function getDevicesComparisonData(accessToken: string, propertyId: string, startDate: string, endDate: string, compareStartDate: string, compareEndDate: string, limit: number = 10) {
    if (propertyId === 'demo-property') {
        return {
            deviceComparison: [
                { name: "mobile", value: 12500, previous: 10000, delta: 25, users: 8000 },
                { name: "desktop", value: 8500, previous: 9000, delta: -5.5, users: 4000 },
                { name: "tablet", value: 1200, previous: 1100, delta: 9.1, users: 800 }
            ]
        }
    }

    const [currentData, previousData] = await Promise.all([
        getDevicesData(accessToken, propertyId, startDate, endDate, limit),
        getDevicesData(accessToken, propertyId, compareStartDate, compareEndDate, limit)
    ])

    const calculateDelta = (c: number, p: number) => !p ? (c > 0 ? 100 : 0) : ((c - p) / p) * 100

    const merged = currentData.devices.map((curr: any) => {
        const prev = previousData.devices.find((p: any) => p.deviceCategory === curr.deviceCategory)
        return {
            name: curr.deviceCategory,
            value: curr.sessions,
            previous: prev?.sessions || 0,
            delta: calculateDelta(curr.sessions, prev?.sessions || 0),
            users: curr.users
        }
    })

    return { deviceComparison: merged }
}

async function getTopPagesComparisonData(accessToken: string, propertyId: string, startDate: string, endDate: string, compareStartDate: string, compareEndDate: string, limit: number = 10) {
    if (propertyId === 'demo-property') {
        return {
            pagesComparison: [
                { name: "/", value: 15400, previous: 12000, delta: 28.3 },
                { name: "/pricing", value: 4500, previous: 3800, delta: 18.4 },
                { name: "/blog/trends-2024", value: 3200, previous: 800, delta: 300 },
                { name: "/features", value: 2800, previous: 2900, delta: -3.4 },
                { name: "/contact", value: 1200, previous: 1100, delta: 9.1 }
            ]
        }
    }

    const [currentData, previousData] = await Promise.all([
        getTopPagesData(accessToken, propertyId, startDate, endDate, limit),
        getTopPagesData(accessToken, propertyId, compareStartDate, compareEndDate, limit)
    ])

    const calculateDelta = (c: number, p: number) => !p ? (c > 0 ? 100 : 0) : ((c - p) / p) * 100

    const merged = currentData.pages.map((curr: any) => {
        const prev = previousData.pages.find((p: any) => p.path === curr.path)
        return {
            name: curr.path,
            value: curr.views,
            previous: prev?.views || 0,
            delta: calculateDelta(curr.views, prev?.views || 0)
        }
    })

    return { pagesComparison: merged }
}

async function getLocationsComparisonData(accessToken: string, propertyId: string, startDate: string, endDate: string, compareStartDate: string, compareEndDate: string, limit: number = 10) {
    if (propertyId === 'demo-property') {
        return {
            locationComparison: [
                { name: "United States", value: 8500, previous: 8000, delta: 6.25 },
                { name: "United Kingdom", value: 2100, previous: 1900, delta: 10.5 },
                { name: "Germany", value: 1800, previous: 2000, delta: -10 },
                { name: "Canada", value: 1200, previous: 1100, delta: 9.1 },
                { name: "India", value: 950, previous: 400, delta: 137.5 }
            ]
        }
    }

    const [currentData, previousData] = await Promise.all([
        getLocationsData(accessToken, propertyId, startDate, endDate, limit),
        getLocationsData(accessToken, propertyId, compareStartDate, compareEndDate, limit)
    ])

    const calculateDelta = (c: number, p: number) => !p ? (c > 0 ? 100 : 0) : ((c - p) / p) * 100

    const merged = currentData.countries.map((curr: any) => {
        const prev = previousData.countries.find((p: any) => p.country === curr.country)
        return {
            name: curr.country,
            value: curr.users,
            previous: prev?.users || 0,
            delta: calculateDelta(curr.users, prev?.users || 0)
        }
    })

    return { locationComparison: merged }
}

async function getAcquisitionComparisonData(accessToken: string, propertyId: string, startDate: string, endDate: string, compareStartDate: string, compareEndDate: string, limit: number = 10) {
    if (propertyId === 'demo-property') {
        return {
            acquisitionComparison: [
                { name: "Organic Search", value: 12000, previous: 10000, delta: 20 },
                { name: "Direct", value: 5000, previous: 5200, delta: -3.8 },
                { name: "Referral", value: 3000, previous: 1500, delta: 100 },
                { name: "Organic Social", value: 2500, previous: 2000, delta: 25 },
                { name: "Email", value: 1500, previous: 1200, delta: 25 }
            ]
        }
    }

    const [currentData, previousData] = await Promise.all([
        getSourcesData(accessToken, propertyId, startDate, endDate, limit),
        getSourcesData(accessToken, propertyId, compareStartDate, compareEndDate, limit)
    ])

    const calculateDelta = (c: number, p: number) => !p ? (c > 0 ? 100 : 0) : ((c - p) / p) * 100

    const merged = currentData.sources.map((curr: any) => {
        const prev = previousData.sources.find((p: any) => p.source === curr.source)
        return {
            name: curr.source,
            value: curr.sessions,
            previous: prev?.sessions || 0,
            delta: calculateDelta(curr.sessions, prev?.sessions || 0)
        }
    })

    return { acquisitionComparison: merged }
}
