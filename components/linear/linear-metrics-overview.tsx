"use client"
// Force resolution
import { Users, Clock, MousePointer2, Activity, ArrowUpRight } from "lucide-react"
import { LinearStatCard } from "./linear-stat-card"
import { LinearAIPanel } from "./linear-ai-panel"
import { OverviewCharts } from "./charts/overview-charts"
import { useAnalytics } from "@/hooks/use-analytics"

interface LinearMetricsOverviewProps {
    propertyId: string
}

export function LinearMetricsOverview({ propertyId }: LinearMetricsOverviewProps) {
    const { data, loading } = useAnalytics(propertyId)

    if (loading) {
        return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-pulse">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 rounded-lg bg-zinc-100" />
            ))}
        </div>
    }

    if (!data) return null

    const { metrics } = data

    // Helper to format duration
    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = Math.floor(seconds % 60)
        return `${m}m ${s}s`
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                <LinearStatCard
                    title="Total Users"
                    value={metrics.users.toLocaleString()}
                    icon={Users}
                    variant="indigo"
                    description="The total number of unique users who visited your property within the selected time range."
                />
                <LinearStatCard
                    title="Sessions"
                    value={metrics.sessions.toLocaleString()}
                    icon={Activity}
                    variant="amber"
                    description="The total number of sessions on your property. A session is a period of time a user is active on your site."
                />
                <LinearStatCard
                    title="Avg. Duration"
                    value={formatDuration(metrics.avgSessionDuration)}
                    icon={Clock}
                    variant="emerald"
                    description="The average length of time a session lasted, calculated as total duration divided by total sessions."
                />
                <LinearStatCard
                    title="Bounce Rate"
                    value={`${(metrics.bounceRate * 100).toFixed(1)}%`}
                    icon={MousePointer2}
                    variant="rose"
                    description="The percentage of sessions that were not engaged (lasted less than 10 seconds, had no conversions, and had only one page or screen view)."
                />
                <LinearStatCard
                    title="Engagement"
                    value={`${(metrics.engagementRate * 100).toFixed(1)}%`}
                    icon={Activity}
                    variant="emerald"
                    description="The percentage of engaged sessions. An engaged session is a session that lasted longer than 10 seconds, or had a conversion event, or had 2 or more page or screen views."
                />
                <LinearStatCard
                    title="Page Views"
                    value={metrics.pageViews.toLocaleString()}
                    icon={Activity}
                    variant="indigo"
                    description="The total number of web pages (or app screens) your users saw. Repeated views of a single page or screen are counted."
                />
            </div>

            {/* Charts Section */}
            <OverviewCharts propertyId={propertyId} />
        </div>
    )
}
