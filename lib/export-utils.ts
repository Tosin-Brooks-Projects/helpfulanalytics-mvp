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
    const headers = Object.keys(data[0])

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
    // Helper to flatten complex analytics objects for CSV export
    // This is a basic implementation - can be expanded based on specific report structures
    if (!data) return []

    // Example: Flatten 'devices' array if it exists
    if (Array.isArray(data.devices)) {
        return data.devices.map((d: any) => ({
            category: 'Devices',
            type: d.deviceCategory,
            sessions: d.sessions,
            users: d.users,
            bounceRate: d.bounceRate,
            percentage: d.percentage
        }))
    }

    // Example: Flatten 'topPages' array
    if (Array.isArray(data.topPages)) {
        return data.topPages.map((p: any) => ({
            category: 'Top Pages',
            path: p.pagePath,
            views: p.screenPageViews,
            activeUsers: p.activeUsers
        }))
    }

    // Flatten 'os' array
    if (Array.isArray(data.os)) {
        return data.os.map((o: any) => ({
            category: 'Operating System',
            name: o.name,
            sessions: o.sessions,
            percentage: o.percentage
        }))
    }

    // Flatten 'browsers' array
    if (Array.isArray(data.browsers)) {
        return data.browsers.map((b: any) => ({
            category: 'Browser',
            name: b.browser,
            sessions: b.sessions,
            percentage: b.percentage
        }))
    }

    // Flatten 'screens' array
    if (Array.isArray(data.screens)) {
        return data.screens.map((s: any) => ({
            category: 'Screen Resolution',
            resolution: s.resolution,
            sessions: s.sessions,
            percentage: s.percentage
        }))
    }

    // Flatten 'sources' array (assuming structure from Sources page)
    if (Array.isArray(data.sources)) {
        return data.sources.map((s: any) => ({
            category: 'Acquisition',
            source: s.source,
            sessions: s.sessions,
            users: s.users
        }))
    }

    // Flatten 'locations' array (assuming structure from Audience page)
    if (Array.isArray(data.locations)) {
        return data.locations.map((l: any) => ({
            category: 'Location',
            country: l.country,
            activeUsers: l.activeUsers
        }))
    }

    // Default: return raw data wrapped in array if object, or as is if array
    return Array.isArray(data) ? data : [data]
}
