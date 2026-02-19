"use client"

import { useDashboard } from "@/components/linear/dashboard-context"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { ArrowDown, ArrowUp, Crown, Swords, Trophy, Medal, Users, Globe, Zap, MousePointerClick, Timer, Percent } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { VersusHealthBar } from "./versus-health-bar"
import { CoachCommentary } from "./coach-commentary"
import { DateRange } from "react-day-picker"

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
            <Tabs defaultValue="overview" className="w-full space-y-6">
                <div className="flex items-center justify-between overflow-x-auto">
                    <TabsList className="grid w-full grid-cols-5 min-w-[400px] lg:w-[600px]">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        <TabsTrigger value="devices">Devices</TabsTrigger>
                        <TabsTrigger value="audience">Audience</TabsTrigger>
                        <TabsTrigger value="pages">Pages</TabsTrigger>
                        <TabsTrigger value="sources">Sources</TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6">
                        {/* Main Battle Arena */}
                        <div className="2xl:col-span-2 space-y-6">
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
                        <div className="2xl:col-span-1">
                            <Card className="border-zinc-200 shadow-sm overflow-hidden">
                                <div className="p-4 border-b border-zinc-100 bg-zinc-50/50">
                                    <h3 className="text-sm font-semibold text-zinc-900">Detailed Stats</h3>
                                </div>
                                <div className="divide-y divide-zinc-100">
                                    <MetricBattleRow
                                        title="Sessions"
                                        metric={data.metrics.sessions}
                                        icon={<Users className="h-4 w-4" />}
                                    />
                                    <MetricBattleRow
                                        title="Total Users"
                                        metric={data.metrics.users}
                                        icon={<Globe className="h-4 w-4" />}
                                    />
                                    <MetricBattleRow
                                        title="Page Views"
                                        metric={data.metrics.pageViews}
                                        icon={<MousePointerClick className="h-4 w-4" />}
                                    />
                                    <MetricBattleRow
                                        title="Avg. Duration"
                                        metric={data.metrics.avgSessionDuration}
                                        isTime
                                        icon={<Timer className="h-4 w-4" />}
                                    />
                                    <MetricBattleRow
                                        title="Bounce Rate"
                                        metric={data.metrics.bounceRate}
                                        isInverse
                                        icon={<Percent className="h-4 w-4" />}
                                    />
                                    <MetricBattleRow
                                        title="Engagement Rate"
                                        metric={data.metrics.engagementRate}
                                        icon={<Zap className="h-4 w-4" />}
                                    />
                                </div>
                            </Card>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="devices">
                    <TabComparisonList reportType="devices" dateRange={dateRange} compareDateRange={compareDateRange} propertyId={selectedProperty} />
                </TabsContent>
                <TabsContent value="audience">
                    <TabComparisonList reportType="locations" dateRange={dateRange} compareDateRange={compareDateRange} propertyId={selectedProperty} />
                </TabsContent>
                <TabsContent value="pages">
                    <TabComparisonList reportType="pages" dateRange={dateRange} compareDateRange={compareDateRange} propertyId={selectedProperty} />
                </TabsContent>
                <TabsContent value="sources">
                    <TabComparisonList reportType="sources" dateRange={dateRange} compareDateRange={compareDateRange} propertyId={selectedProperty} />
                </TabsContent>
            </Tabs>
        </div>
    )
}

function TabComparisonList({ reportType, dateRange, compareDateRange, propertyId }: { reportType: string, dateRange: DateRange | undefined, compareDateRange: DateRange | undefined, propertyId: string | null }) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!propertyId || !dateRange?.from || !compareDateRange?.from) return

        async function fetchTab() {
            if (!propertyId) return

            setLoading(true)
            const params = new URLSearchParams({
                propertyId: propertyId,
                reportType,
                startDate: dateRange?.from?.toISOString().split('T')[0] || '',
                endDate: (dateRange?.to || dateRange?.from)?.toISOString().split('T')[0] || '',
                compareStartDate: compareDateRange?.from?.toISOString().split('T')[0] || '',
                compareEndDate: (compareDateRange?.to || compareDateRange?.from)?.toISOString().split('T')[0] || ''
            })
            const res = await fetch(`/api/analytics?${params.toString()}`)
            const json = await res.json()
            setData(json)
            setLoading(false)
        }
        fetchTab()
    }, [reportType, dateRange, compareDateRange, propertyId])

    if (loading) return <Skeleton className="h-[400px] w-full rounded-xl" />

    // Resolve which array to use based on reportType
    let list: any[] = []
    let icon = <Users className="h-4 w-4" />

    if (reportType === 'devices') list = data?.deviceComparison
    if (reportType === 'locations') list = data?.locationComparison
    if (reportType === 'pages') list = data?.pagesComparison
    if (reportType === 'sources') list = data?.acquisitionComparison

    if (!list || list.length === 0) return <div className="p-8 text-center text-zinc-500">No data available for this comparison.</div>

    return (
        <div className="space-y-6">
            <CoachCommentary
                propertyId={propertyId || ''}
                dateRange={dateRange}
                compareDateRange={compareDateRange}
                reportType={reportType}
            />

            <Card className="border-zinc-200 shadow-sm overflow-hidden">
                <div className="divide-y divide-zinc-100">
                    {list.map((item: any, i: number) => (
                        <MetricBattleRow
                            key={i}
                            title={item.name}
                            metric={{ value: item.value, previous: item.previous, delta: item.delta }}
                            icon={icon}
                        />
                    ))}
                </div>
            </Card>
        </div>
    )
}

function MetricBattleRow({ title, metric, icon, isTime = false, isInverse = false }: { title: string, metric: MetricComparison, icon: ReactNode, isTime?: boolean, isInverse?: boolean }) {
    // For normal metrics, delta > 0 is good (green).
    // For inverse metrics (Bounce Rate), delta < 0 is good (green).
    const isGood = isInverse ? metric.delta <= 0 : metric.delta >= 0

    const format = (val: number | undefined | null) => {
        const num = val ?? 0
        return isTime ? `${num.toFixed(0)}s` : num.toLocaleString()
    }

    return (
        <div className="p-4 flex items-center justify-between hover:bg-zinc-50 transition-colors group">
            <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-zinc-500 flex items-center gap-1.5 group-hover:text-zinc-800 transition-colors">
                    {icon} {title}
                </span>
                <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold tracking-tight text-zinc-900">
                        {format(metric.value)}
                    </span>
                    <span className="text-xs text-zinc-400">
                        vs {format(metric.previous)}
                    </span>
                </div>
            </div>

            <div className={cn(
                "text-[10px] font-bold inline-flex items-center gap-1 px-2 py-1 rounded-full",
                isGood ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
            )}>
                {metric.delta > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                {Math.abs(metric.delta).toFixed(1)}%
            </div>
        </div>
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

