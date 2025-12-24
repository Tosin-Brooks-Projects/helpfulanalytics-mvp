"use client"

import { useEffect, useState } from "react"
import { LinearShell } from "@/components/linear/linear-shell"
import { LinearGraphCard, LinearDataTable, NoPropertyPlaceholder } from "@/components/linear"
import { useDashboard } from "@/components/linear/dashboard-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, Globe, MapPin } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts"

export default function AudiencePage() {
    const { selectedProperty } = useDashboard()
    const [devicesData, setDevicesData] = useState<any>(null)
    const [locationsData, setLocationsData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            if (!selectedProperty) return
            setLoading(true)
            try {
                const [devicesRes, locationsRes] = await Promise.all([
                    fetch(`/api/analytics?propertyId=${selectedProperty}&reportType=devices`),
                    fetch(`/api/analytics?propertyId=${selectedProperty}&reportType=locations`)
                ])

                const devicesJson = await devicesRes.json()
                const locationsJson = await locationsRes.json()

                setDevicesData(devicesJson)
                setLocationsData(locationsJson)
            } catch (error) {
                console.error("Failed to fetch audience data", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [selectedProperty])

    const COLORS = ["hsl(var(--chart-1))", "#6366f1", "#10b981", "#f43f5e", "#0ea5e9"]

    if (!selectedProperty) {
        return (
            <LinearShell>
                <NoPropertyPlaceholder
                    title="Audience Insights"
                    description="Select a property to see where your users are from and what devices they use."
                />
            </LinearShell>
        )
    }

    if (loading) {
        return (
            <LinearShell>
                <div className="flex items-center justify-center h-96 text-zinc-500 animate-pulse">
                    Loading audience data...
                </div>
            </LinearShell>
        )
    }

    const countries = locationsData?.countries || []
    const topCountry = countries.length > 0 ? countries[0] : null
    const chartData = countries.slice(0, 10)

    // Calculate total users for percentages if needed, though API provides 'percentage'

    return (
        <LinearShell>
            <div className="flex flex-col gap-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Audience</h1>
                    <p className="text-sm text-zinc-500">Global reach and user demographics.</p>
                </div>

                {/* KPI Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                    <Card className="border-white/20 shadow-lg shadow-zinc-500/5 bg-white/60 backdrop-blur-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-600">Top Country</CardTitle>
                            <MapPin className="h-4 w-4 text-zinc-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-zinc-900">{topCountry?.country || "--"}</div>
                            <p className="text-xs text-zinc-500 mt-1">
                                {topCountry ? `${topCountry.percentage.toFixed(1)}% of total sessions` : "No data"}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="border-white/20 shadow-lg shadow-zinc-500/5 bg-white/60 backdrop-blur-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-600">Active Locations</CardTitle>
                            <Globe className="h-4 w-4 text-zinc-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-zinc-900">{countries.length}</div>
                            <p className="text-xs text-zinc-500 mt-1">Countries with traffic</p>
                        </CardContent>
                    </Card>
                    <Card className="border-white/20 shadow-lg shadow-zinc-500/5 bg-white/60 backdrop-blur-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-zinc-600">Total Users</CardTitle>
                            <Users className="h-4 w-4 text-zinc-400" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-zinc-900">
                                {locationsData?.totalSessions?.toLocaleString() || 0}
                            </div>
                            <p className="text-xs text-zinc-500 mt-1">Sessions tracked</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Top Countries Bar Chart */}
                    <LinearGraphCard title="Top Countries by Traffic" className="h-[400px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={countries.slice(0, 8)}
                                margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="country"
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
                                    {countries.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={index === 0 ? "hsl(var(--chart-1))" : "#6366f1"} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </LinearGraphCard>

                    {/* Detailed Country Table */}
                    <LinearGraphCard title="Location Breakdown">
                        <LinearDataTable
                            data={countries}
                            columns={[
                                { header: "Country", accessorKey: "country" },
                                { header: "Sessions", accessorKey: "sessions", className: "text-right" },
                                { header: "Users", accessorKey: "users", className: "text-right" },
                                {
                                    header: "Engagement",
                                    accessorKey: "bounceRate",
                                    className: "text-right text-zinc-500",
                                    cell: (item) => `${((1 - item.bounceRate) * 100).toFixed(1)}%`
                                },
                            ]}
                        />
                    </LinearGraphCard>
                </div>
            </div>
        </LinearShell>
    )
}
