"use client"

import { useEffect, useState } from "react"
import { LinearShell } from "@/components/linear/linear-shell"
import { LinearGraphCard, LinearDataTable, NoPropertyPlaceholder } from "@/components/linear"
import { DateFilterBar } from "@/components/linear/date-filter-bar"
import { useDashboard } from "@/components/linear/dashboard-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, Globe, MousePointerClick } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"

interface SourceData {
    source: string
    medium: string
    users: number
    sessions: number
    bounceRate: number
    percentage: number
}

export default function SourcesPage() {
    const { selectedProperty } = useDashboard()
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            if (!selectedProperty) return
            setLoading(true)
            try {
                const res = await fetch(`/api/analytics?propertyId=${selectedProperty}&reportType=acquisition`)
                const json = await res.json()
                setData(json)
            } catch (error) {
                console.error("Failed to fetch sources data", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [selectedProperty])

    const acquisitionData: SourceData[] = data?.sources || []
    const topSource = acquisitionData.length > 0 ? acquisitionData[0] : null

    // Group by source (ignoring medium for chart simplicity if duplicates exist, but API likely splits them)
    // For chart we'll just take top 8
    const chartData = acquisitionData.slice(0, 8)

    if (!selectedProperty) {
        return (
            <LinearShell>
                <NoPropertyPlaceholder
                    title="Traffic Sources"
                    description="Select a property to see where your traffic is coming from and which channels perform best."
                />
            </LinearShell>
        )
    }

    if (loading) {
        return (
            <LinearShell>
                <div className="flex items-center justify-center h-96 text-zinc-500 animate-pulse">
                    Loading sources data...
                </div>
            </LinearShell>
        )
    }

    return (
        <LinearShell>
            <div className="flex flex-col gap-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Traffic Sources</h1>
                        <p className="text-sm text-zinc-500">Channel performance and user acquisition.</p>
                    </div>
                    <DateFilterBar />
                </div>

                {/* KPI Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-white/20 shadow-lg shadow-zinc-500/5 bg-white/60 backdrop-blur-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-600">Top Source</CardTitle>
                            <Globe className="h-4 w-4 text-zinc-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-zinc-900 truncate">{topSource?.source || "--"}</div>
                            <p className="text-xs text-zinc-500 mt-1">Driving the most traffic</p>
                        </CardContent>
                    </Card>
                    <Card className="border-white/20 shadow-lg shadow-zinc-500/5 bg-white/60 backdrop-blur-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-600">Top Medium</CardTitle>
                            <MousePointerClick className="h-4 w-4 text-zinc-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-zinc-900 truncate capitalize">{topSource?.medium || "--"}</div>
                            <p className="text-xs text-zinc-500 mt-1">Most effective channel</p>
                        </CardContent>
                    </Card>
                    <Card className="border-white/20 shadow-lg shadow-zinc-500/5 bg-white/60 backdrop-blur-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-600">Total Sessions</CardTitle>
                            <ArrowUpRight className="h-4 w-4 text-zinc-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-zinc-900">
                                {data?.totalSessions?.toLocaleString() || 0}
                            </div>
                            <p className="text-xs text-zinc-500 mt-1">Total traffic volume</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Acquisition Chart */}
                    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm flex flex-col h-[400px]">
                        <h3 className="text-sm font-semibold text-zinc-900 mb-6 shrink-0">Top Acquisition Channels</h3>
                        <div className="w-full flex-1 min-h-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={chartData}
                                    margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                    <XAxis
                                        dataKey="source"
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 11, fill: '#71717a' }}
                                        tickFormatter={(val) => val.length > 10 ? val.substring(0, 10) + '...' : val}
                                    />
                                    <YAxis
                                        tickLine={false}
                                        axisLine={false}
                                        tick={{ fontSize: 11, fill: '#71717a' }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    />
                                    <Bar dataKey="sessions" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={32}>
                                        {chartData.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={index === 0 ? "hsl(var(--chart-1))" : "#6366f1"} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Sources Data Table */}
                    <LinearGraphCard title="Source Breakdown">
                        <LinearDataTable<SourceData>
                            data={acquisitionData}
                            columns={[
                                {
                                    header: "Source",
                                    accessorKey: "source",
                                    className: "font-medium capitalize",
                                },
                                {
                                    header: "Medium",
                                    accessorKey: "medium",
                                    className: "capitalize text-zinc-500",
                                },
                                { header: "Sessions", accessorKey: "sessions", className: "text-right" },
                                {
                                    header: "Engagement",
                                    accessorKey: "bounceRate",
                                    className: "text-right text-zinc-500",
                                    cell: (item) => `${((1 - item.bounceRate) * 100).toFixed(1)}%`
                                },
                                {
                                    header: "Share",
                                    accessorKey: "percentage",
                                    className: "text-right font-medium",
                                    cell: (item) => `${item.percentage.toFixed(1)}%`
                                },
                            ]}
                        />
                    </LinearGraphCard>
                </div>
            </div>
        </LinearShell>
    )
}
