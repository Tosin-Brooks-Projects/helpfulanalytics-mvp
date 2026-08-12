"use client"

import useSWR from "swr"
import { useDashboard } from "@/components/linear/dashboard-context"
import { format } from "date-fns"

const ANALYTICS_REFRESH_INTERVAL_MS = 60_000

async function analyticsFetcher([, propertyId, reportType, startDate, endDate]: [
    string, string, string, string, string
]) {
    const params = new URLSearchParams({ propertyId, reportType, startDate, endDate })
    const res = await fetch(`/api/analytics?${params.toString()}`)
    if (!res.ok) throw new Error("Failed to fetch analytics")
    return res.json()
}

export function useAnalytics(propertyId: string | undefined, reportType: string = "overview") {
    const { dateRange } = useDashboard()

    const start = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "30daysAgo"
    const end = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "today"

    const key = propertyId
        ? (["analytics", propertyId, reportType, start, end] as const)
        : null

    const { data, error, isLoading, mutate } = useSWR(key, analyticsFetcher, {
        refreshInterval: ANALYTICS_REFRESH_INTERVAL_MS,
        revalidateOnFocus: true,
        dedupingInterval: ANALYTICS_REFRESH_INTERVAL_MS,
        keepPreviousData: true,
        errorRetryCount: 3,
    })

    return {
        data: data ?? null,
        loading: isLoading,
        error: error ? (error.message || "Unknown error") : null,
        refresh: mutate,
    }
}
