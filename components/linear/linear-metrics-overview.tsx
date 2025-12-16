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
                <div key={i} className="h-32 rounded-lg bg-white/5" />
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <LinearStatCard
                    title="Total Users"
                    value={metrics.users.toLocaleString()}
                    icon={Users}
                />
                <LinearStatCard
                    title="Sessions"
                    value={metrics.sessions.toLocaleString()}
                    icon={Activity}
                />
                <LinearStatCard
                    title="Avg. Duration"
                    value={formatDuration(metrics.avgSessionDuration)}
                    icon={Clock}
                />
                <LinearStatCard
                    title="Bounce Rate"
                    value={`${(metrics.bounceRate * 100).toFixed(1)}%`}
                    icon={MousePointer2}
                />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <div className="h-[300px] w-full rounded-lg border border-white/5 bg-white/[0.02] p-6 flex flex-col">
                        <h3 className="text-sm font-medium text-zinc-500 uppercase tracking-wider mb-4">Top Traffic Sources</h3>
                        <div className="flex-1 space-y-4 overflow-y-auto pr-2">
                            {data.trafficSources?.map((source: any, i: number) => (
                                <div key={i} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded bg-white/5 text-zinc-400 group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                                            <ArrowUpRight className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-zinc-200">{source.source}</p>
                                            <p className="text-xs text-zinc-500">{source.percentage.toFixed(1)}% of traffic</p>
                                        </div>
                                    </div>
                                    <div className="text-sm font-medium text-zinc-300 tabular-nums">
                                        {source.sessions.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-1">
                    <LinearAIPanel />
                </div>
            </div>
        </div>
    )
}
