import { BetaAnalyticsDataClient } from "@google-analytics/data"

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

export async function getOverviewData(accessToken: string, propertyId: string, startDate: string, endDate: string, limit: number = 10) {
    const analyticsDataClient = new BetaAnalyticsDataClient({
        authClient: new (require("google-auth-library").OAuth2Client)(),
    })

    analyticsDataClient.auth.setCredentials({ access_token: accessToken })

    const [response] = await analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
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
        limit: 10000, // We need to fetch enough data to aggregate manually
    })

    // Manual aggregation
    let totalSessions = 0
    let totalActiveUsers = 0
    let totalPageViews = 0
    let totalBounceRate = 0 // Needs to be weighted later if possible, but keeping it simple
    let totalDuration = 0
    let numRowsForAverages = 0

    const sourcesMap = new Map<string, number>()
    const devicesMap = new Map<string, number>()
    const dailySessionsMap = new Map<string, number>()
    const dailyPageViewsMap = new Map<string, number>()

    const rows = response.rows || []

    rows.forEach((row) => {
        const dateStr = row.dimensionValues?.[0]?.value || ""
        // Format YYYYMMDD to readable date (MMM D)
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
            totalBounceRate += bounceRate * sessions; // weight by sessions
            totalDuration += duration * sessions; // weight by sessions
        }

        sourcesMap.set(source, (sourcesMap.get(source) || 0) + usersFromRow(row)) // Assuming users based on sessions
        devicesMap.set(device, (devicesMap.get(device) || 0) + sessions)

        dailySessionsMap.set(formattedDate, (dailySessionsMap.get(formattedDate) || 0) + sessions)
        dailyPageViewsMap.set(formattedDate, (dailyPageViewsMap.get(formattedDate) || 0) + pageViews)
    })

    // Calculate actual averages
    const avgBounceRate = totalSessions > 0 ? (totalBounceRate / totalSessions) * 100 : 0; // * 100 because GA returns a fraction usually, but let's check
    const avgDuration = totalSessions > 0 ? (totalDuration / totalSessions) : 0;

    // Convert Sets/Maps to Arrays, sort and format
    const trafficSources = Array.from(sourcesMap.entries())
        .map(([name, users]) => ({ name, users }))
        .sort((a, b) => b.users - a.users)
        .slice(0, 5)

    const devices = Array.from(devicesMap.entries())
        .map(([name, users]) => ({ name, users }))
        .sort((a, b) => b.users - a.users)

    // Sort dates properly (this assumes they are basically in string sort order which YYYYMMDD would be, but we formatted to MMM D)
    // Actually map insertion order might not be chronological if GA returns them weirdly. Better to sort keys if they were raw.
    // For now, trusting insertion order or we can sort explicitly.
    const sortedDates = Array.from(dailySessionsMap.keys()).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())

    const dates = sortedDates
    const sessionsData = dates.map(d => dailySessionsMap.get(d) || 0)
    const pageViewsData = dates.map(d => dailyPageViewsMap.get(d) || 0)


    return {
        metrics: {
            sessions: totalSessions,
            sessionsDelta: 0, // Need compare date range for this
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

// Helper needed inside getOverviewData
function usersFromRow(row: any) {
    return Number.parseInt(row.metricValues?.[1]?.value || "0", 10) // Active users
}
