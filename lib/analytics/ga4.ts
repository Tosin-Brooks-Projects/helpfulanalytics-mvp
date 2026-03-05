// Shared GA4 Analytics Data Layer
// All GA4 query functions live here so both the analytics API route
// and the AI chat route can use them without circular imports.

// ─── GA4 REST API Helper ────────────────────────────────────────

export async function runReport(accessToken: string, propertyId: string, requestBody: Record<string, unknown>) {
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

// ─── Mock Data ──────────────────────────────────────────────────

export async function getMockOverviewData() {
    return {
        metrics: {
            sessions: 12543,
            sessionsDelta: 25.4,
            activeUsers: 8432,
            activeUsersDelta: 18.2,
            screenPageViews: 45210,
            screenPageViewsDelta: 32.1,
            bounceRate: 42.5,
            bounceRateDelta: -5.2,
            averageSessionDuration: 145,
            averageSessionDurationDelta: 12.5,
        },
        trafficSources: [
            { name: "Organic Search", users: 4500 },
            { name: "Direct", users: 2100 },
            { name: "Referral", users: 1200 },
            { name: "Social", users: 632 },
        ],
        devices: [
            { name: "Mobile", users: 5120 },
            { name: "Desktop", users: 2800 },
            { name: "Tablet", users: 512 },
        ],
        dates: ["Jan 1", "Jan 2", "Jan 3", "Jan 4", "Jan 5", "Jan 6", "Jan 7"],
        sessionsData: [1200, 1400, 1100, 1600, 1800, 2100, 2400],
        pageViewsData: [4500, 4800, 4200, 5100, 5800, 6200, 7100],
    }
}

export async function getMockOverviewComparisonData() {
    return {
        metrics: {
            sessions: 12543,
            sessionsDelta: 25.4,
            activeUsers: 8432,
            activeUsersDelta: 18.2,
            screenPageViews: 45210,
            screenPageViewsDelta: 32.1,
            bounceRate: 42.5,
            bounceRateDelta: -5.2,
            averageSessionDuration: 145,
            averageSessionDurationDelta: 12.5,
        },
        trafficSources: [
            { name: "Organic Search", users: 4500 },
            { name: "Direct", users: 2100 },
            { name: "Referral", users: 1200 },
            { name: "Social", users: 632 },
        ],
        devices: [
            { name: "Mobile", users: 5120 },
            { name: "Desktop", users: 2800 },
            { name: "Tablet", users: 512 },
        ],
        dates: ["Jan 1", "Jan 2", "Jan 3", "Jan 4", "Jan 5", "Jan 6", "Jan 7"],
        sessionsData: [1200, 1400, 1100, 1600, 1800, 2100, 2400],
        pageViewsData: [4500, 4800, 4200, 5100, 5800, 6200, 7100],
        comparisonMetrics: {
            sessions: 10000,
            activeUsers: 7100,
            screenPageViews: 34200,
            bounceRate: 45.0,
            averageSessionDuration: 128,
        },
        comparisonDates: ["Dec 25", "Dec 26", "Dec 27", "Dec 28", "Dec 29", "Dec 30", "Dec 31"],
        comparisonSessionsData: [1000, 1100, 950, 1300, 1500, 1700, 1900],
        comparisonPageViewsData: [3500, 3800, 3200, 4100, 4800, 5200, 5800],
    }
}

// ─── Overview Data ──────────────────────────────────────────────

export async function getOverviewData(accessToken: string, propertyId: string, startDate: string, endDate: string, limit: number = 10) {
    const propertyStr = propertyId.startsWith("properties/") ? propertyId : `properties/${propertyId}`

    const fetchRes = await fetch(
        `https://analyticsdata.googleapis.com/v1beta/${propertyStr}:runReport`,
        {
            method: "POST",
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                dateRanges: [{ startDate, endDate }],
                dimensions: [
                    { name: "date" },
                    { name: "sessionDefaultChannelGroup" },
                    { name: "deviceCategory" },
                ],
                metrics: [
                    { name: "sessions" },
                    { name: "activeUsers" },
                    { name: "screenPageViews" },
                    { name: "bounceRate" },
                    { name: "averageSessionDuration" },
                ],
                limit: 10000,
            }),
        }
    )

    if (!fetchRes.ok) {
        const errorText = await fetchRes.text()
        throw new Error(`GA4 REST API Error (${fetchRes.status}): ${errorText}`)
    }

    const response = await fetchRes.json()

    let totalSessions = 0
    let totalActiveUsers = 0
    let totalPageViews = 0
    let totalBounceRate = 0
    let totalDuration = 0

    const sourcesMap = new Map<string, number>()
    const devicesMap = new Map<string, number>()
    const dailySessionsMap = new Map<string, number>()
    const dailyPageViewsMap = new Map<string, number>()

    const rows = response.rows || []

    for (const row of rows) {
        const dateStr = row.dimensionValues?.[0]?.value || ""
        const formattedDate = dateStr
            ? new Date(`${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            : ""
        const source = row.dimensionValues?.[1]?.value || "Unknown"
        const device = row.dimensionValues?.[2]?.value || "Unknown"

        const sessions = Number.parseInt(row.metricValues?.[0]?.value || "0", 10)
        const activeUsers = Number.parseInt(row.metricValues?.[1]?.value || "0", 10)
        const pageViews = Number.parseInt(row.metricValues?.[2]?.value || "0", 10)
        const bounceRate = Number.parseFloat(row.metricValues?.[3]?.value || "0")
        const duration = Number.parseFloat(row.metricValues?.[4]?.value || "0")

        totalSessions += sessions
        totalActiveUsers += activeUsers
        totalPageViews += pageViews
        if (sessions > 0) {
            totalBounceRate += bounceRate * sessions
            totalDuration += duration * sessions
        }

        sourcesMap.set(source, (sourcesMap.get(source) || 0) + activeUsers)
        devicesMap.set(device, (devicesMap.get(device) || 0) + sessions)
        dailySessionsMap.set(formattedDate, (dailySessionsMap.get(formattedDate) || 0) + sessions)
        dailyPageViewsMap.set(formattedDate, (dailyPageViewsMap.get(formattedDate) || 0) + pageViews)
    }

    const avgBounceRate = totalSessions > 0 ? (totalBounceRate / totalSessions) * 100 : 0
    const avgDuration = totalSessions > 0 ? (totalDuration / totalSessions) : 0

    const trafficSources = Array.from(sourcesMap.entries())
        .map(([name, users]) => ({ name, users }))
        .sort((a, b) => b.users - a.users)
        .slice(0, 5)

    const devices = Array.from(devicesMap.entries())
        .map(([name, users]) => ({ name, users }))
        .sort((a, b) => b.users - a.users)

    const sortedDates = Array.from(dailySessionsMap.keys()).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
    const dates = sortedDates
    const sessionsData = dates.map(d => dailySessionsMap.get(d) || 0)
    const pageViewsData = dates.map(d => dailyPageViewsMap.get(d) || 0)

    return {
        metrics: {
            sessions: totalSessions,
            sessionsDelta: 0,
            activeUsers: totalActiveUsers,
            activeUsersDelta: 0,
            screenPageViews: totalPageViews,
            screenPageViewsDelta: 0,
            bounceRate: avgBounceRate,
            bounceRateDelta: 0,
            averageSessionDuration: avgDuration,
            averageSessionDurationDelta: 0,
        },
        trafficSources,
        devices,
        dates,
        sessionsData,
        pageViewsData,
    }
}

// ─── Top Pages ──────────────────────────────────────────────────

export async function getTopPagesData(accessToken: string, propertyId: string, startDate: string, endDate: string, limit: number = 20) {
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
        limit,
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

// ─── Devices ────────────────────────────────────────────────────

export async function getDevicesData(accessToken: string, propertyId: string, startDate: string, endDate: string, limit: number = 10) {
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
            limit,
        }),
        runReport(accessToken, propertyId, {
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: "operatingSystem" }],
            metrics: [{ name: "sessions" }],
            orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
            limit,
        }),
        runReport(accessToken, propertyId, {
            dateRanges: [{ startDate, endDate }],
            dimensions: [{ name: "screenResolution" }],
            metrics: [{ name: "sessions" }],
            orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
            limit,
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

// ─── Locations (Countries) ──────────────────────────────────────

export async function getLocationsData(accessToken: string, propertyId: string, startDate: string, endDate: string, limit: number = 20) {
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
        limit,
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

// ─── Acquisition (Sources) ──────────────────────────────────────

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
        limit,
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

// ─── States / Regions ───────────────────────────────────────────

export async function getStatesData(accessToken: string, propertyId: string, startDate: string, endDate: string, country: string, limit: number = 20) {
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
                stringFilter: { matchType: "EXACT", value: country },
            },
        },
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit,
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

// ─── Cities ─────────────────────────────────────────────────────

export async function getCitiesData(accessToken: string, propertyId: string, startDate: string, endDate: string, country: string, limit: number = 20) {
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
                stringFilter: { matchType: "EXACT", value: country },
            },
        },
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit,
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

// ─── Realtime ───────────────────────────────────────────────────

export async function getRealtimeData(accessToken: string, propertyId: string) {
    const resourceName = propertyId.startsWith("properties/") ? propertyId : `properties/${propertyId}`

    const response = await fetch(`https://analyticsdata.googleapis.com/v1beta/${resourceName}:runRealtimeReport`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            metrics: [{ name: "activeUsers" }],
            dimensions: [{ name: "unifiedScreenName" }],
            limit: 10,
        }),
    })

    if (!response.ok) {
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
            title: row.dimensionValues?.[0]?.value || "Unknown",
        })),
    }
}
