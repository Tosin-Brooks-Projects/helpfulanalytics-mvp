export interface CSVOptions {
    filename?: string
    metadata?: {
        propertyName?: string
        dateRange?: string
        generatedAt?: string
    }
    download?: boolean
}

export function convertToCSV(data: any[], options: CSVOptions = { download: true }) {
    if (!data || !data.length) return ""

    const { filename = "export", metadata, download = true } = options
    
    // Dynamically harvest all unique headers present in any of the objects to prevent column loss
    const headersSet = new Set<string>()
    data.forEach(row => {
        if (row && typeof row === 'object') {
            Object.keys(row).forEach(key => headersSet.add(key))
        }
    })
    const headers = Array.from(headersSet)

    let csvRows: string[] = []

    // Add Metadata Header if provided
    if (metadata) {
        if (metadata.propertyName) csvRows.push(`"Property:","${metadata.propertyName.replace(/"/g, '""')}"`)
        if (metadata.dateRange) csvRows.push(`"Date Range:","${metadata.dateRange}"`)
        if (metadata.generatedAt) csvRows.push(`"Generated At:","${metadata.generatedAt}"`)
        csvRows.push("") // Spacer
    }

    // Add Main Headers
    csvRows.push(headers.join(","))

    // Add Data Rows
    data.forEach(row => {
        const values = headers.map(fieldName => {
            const val = row[fieldName]
            if (val === null || val === undefined) return ""
            const stringVal = String(val)
            // Escape quotes and wrap in quotes if contains comma, newline, or quote
            if (stringVal.includes(",") || stringVal.includes("\n") || stringVal.includes('"')) {
                return `"${stringVal.replace(/"/g, '""')}"`
            }
            return stringVal
        })
        csvRows.push(values.join(","))
    })

    const csvContent = csvRows.join("\n")

    if (download && typeof window !== 'undefined') {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `${filename}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return csvContent
}

export function downloadJSON(data: any, filename: string) {
    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", `${filename}.json`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

export function flattenAnalyticsData(data: any) {
    if (!data) return []

    const flatData: any[] = []

    // 1. Base Metrics KPIs — only include if the metrics object has core traffic fields
    if (data.metrics && typeof data.metrics === 'object' && !Array.isArray(data.metrics)) {
        const m = data.metrics
        const hasCoreMetrics = m.sessions != null || m.activeUsers != null || m.screenPageViews != null
        if (hasCoreMetrics) {
            flatData.push({ Category: 'Overview', Metric: 'Sessions', Value: m.sessions ?? 0 })
            flatData.push({ Category: 'Overview', Metric: 'Active Users', Value: m.activeUsers ?? 0 })
            flatData.push({ Category: 'Overview', Metric: 'Screen Page Views', Value: m.screenPageViews ?? m.pageViews ?? 0 })
            flatData.push({ Category: 'Overview', Metric: 'Bounce Rate', Value: `${((m.bounceRate ?? 0) * 100).toFixed(1)}%` })
            flatData.push({ Category: 'Overview', Metric: 'Engagement Rate', Value: `${((m.engagementRate ?? (1 - (m.bounceRate ?? 0))) * 100).toFixed(1)}%` })
            flatData.push({ Category: 'Overview', Metric: 'Avg Session Duration', Value: `${Math.round(m.averageSessionDuration ?? m.avgSessionDuration ?? 0)}s` })
        }
    }

    // 2. Pages
    const pages = data.pages || data.topPages
    if (Array.isArray(pages)) {
        pages.forEach((p: any) => {
            flatData.push({
                Category: 'Pages',
                Path: p.pagePath || p.path || '/',
                Title: p.pageTitle || p.title || 'Untitled',
                Views: p.pageViews || p.views || 0,
                Unique: p.uniquePageViews || p.users || 0,
                BounceRate: p.bounceRate !== undefined ? `${(p.bounceRate * 100).toFixed(1)}%` : undefined,
                Percentage: p.percentage !== undefined ? `${p.percentage.toFixed(1)}%` : undefined
            })
        })
    }

    // 3. Traffic Sources
    const sources = data.sources || data.trafficSources
    if (Array.isArray(sources)) {
        sources.forEach((s: any) => {
            flatData.push({
                Category: 'Acquisition',
                Source: s.source || s.name || 'unknown',
                Medium: s.medium || 'unknown',
                Sessions: s.sessions ?? 0,
                Users: s.users ?? 0,
                BounceRate: s.bounceRate !== undefined ? `${(s.bounceRate * 100).toFixed(1)}%` : undefined
            })
        })
    }

    // 4. Devices
    const devices = data.devices || data.deviceBreakdown
    if (Array.isArray(devices)) {
        devices.forEach((d: any) => {
            flatData.push({
                Category: 'Devices',
                Type: d.deviceCategory || d.device || d.name || 'Unknown',
                Sessions: d.sessions ?? 0,
                Users: d.users ?? 0,
                Percentage: d.percentage !== undefined ? `${d.percentage.toFixed(1)}%` : undefined
            })
        })
    }

    // 5. Browsers
    if (Array.isArray(data.browsers)) {
        data.browsers.forEach((b: any) => {
            flatData.push({
                Category: 'Browsers',
                Type: b.browser || 'Unknown',
                Sessions: b.sessions ?? 0,
                Percentage: b.percentage !== undefined ? `${b.percentage.toFixed(1)}%` : undefined
            })
        })
    }

    // 6. Operating Systems
    if (Array.isArray(data.os)) {
        data.os.forEach((o: any) => {
            flatData.push({
                Category: 'Operating Systems',
                Type: o.name || 'Unknown',
                Sessions: o.sessions ?? 0,
                Percentage: o.percentage !== undefined ? `${o.percentage.toFixed(1)}%` : undefined
            })
        })
    }

    // 7. Screens
    if (Array.isArray(data.screens)) {
        data.screens.forEach((s: any) => {
            flatData.push({
                Category: 'Screens',
                Type: s.resolution || 'Unknown',
                Sessions: s.sessions ?? 0,
                Percentage: s.percentage !== undefined ? `${s.percentage.toFixed(1)}%` : undefined
            })
        })
    }

    // 8. Audience / Locations
    const locations = data.countries || data.locations || data.topCountries
    if (Array.isArray(locations)) {
        locations.forEach((l: any) => {
            flatData.push({
                Category: 'Location',
                Country: l.country || 'Unknown',
                Sessions: l.sessions ?? 0,
                Users: l.users ?? 0,
                BounceRate: l.bounceRate !== undefined ? `${(l.bounceRate * 100).toFixed(1)}%` : undefined,
                Percentage: l.percentage !== undefined ? `${l.percentage.toFixed(1)}%` : undefined
            })
        })
    }

    // 9. Events
    if (Array.isArray(data.events)) {
        data.events.forEach((e: any) => {
            flatData.push({
                Category: 'Events',
                EventName: e.eventName || 'unknown',
                Count: e.eventCount ?? 0,
                Users: e.users ?? 0,
                Percentage: e.percentage !== undefined ? `${e.percentage.toFixed(1)}%` : undefined
            })
        })
    }

    // 10. Conversions
    if (Array.isArray(data.conversions)) {
        data.conversions.forEach((c: any) => {
            flatData.push({
                Category: 'Conversions',
                EventName: c.eventName || 'unknown',
                KeyEvents: c.keyEvents ?? 0,
                TotalCount: c.eventCount ?? 0,
                Users: c.users ?? 0,
                Percentage: c.percentage !== undefined ? `${c.percentage.toFixed(1)}%` : undefined
            })
        })
    }

    // 11. Landing Pages
    if (Array.isArray(data.landingPages)) {
        data.landingPages.forEach((lp: any) => {
            flatData.push({
                Category: 'Landing Pages',
                Path: lp.path || lp.pagePath || '/',
                Sessions: lp.sessions ?? 0,
                Users: lp.users ?? 0,
                BounceRate: lp.bounceRate !== undefined ? `${(lp.bounceRate * 100).toFixed(1)}%` : undefined,
                Percentage: lp.percentage !== undefined ? `${lp.percentage.toFixed(1)}%` : undefined
            })
        })
    }

    // If flatData is still empty, fallback to array wrapping
    if (flatData.length === 0) {
        return Array.isArray(data) ? data : [data]
    }

    return flatData
}
