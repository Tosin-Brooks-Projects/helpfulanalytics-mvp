"use client"

import { useState, useEffect } from "react"
import { useDashboard } from "@/components/linear/dashboard-context"
import { format } from "date-fns"

export function useAnalytics(propertyId: string | undefined) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const { dateRange } = useDashboard()

    useEffect(() => {
        async function fetchData() {
            if (!propertyId) return
            setLoading(true)
            setError(null)
            try {
                // Format dates for API (YYYY-MM-DD or use "30daysAgo" fallback)
                const start = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "30daysAgo"
                const end = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "today"

                const res = await fetch(`/api/analytics?propertyId=${propertyId}&reportType=overview&startDate=${start}&endDate=${end}`)
                if (!res.ok) throw new Error("Failed to fetch analytics")

                const json = await res.json()
                setData(json)
            } catch (err: any) {
                console.error("Failed to fetch analytics", err)
                setError(err.message || "Unknown error")
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [propertyId, dateRange])

    return { data, loading, error }
}
