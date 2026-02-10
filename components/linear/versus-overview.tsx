"use client"

import { useDashboard } from "@/components/linear/dashboard-context"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowDown, ArrowUp, Crown, Swords, Trophy, Medal, Users, Globe, Zap, MousePointerClick, Timer, Percent } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { VersusHealthBar } from "./versus-health-bar"
import { CoachCommentary } from "./coach-commentary"

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

type ChartMetric = 'sessions' | 'users' | 'pageViews'

export function VersusOverview() {
    const { dateRange, compareDateRange, selectedProperty } = useDashboard()
    const [data, setData] = useState<ComparisonData | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedChartMetric, setSelectedChartMetric] = useState<ChartMetric>('sessions')

    useEffect(() => {
        async function fetchComparison() {
            if (!selectedProperty) return

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

    if (!data || !compareDateRange?.from) {
        return (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 p-12 text-center h-[50vh]">
                <div className="mb-4 rounded-full bg-white p-4 shadow-sm relative">
                    <Swords className="h-8 w-8 text-zinc-400" />
                    <div className="absolute top-0 right-0 w-3 h-3 bg-amber-500 rounded-full animate-ping" />
                </div>
                <h3 className="text-xl font-bold text-zinc-900">Ready to Battle?</h3>
                <p className="mt-2 text-sm text-zinc-500 max-w-sm">
                    Select a comparison date range from the header to see how your current performance stacks up against the past.
                </p>
            </div>
        )
    }

    const currentWins = data.metrics.sessions.delta > 0

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Battle Arena */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="p-4 sm:p-6 border-zinc-200 shadow-sm relative overflow-hidden">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
                            <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
                                <Swords className="h-5 w-5 text-zinc-500" />
                                Traffic Battle
                            </h2>
                            {currentWins && (
                                <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-bold border border-amber-200 self-start sm:self-auto">
                                    CURRENTLY WINNING
                                </span>
                            )}
                        </div>

                        <VersusHealthBar
                            currentValue={data.metrics.sessions.value}
                            previousValue={data.metrics.sessions.previous}
                            metricLabel="Sessions"
                            isWinning={currentWins}
                        />
                    </Card>

                    <CoachCommentary
                        propertyId={selectedProperty || ''}
                        dateRange={dateRange}
                        compareDateRange={compareDateRange}
                    />

                    <Card className="p-4 sm:p-6 border-zinc-200 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h3 className="text-sm font-semibold text-zinc-900">Performance Timeline</h3>
                            <div className="flex p-1 bg-zinc-100 rounded-lg self-start overflow-x-auto max-w-full">
                                <ChartToggle
                                    label="Sessions"
                                    active={selectedChartMetric === 'sessions'}
                                    onClick={() => setSelectedChartMetric('sessions')}
                                />
                                <ChartToggle
                                    label="Users"
                                    active={selectedChartMetric === 'users'}
                                    onClick={() => setSelectedChartMetric('users')}
                                />
                                <ChartToggle
                                    label="Page Views"
                                    active={selectedChartMetric === 'pageViews'}
                                    onClick={() => setSelectedChartMetric('pageViews')}
                                />
                            </div>
                        </div>
                        <div className="h-[250px] sm:h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={mergeChartData(
                                    data?.chartData?.current || [],
                                    data?.chartData?.previous || [],
                                    selectedChartMetric
                                )}>
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
                                        width={30}
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
                                        animationDuration={1500}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="previous"
                                        stroke="#a1a1aa"
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        fill="transparent"
                                        name="Previous Period"
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>

                {/* Metrics Grid Side Panel */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-1 gap-4 content-start">
                    <div className="col-span-2 md:col-span-3 lg:col-span-1">
                        <h3 className="text-sm font-semibold text-zinc-900 px-1 mb-2 lg:mb-4">Detailed Stats</h3>
                    </div>
                    <MetricBattleCard
                        title="Sessions"
                        metric={data.metrics.sessions}
                        icon={<Users className="h-4 w-4" />}
                    />
                    <MetricBattleCard
                        title="Total Users"
                        metric={data.metrics.users}
                        icon={<Globe className="h-4 w-4" />}
                    />
                    <MetricBattleCard
                        title="Page Views"
                        metric={data.metrics.pageViews}
                        icon={<MousePointerClick className="h-4 w-4" />}
                    />
                    <MetricBattleCard
                        title="Avg. Duration"
                        metric={data.metrics.avgSessionDuration}
                        isTime
                        icon={<Timer className="h-4 w-4" />}
                    />
                    <MetricBattleCard
                        title="Bounce Rate"
                        metric={data.metrics.bounceRate}
                        isInverse
                        icon={<Percent className="h-4 w-4" />}
                    />
                    <MetricBattleCard
                        title="Engagement Rate"
                        metric={data.metrics.engagementRate}
                        icon={<Zap className="h-4 w-4" />}
                    />
                </div>
            </div>
        </div>
    )
}

function MetricBattleCard({ title, metric, icon, isTime = false, isInverse = false }: { title: string, metric: MetricComparison, icon: ReactNode, isTime?: boolean, isInverse?: boolean }) {
    // For normal metrics, delta > 0 is good (green).
    // For inverse metrics (Bounce Rate), delta < 0 is good (green).
    const isGood = isInverse ? metric.delta <= 0 : metric.delta >= 0
    // Win is always determines 'good' performance
    const isWin = isGood

    const format = (val: number | undefined | null) => {
        const num = val ?? 0
        return isTime ? `${num.toFixed(0)}s` : num.toLocaleString()
    }

    return (
        <Card className={cn(
            "p-4 border-zinc-200 transition-all duration-300 hover:shadow-md group",
            isWin ? "hover:border-emerald-200 bg-white" : "hover:border-red-200 bg-zinc-50/50"
        )}>
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-medium text-zinc-500 flex items-center gap-1.5 group-hover:text-zinc-800 transition-colors">
                    {icon} {title}
                </span>
                {isWin ? <Crown className="h-3 w-3 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" /> : null}
            </div>

            <div className="flex items-end gap-3 mt-1">
                <div className="text-xl font-bold tracking-tight text-zinc-900">
                    {format(metric.value)}
                </div>
                <div className="text-xs font-medium text-zinc-400 mb-1 pb-0.5 border-b border-dashed border-zinc-300">
                    vs {format(metric.previous)}
                </div>
            </div>

            <div className={cn(
                "mt-3 text-[10px] font-bold inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md",
                isGood ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            )}>
                {metric.delta > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {Math.abs(metric.delta).toFixed(1)}%
            </div>
        </Card>
    )
}

function ChartToggle({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-all",
                active ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-900"
            )}
        >
            {label}
        </button>
    )
}

function mergeChartData(current: any[], previous: any[], metricKey: string) {
    const len = Math.max(current?.length || 0, previous?.length || 0)
    const result = []

    for (let i = 0; i < len; i++) {
        result.push({
            day: `Day ${i + 1}`,
            current: current?.[i]?.[metricKey] || null,
            previous: previous?.[i]?.[metricKey] || null
        })
    }
    return result
}

function VersusSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="h-48 bg-zinc-100 rounded-xl" />
                    <div className="h-32 bg-zinc-100 rounded-xl" />
                    <div className="h-[300px] bg-zinc-100 rounded-xl" />
                </div>
                <div className="space-y-4">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="h-24 bg-zinc-100 rounded-xl" />
                    ))}
                </div>
            </div>
        </div>
    )
}

import { ReactNode } from "react"

