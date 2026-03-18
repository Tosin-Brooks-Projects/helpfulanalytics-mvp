"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState, useCallback } from "react"
import { LinearShell } from "@/components/linear/linear-shell"
import { LinearGraphCard, LinearDataTable, NoPropertyPlaceholder } from "@/components/linear"
import { DateFilterBar } from "@/components/linear/date-filter-bar"
import { useDashboard } from "@/components/linear/dashboard-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Users, Globe, MapPin, ChevronLeft } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts"
import { format } from "date-fns"

export default function AudiencePage() {
    const { selectedProperty, dateRange } = useDashboard()
    const [devicesData, setDevicesData] = useState<any>(null)
    const [locationsData, setLocationsData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    // City drill-down state
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
    const [citiesData, setCitiesData] = useState<any>(null)
    const [citiesLoading, setCitiesLoading] = useState(false)
    const [statesData, setStatesData] = useState<any>(null)
    const [statesLoading, setStatesLoading] = useState(false)
    const [geoTab, setGeoTab] = useState<"cities" | "states">("cities")

    useEffect(() => {
        async function fetchData() {
            if (!selectedProperty) return
            setLoading(true)
            try {
                const start = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "30daysAgo"
                const end = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "today"
                const [devicesRes, locationsRes] = await Promise.all([
                    fetch(`/api/analytics?propertyId=${selectedProperty}&reportType=devices&startDate=${start}&endDate=${end}`),
                    fetch(`/api/analytics?propertyId=${selectedProperty}&reportType=locations&startDate=${start}&endDate=${end}`)
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
    }, [selectedProperty, dateRange])

    const handleCountryClick = useCallback(async (countryName: string) => {
        if (!selectedProperty) return
        setSelectedCountry(countryName)
        setGeoTab("cities")
        setCitiesLoading(true)
        setCitiesData(null)
        setStatesLoading(true)
        setStatesData(null)
        try {
            const start = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "30daysAgo"
            const end = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "today"

            const [citiesRes, statesRes] = await Promise.all([
                fetch(`/api/analytics?propertyId=${selectedProperty}&reportType=cities&country=${encodeURIComponent(countryName)}&startDate=${start}&endDate=${end}`),
                fetch(`/api/analytics?propertyId=${selectedProperty}&reportType=states&country=${encodeURIComponent(countryName)}&startDate=${start}&endDate=${end}`)
            ])

            const [citiesJson, statesJson] = await Promise.all([citiesRes.json(), statesRes.json()])
            setCitiesData(citiesJson)
            setStatesData(statesJson)
        } catch (error) {
            console.error("Failed to fetch cities data", error)
        } finally {
            setCitiesLoading(false)
            setStatesLoading(false)
        }
    }, [selectedProperty, dateRange])

    const handleBackToCountries = useCallback(() => {
        setSelectedCountry(null)
        setCitiesData(null)
        setStatesData(null)
    }, [])

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

    // City view
    if (selectedCountry) {
        const cities = citiesData?.cities || []
        const topCity = cities.length > 0 ? cities[0] : null
        const states = statesData?.states || []
        const topState = states.length > 0 ? states[0] : null

        return (
            <LinearShell>
                <div className="flex flex-col gap-6 sm:gap-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <button
                                onClick={handleBackToCountries}
                                className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 transition-colors mb-1"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Back to Countries
                            </button>
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">{selectedCountry}</h1>
                            <p className="text-sm text-zinc-500">City-level traffic breakdown.</p>
                        </div>
                        <DateFilterBar />
                    </div>

                    {(citiesLoading || statesLoading) ? (
                        <div className="flex items-center justify-center h-64 text-zinc-500 animate-pulse">
                            Loading regional data...
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setGeoTab("cities")}
                                    className={`text-xs font-semibold px-3 py-1.5 rounded-md border transition-colors ${
                                        geoTab === "cities"
                                            ? "bg-amber-500 text-white border-amber-500"
                                            : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
                                    }`}
                                >
                                    Cities
                                </button>
                                <button
                                    onClick={() => setGeoTab("states")}
                                    className={`text-xs font-semibold px-3 py-1.5 rounded-md border transition-colors ${
                                        geoTab === "states"
                                            ? "bg-amber-500 text-white border-amber-500"
                                            : "bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-50"
                                    }`}
                                >
                                    States / Regions
                                </button>
                            </div>

                            {/* City KPI Cards */}
                            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
                                <Card className="border-white/20 shadow-lg shadow-zinc-500/5 bg-white/60 backdrop-blur-md">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-zinc-600">{geoTab === "cities" ? "Top City" : "Top State"}</CardTitle>
                                        <MapPin className="h-4 w-4 text-zinc-400" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-zinc-900">
                                            {geoTab === "cities" ? (topCity?.city || "--") : (topState?.state || "--")}
                                        </div>
                                        <p className="text-xs text-zinc-500 mt-1">
                                            {geoTab === "cities"
                                                ? (topCity ? `${topCity.percentage.toFixed(1)}% of country sessions` : "No data")
                                                : (topState ? `${topState.percentage.toFixed(1)}% of country sessions` : "No data")}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="border-white/20 shadow-lg shadow-zinc-500/5 bg-white/60 backdrop-blur-md">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-zinc-600">{geoTab === "cities" ? "Active Cities" : "Active States"}</CardTitle>
                                        <Globe className="h-4 w-4 text-zinc-400" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-zinc-900">{geoTab === "cities" ? cities.length : states.length}</div>
                                        <p className="text-xs text-zinc-500 mt-1">{geoTab === "cities" ? "Cities with traffic" : "States with traffic"}</p>
                                    </CardContent>
                                </Card>
                                <Card className="border-white/20 shadow-lg shadow-zinc-500/5 bg-white/60 backdrop-blur-md">
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium text-zinc-600">Total Sessions</CardTitle>
                                        <Users className="h-4 w-4 text-zinc-400" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold text-zinc-900">
                                            {(geoTab === "cities" ? citiesData?.totalSessions : statesData?.totalSessions)?.toLocaleString() || 0}
                                        </div>
                                        <p className="text-xs text-zinc-500 mt-1">In {selectedCountry}</p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Chart + Table — stacked on mobile, side-by-side on desktop */}
                            <div className="space-y-6 lg:space-y-0 lg:grid lg:gap-6 lg:grid-cols-2">
                                {/* Top Cities Bar Chart */}
                                <LinearGraphCard
                                    title={`${geoTab === "cities" ? "Top Cities" : "Top States"} in ${selectedCountry}`}
                                    className="h-[280px] sm:h-[380px]"
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            layout="vertical"
                                            data={(geoTab === "cities" ? cities : states).slice(0, 6)}
                                            margin={{ top: 5, right: 15, left: 0, bottom: 5 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                                            <XAxis type="number" hide />
                                            <YAxis
                                                dataKey={geoTab === "cities" ? "city" : "state"}
                                                type="category"
                                                tickLine={false}
                                                axisLine={false}
                                                tick={{ fontSize: 11, fill: '#71717a' }}
                                                width={75}
                                            />
                                            <Tooltip
                                                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                            />
                                            <Bar dataKey="sessions" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20}>
                                                {(geoTab === "cities" ? cities : states).slice(0, 6).map((_: any, index: number) => (
                                                    <Cell key={`city-cell-${index}`} fill={index === 0 ? "hsl(var(--chart-1))" : "#6366f1"} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </LinearGraphCard>

                                {/* City Table */}
                                <LinearGraphCard title={geoTab === "cities" ? "City Breakdown" : "State Breakdown"}>
                                    <LinearDataTable
                                        data={geoTab === "cities" ? cities : states}
                                        columns={[
                                            { header: geoTab === "cities" ? "City" : "State", accessorKey: (geoTab === "cities" ? "city" : "state") as any },
                                            { header: "Sessions", accessorKey: "sessions" as any, className: "text-right" },
                                            { header: "Users", accessorKey: "users" as any, className: "text-right", mobileHidden: true },
                                            {
                                                header: "Engagement",
                                                accessorKey: "bounceRate" as any,
                                                className: "text-right text-zinc-500",
                                                mobileHidden: true,
                                                cell: (item: any) => `${((1 - item.bounceRate) * 100).toFixed(1)}%`
                                            },
                                        ]}
                                    />
                                </LinearGraphCard>
                            </div>
                        </>
                    )}
                </div>
            </LinearShell>
        )
    }

    // Country view (default)
    return (
        <LinearShell>
            <div className="flex flex-col gap-6 sm:gap-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">Audience</h1>
                        <p className="text-sm text-zinc-500">Global reach and user demographics.</p>
                    </div>
                    <DateFilterBar />
                </div>

                {/* KPI Cards */}
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
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

                {/* Chart + Table — stacked on mobile, side-by-side on desktop */}
                <div className="space-y-6 lg:space-y-0 lg:grid lg:gap-6 lg:grid-cols-2">
                    {/* Top Countries Bar Chart */}
                    <LinearGraphCard title="Top Countries by Traffic" className="h-[280px] sm:h-[380px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                layout="vertical"
                                data={countries.slice(0, 6)}
                                margin={{ top: 5, right: 15, left: 0, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                                <XAxis type="number" hide />
                                <YAxis
                                    dataKey="country"
                                    type="category"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 11, fill: '#71717a' }}
                                    width={75}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar
                                    dataKey="sessions"
                                    fill="#6366f1"
                                    radius={[0, 4, 4, 0]}
                                    barSize={20}
                                    className="cursor-pointer"
                                    onClick={(data: any) => {
                                        if (data?.country) handleCountryClick(data.country)
                                    }}
                                >
                                    {countries.slice(0, 6).map((entry: any, index: number) => (
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
                                { header: "Users", accessorKey: "users", className: "text-right", mobileHidden: true },
                                {
                                    header: "Engagement",
                                    accessorKey: "bounceRate",
                                    className: "text-right text-zinc-500",
                                    mobileHidden: true,
                                    cell: (item) => `${((1 - item.bounceRate) * 100).toFixed(1)}%`
                                },
                            ]}
                            onRowClick={(item) => handleCountryClick(item.country)}
                        />
                    </LinearGraphCard>
                </div>
            </div>
        </LinearShell>
    )
}
