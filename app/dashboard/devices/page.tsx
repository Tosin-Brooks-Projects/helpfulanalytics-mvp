"use client"

import { useEffect, useState } from "react"
import { LinearShell } from "@/components/linear/linear-shell"
import { LinearGraphCard, LinearDataTable, NoPropertyPlaceholder } from "@/components/linear"
import { DateFilterBar } from "@/components/linear/date-filter-bar"
import { useDashboard } from "@/components/linear/dashboard-context"
import { useAnalytics } from "@/hooks/use-analytics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone, Monitor, Tablet, Laptop, Chrome, Globe, Laptop2, MonitorSmartphone } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"

export default function DevicesPage() {
    const { selectedProperty } = useDashboard()
    // Explicitly fetching report type 'devices'
    const [reportData, setReportData] = useState<any>(null)
    const [reportLoading, setReportLoading] = useState(true)

    useEffect(() => {
        async function fetchDevices() {
            if (!selectedProperty) return
            setReportLoading(true)
            try {
                const res = await fetch(`/api/analytics?propertyId=${selectedProperty}&reportType=devices`)
                const json = await res.json()
                setReportData(json)
            } catch (error) {
                console.error("Failed to fetch devices report", error)
            } finally {
                setReportLoading(false)
            }
        }
        fetchDevices()
    }, [selectedProperty])

    const COLORS = ["hsl(var(--chart-1))", "#6366f1", "#10b981", "#f43f5e"]

    if (!selectedProperty) {
        return (
            <LinearShell>
                <NoPropertyPlaceholder
                    title="Device Analytics"
                    description="Select a property to analyze user devices and browsers."
                />
            </LinearShell>
        )
    }

    if (reportLoading) {
        return (
            <LinearShell>
                <div className="flex items-center justify-center h-96 text-zinc-500 animate-pulse">
                    Loading device analytics...
                </div>
            </LinearShell>
        )
    }

    const devices = reportData?.devices || []
    const browsers = reportData?.browsers || []
    const osData = reportData?.os || []
    const screenData = reportData?.screens || []

    const pieData = devices.map((d: any, i: number) => ({
        name: d.deviceCategory,
        value: d.sessions,
        fill: COLORS[i % COLORS.length]
    }))

    const getDeviceIcon = (category: string) => {
        const c = category.toLowerCase()
        if (c.includes("mobile")) return <Smartphone className="h-4 w-4" />
        if (c.includes("tablet")) return <Tablet className="h-4 w-4" />
        return <Monitor className="h-4 w-4" />
    }

    return (
        <LinearShell>
            <div className="flex flex-col gap-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Devices & Tech</h1>
                        <p className="text-sm text-zinc-500">Breakdown of user technology, OS, and platforms.</p>
                    </div>
                    <DateFilterBar />
                </div>

                {/* KPI Overview Row */}
                <div className="grid gap-4 md:grid-cols-4">
                    {/* Top Device */}
                    <Card className="border-white/20 shadow-lg shadow-zinc-500/5 bg-white/60 backdrop-blur-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-600">Top Device</CardTitle>
                            <Smartphone className="h-4 w-4 text-zinc-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-zinc-900 capitalize">
                                {devices[0]?.deviceCategory || "--"}
                            </div>
                            <p className="text-xs text-zinc-500 mt-1">
                                {devices[0]?.percentage.toFixed(1)}% of sessions
                            </p>
                        </CardContent>
                    </Card>
                    {/* Top OS */}
                    <Card className="border-white/20 shadow-lg shadow-zinc-500/5 bg-white/60 backdrop-blur-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-600">Top OS</CardTitle>
                            <Laptop2 className="h-4 w-4 text-zinc-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-zinc-900 truncate">
                                {osData[0]?.name || "--"}
                            </div>
                            <p className="text-xs text-zinc-500 mt-1">
                                {osData[0]?.percentage.toFixed(1)}% usage
                            </p>
                        </CardContent>
                    </Card>
                    {/* Top Browser */}
                    <Card className="border-white/20 shadow-lg shadow-zinc-500/5 bg-white/60 backdrop-blur-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-600">Top Browser</CardTitle>
                            <Globe className="h-4 w-4 text-zinc-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-zinc-900 truncate">
                                {browsers[0]?.browser || "--"}
                            </div>
                            <p className="text-xs text-zinc-500 mt-1">{browsers[0]?.percentage.toFixed(1)}% usage</p>
                        </CardContent>
                    </Card>
                    {/* Top Screen */}
                    <Card className="border-white/20 shadow-lg shadow-zinc-500/5 bg-white/60 backdrop-blur-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-600">Top Screen</CardTitle>
                            <MonitorSmartphone className="h-4 w-4 text-zinc-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-zinc-900 truncate">
                                {screenData[0]?.resolution || "--"}
                            </div>
                            <p className="text-xs text-zinc-500 mt-1">Most common res</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Device Category Chart */}
                    <LinearGraphCard title="Device Breakdown" className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </LinearGraphCard>

                    {/* Operating System Chart */}
                    <LinearGraphCard title="Operating System" className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={osData.slice(0, 6)}
                                margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 12, fill: '#71717a' }}
                                    width={90}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="sessions" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={24}>
                                    {osData.slice(0, 6).map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? "hsl(var(--chart-1))" : "#6366f1"} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </LinearGraphCard>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Browser Table */}
                    <LinearGraphCard title="Top Browsers">
                        <LinearDataTable
                            data={browsers.slice(0, 8)}
                            columns={[
                                { header: "Browser", accessorKey: "browser" },
                                { header: "Sessions", accessorKey: "sessions", className: "text-right" },
                                {
                                    header: "Share",
                                    accessorKey: "percentage",
                                    className: "text-right font-medium",
                                    cell: (item) => `${item.percentage.toFixed(1)}%`
                                },
                            ]}
                        />
                    </LinearGraphCard>

                    {/* Screen Resolution Table */}
                    <LinearGraphCard title="Screen Resolutions">
                        <LinearDataTable
                            data={screenData.slice(0, 8)}
                            columns={[
                                { header: "Resolution", accessorKey: "resolution" },
                                { header: "Sessions", accessorKey: "sessions", className: "text-right" },
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
