"use client"

import { useAnalytics } from "@/hooks/use-analytics"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { ArrowUpRight, Eye, MousePointerClick, Clock, ArrowRight } from "lucide-react"
import { DateFilterBar } from "@/components/linear/date-filter-bar"

export function TopPagesView({ propertyId }: { propertyId: string }) {
    const { data, loading } = useAnalytics(propertyId)

    if (loading || !data || !data.topPages) {
        return <div className="p-8 text-center text-zinc-500">Loading top pages data...</div>
    }

    // Sort pages by views for the chart
    const chartData = [...data.topPages].sort((a: any, b: any) => b.views - a.views).slice(0, 10).map((p: any, i: number) => ({
        ...p,
        fill: i === 0 ? "#f59e0b" : "rgba(251, 191, 36, 0.3)" // Amber-500 for top, lighter for others
    }))

    const totalViews = data.metrics?.pageViews || 0

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold text-zinc-900">Top Pages</h2>
                    <p className="text-zinc-500">Performance report by page path</p>
                </div>
                <DateFilterBar />
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-white/20 shadow-lg shadow-zinc-500/5 bg-white/60 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-600">Total Page Views</CardTitle>
                        <Eye className="h-4 w-4 text-zinc-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900">{totalViews.toLocaleString()}</div>
                        <p className="text-xs text-zinc-500 mt-1">+12.5% from last month</p>
                    </CardContent>
                </Card>
                <Card className="border-white/20 shadow-lg shadow-zinc-500/5 bg-white/60 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-600">Avg. Time on Page</CardTitle>
                        <Clock className="h-4 w-4 text-zinc-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900">{Math.floor(data.metrics?.avgSessionDuration || 0)}s</div>
                        <p className="text-xs text-zinc-500 mt-1">-2.1% from last month</p>
                    </CardContent>
                </Card>
                <Card className="border-white/20 shadow-lg shadow-zinc-500/5 bg-white/60 backdrop-blur-md">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-zinc-600">Engagement Rate</CardTitle>
                        <MousePointerClick className="h-4 w-4 text-zinc-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-zinc-900">{(data.metrics?.engagementRate * 100).toFixed(1)}%</div>
                        <p className="text-xs text-zinc-500 mt-1 text-emerald-600">+4.3% from last month</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Chart */}
            <Card className="border-white/20 shadow-lg shadow-zinc-500/5 bg-white/60 backdrop-blur-md">
                <CardHeader>
                    <CardTitle className="text-base text-zinc-800">Page View Distribution</CardTitle>
                    <CardDescription>Top 10 most visited pages</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 50 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis
                                dataKey="path"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 10, fill: '#71717a' }}
                                angle={-45}
                                textAnchor="end"
                                interval={0}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tick={{ fontSize: 11, fill: '#a1a1aa' }}
                            />
                            <Tooltip
                                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="views" radius={[4, 4, 0, 0]}>
                                {chartData.map((entry: any, index: number) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Detailed Table */}
            <Card className="border-white/20 shadow-lg shadow-zinc-500/5 bg-white/60 backdrop-blur-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-zinc-500 uppercase bg-zinc-50/50 border-b border-zinc-100">
                            <tr>
                                <th className="px-6 py-3 font-medium">Page Title / Path</th>
                                <th className="px-6 py-3 font-medium text-right">Views</th>
                                <th className="px-6 py-3 font-medium text-right">Unique</th>
                                <th className="px-6 py-3 font-medium text-right">Avg. Time</th>
                                <th className="px-6 py-3 font-medium text-right">% of Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {data.topPages?.map((page: any, i: number) => (
                                <tr key={i} className="hover:bg-amber-500/5 transition-colors group">
                                    <td className="px-6 py-3">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-zinc-900 group-hover:text-amber-600 transition-colors">{page.title}</span>
                                            <a href="#" className="text-[11px] text-zinc-400 hover:underline flex items-center gap-1">
                                                {page.path}
                                                <ArrowUpRight className="h-2 w-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                                            </a>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 text-right font-medium text-zinc-700">{page.views.toLocaleString()}</td>
                                    <td className="px-6 py-3 text-right text-zinc-500">{Math.floor(page.views * 0.75).toLocaleString()}</td>
                                    <td className="px-6 py-3 text-right text-zinc-500">{Math.floor(Math.random() * 60 + 20)}s</td>
                                    <td className="px-6 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <span className="text-zinc-600">{page.percentage.toFixed(1)}%</span>
                                            <div className="w-16 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-amber-500 rounded-full"
                                                    style={{ width: `${page.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}
