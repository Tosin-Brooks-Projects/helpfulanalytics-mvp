"use client"
// Force resolution
import { Users, Clock, MousePointer2, Activity, ArrowUpRight } from "lucide-react"
import { LinearStatCard } from "./linear-stat-card"
import { LinearAIPanel } from "./linear-ai-panel"
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
                    description="The total number of unique users who visited your property within the selected time range."
                />
                <LinearStatCard
                    title="Sessions"
                    value={metrics.sessions.toLocaleString()}
                    icon={Activity}
                    description="The total number of sessions on your property. A session is a period of time a user is active on your site."
                />
                <LinearStatCard
                    title="Avg. Duration"
                    value={formatDuration(metrics.avgSessionDuration)}
                    icon={Clock}
                    description="The average length of time a session lasted, calculated as total duration divided by total sessions."
                />
                <LinearStatCard
                    title="Bounce Rate"
                    value={`${(metrics.bounceRate * 100).toFixed(1)}%`}
                    icon={MousePointer2}
                    description="The percentage of sessions that were not engaged (lasted less than 10 seconds, had no conversions, and had only one page or screen view)."
                />
                <LinearStatCard
                    title="Engagement"
                    value={`${(metrics.engagementRate * 100).toFixed(1)}%`}
                    icon={Activity}
                    description="The percentage of engaged sessions. An engaged session is a session that lasted longer than 10 seconds, or had a conversion event, or had 2 or more page or screen views."
                />
                <LinearStatCard
                    title="Page Views"
                    value={metrics.pageViews.toLocaleString()}
                    icon={Activity}
                    description="The total number of web pages (or app screens) your users saw. Repeated views of a single page or screen are counted."
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
                {/* Traffic Sources */}
                <div className="h-[350px] rounded-lg border border-zinc-200 bg-white p-6 flex flex-col shadow-sm">
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Top Sources</h3>
                    <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                        {data.trafficSources?.map((source: any, i: number) => (
                            <div key={i} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded bg-zinc-50 text-zinc-400 border border-zinc-100 group-hover:bg-amber-500/10 group-hover:text-amber-500 transition-colors">
                                        <ArrowUpRight className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-zinc-900">{source.source}</p>
                                        <p className="text-xs text-zinc-500">{source.percentage.toFixed(1)}%</p>
                                    </div>
                                </div>
                                <div className="text-sm font-medium text-zinc-600 tabular-nums">
                                    {source.sessions.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Pages */}
                <div className="h-[350px] rounded-lg border border-zinc-200 bg-white p-6 flex flex-col shadow-sm">
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Top Pages</h3>
                    <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                        {data.topPages?.map((page: any, i: number) => (
                            <div key={i} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="flex h-8 w-8 items-center justify-center rounded bg-zinc-50 text-zinc-400 border border-zinc-100 group-hover:bg-amber-500/10 group-hover:text-amber-500 transition-colors shrink-0">
                                        <ArrowUpRight className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-zinc-900 truncate">{page.title}</p>
                                        <p className="text-xs text-zinc-500 truncate">{page.path}</p>
                                    </div>
                                </div>
                                <div className="text-sm font-medium text-zinc-600 tabular-nums shrink-0 ml-2">
                                    {page.views.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Countries */}
                <div className="h-[350px] rounded-lg border border-zinc-200 bg-white p-6 flex flex-col shadow-sm">
                    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Locations</h3>
                    <div className="flex-1 space-y-4 overflow-y-auto pr-2 custom-scrollbar">
                        {data.topCountries?.map((location: any, i: number) => (
                            <div key={i} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded bg-zinc-50 text-zinc-400 border border-zinc-100 group-hover:bg-amber-500/10 group-hover:text-amber-500 transition-colors">
                                        <ArrowUpRight className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-zinc-900">{location.country}</p>
                                        <p className="text-xs text-zinc-500">{location.percentage.toFixed(1)}%</p>
                                    </div>
                                </div>
                                <div className="text-sm font-medium text-zinc-600 tabular-nums">
                                    {location.sessions.toLocaleString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* AI Companion - Simplified/Compact for this view */}
                <div className="h-[350px] overflow-hidden">
                    <LinearAIPanel />
                </div>
            </div>
        </div>
    )
}
