"use client"

import { useDashboard } from "@/components/linear/dashboard-context"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowDown, ArrowUp, Crown, Swords, Trophy, Medal, Users, Globe, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"

interface ComparisonData {
    isVersus: boolean
    metrics: {
        sessions: MetricComparison
        users: MetricComparison
        pageViews: MetricComparison
        bounceRate: MetricComparison
        engagementRate: MetricComparison
        avgSessionDuration: MetricComparison
    }
    chartData: {
        current: any[]
        previous: any[]
    }
}

interface MetricComparison {
    value: number
    previous: number
    delta: number
}

export function VersusOverview() {
    const { dateRange, compareDateRange, selectedProperty } = useDashboard()
    const [data, setData] = useState<ComparisonData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchComparison() {
            if (!selectedProperty) return

            // If any date is missing, ensure we aren't loading and just show placeholder
            if (!dateRange?.from || !dateRange?.to || !compareDateRange?.from || !compareDateRange?.to) {
                setLoading(false)
                return
            }

            setLoading(true)
            try {
                const params = new URLSearchParams({
                    propertyId: selectedProperty,
                    reportType: "overview",
                    startDate: dateRange.from.toISOString().split('T')[0],
                    endDate: dateRange.to.toISOString().split('T')[0],
                    compareStartDate: compareDateRange.from.toISOString().split('T')[0],
                    compareEndDate: compareDateRange.to.toISOString().split('T')[0]
                })

                const res = await fetch(`/api/analytics?${params.toString()}`)
                const json = await res.json()

                if (json.error) {
                    console.error("API Error:", json.error)
                    setData(null)
                } else {
                    setData(json)
                }
            } catch (error) {
                console.error("Failed to fetch versus data", error)
            } finally {
                setLoading(false)
            }
        }

        fetchComparison()
    }, [dateRange, compareDateRange, selectedProperty])

    if (loading) return <VersusSkeleton />

    // Empty State if no data or no comparison selected
    if (!data || !compareDateRange?.from) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center">
                <div className="mb-4 rounded-full bg-white p-3 shadow-sm">
                    <Swords className="h-6 w-6 text-zinc-400" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900">Select Comparison Dates</h3>
                <p className="mt-2 text-sm text-zinc-500 max-w-sm">
                    Please select a comparison date range from the header to start the Versus analysis.
                </p>
            </div>
        )
    }

    // Determine the overall winner (simply by sessions for now)
    const currentWins = data.metrics.sessions.delta > 0

    return (
        <div className="space-y-6">
            {/* Battle Banner */}
            <div className={cn(
                "relative overflow-hidden rounded-xl border p-6 flex flex-col md:flex-row items-center justify-between gap-6",
                currentWins ? "bg-amber-500/10 border-amber-500/20" : "bg-zinc-100 border-zinc-200"
            )}>
                <div className="flex items-center gap-4 z-10">
                    <div className={cn(
                        "h-12 w-12 rounded-full flex items-center justify-center text-white shadow-lg",
                        currentWins ? "bg-gradient-to-br from-amber-400 to-orange-500" : "bg-zinc-400"
                    )}>
                        {currentWins ? <Trophy className="h-6 w-6" /> : <Medal className="h-6 w-6" />}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                            {currentWins ? "New High Score!" : "Lagging Behind"}
                            {currentWins && <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500 text-white animate-pulse">WINNING</span>}
                        </h2>
                        <p className="text-sm text-zinc-500">
                            {currentWins
                                ? `You're beating the previous period by ${data.metrics.sessions.delta.toFixed(1)}%`
                                : `Traffic is down ${Math.abs(data.metrics.sessions.delta).toFixed(1)}% compared to last period`
                            }
                        </p>
                    </div>
                </div>

                {/* AI Commentary Placeholder (Until Phase 5) */}
                <div className="hidden md:block">
                    <Swords className="h-24 w-24 text-zinc-900/5 absolute -right-2 -bottom-4 rotate-12" />
                </div>
            </div>

            {/* Metric Battles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricBattleCard
                    title="Sessions"
                    metric={data.metrics.sessions}
                    icon={<Users className="h-4 w-4" />}
                />
                <MetricBattleCard
                    title="Page Views"
                    metric={data.metrics.pageViews}
                    icon={<Globe className="h-4 w-4" />}
                />
                <MetricBattleCard
                    title="Avg. Duration"
                    metric={data.metrics.avgSessionDuration}
                    isTime
                    icon={<Zap className="h-4 w-4" />}
                />
            </div>

            {/* Chart Overlay */}
            <Card className="p-6 border-zinc-200 shadow-sm bg-white/50 backdrop-blur-sm">
                <h3 className="text-sm font-semibold text-zinc-900 mb-6">Traffic Comparison</h3>
                <div className="h-[300px] w-full min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={mergeChartData(data?.chartData?.current || [], data?.chartData?.previous || [])}>
                            <defs>
                                <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f4f4f5" />
                            <XAxis
                                dataKey="day"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#a1a1aa', fontSize: 10 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#a1a1aa', fontSize: 10 }}
                            />
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Area
                                type="monotone"
                                dataKey="current"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                fillOpacity={1}
                                fill="url(#colorCurrent)"
                                name="This Period"
                            />
                            <Area
                                type="monotone"
                                dataKey="previous"
                                stroke="#a1a1aa"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                fill="transparent"
                                name="Previous Period"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </Card>

        </div>
    )
}

function MetricBattleCard({ title, metric, icon, isTime = false }: { title: string, metric: MetricComparison, icon: ReactNode, isTime?: boolean }) {
    const isWin = metric.delta > 0
    const format = (val: number | undefined | null) => {
        const num = val ?? 0
        return isTime ? `${num.toFixed(0)}s` : num.toLocaleString()
    }

    return (
        <Card className="p-4 border-zinc-200 hover:border-amber-200 transition-all bg-white/60">
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-zinc-500 flex items-center gap-1.5">
                    {icon} {title}
                </span>
                {isWin ? <Crown className="h-3 w-3 text-amber-500" /> : null}
            </div>

            <div className="flex items-end gap-3 mt-1">
                <div className="text-2xl font-bold tracking-tight text-zinc-900">
                    {format(metric.value)}
                </div>
                <div className="text-xs font-medium text-zinc-400 mb-1.5 pb-0.5 border-b border-dashed border-zinc-300">
                    vs {format(metric.previous)}
                </div>
            </div>

            <div className={cn(
                "mt-3 text-xs font-bold inline-flex items-center gap-1 px-2 py-1 rounded-md",
                isWin ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
            )}>
                {isWin ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {Math.abs(metric.delta).toFixed(1)}%
            </div>
        </Card>
    )
}

function mergeChartData(current: any[], previous: any[]) {
    // Determine the max length
    const len = Math.max(current?.length || 0, previous?.length || 0)
    const result = []

    for (let i = 0; i < len; i++) {
        result.push({
            day: `Day ${i + 1}`,
            current: current?.[i]?.sessions || null,
            previous: previous?.[i]?.sessions || null
        })
    }
    return result
}

function VersusSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-24 bg-zinc-100 rounded-xl w-full" />
            <div className="grid grid-cols-3 gap-4">
                <div className="h-32 bg-zinc-100 rounded-xl" />
                <div className="h-32 bg-zinc-100 rounded-xl" />
                <div className="h-32 bg-zinc-100 rounded-xl" />
            </div>
            <div className="h-[300px] bg-zinc-100 rounded-xl" />
        </div>
    )
}

import { ReactNode } from "react"
