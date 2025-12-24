"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Label, Pie, PieChart, XAxis, YAxis, Cell } from "recharts"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent
} from "@/components/ui/chart"
import { useAnalytics } from "@/hooks/use-analytics"

interface OverviewChartsProps {
    propertyId: string
}

export function OverviewCharts({ propertyId }: OverviewChartsProps) {
    const { data } = useAnalytics(propertyId)

    if (!data) return null

    // Process data for charts
    const sessionsData = data.sessionsOverTime?.map((item: any) => ({
        date: new Date(item.date.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: item.date,
        sessions: item.sessions
    })) || []

    // Map traffic sources to pie colors
    const COLORS = [
        "hsl(var(--chart-1))", // Amber
        "#6366f1", // Indigo
        "#10b981", // Emerald
        "#f43f5e", // Rose
        "#0ea5e9", // Sky
    ]

    const trafficSourceData = data.trafficSources?.map((item: any, index: number) => ({
        source: item.source,
        sessions: item.sessions,
        fill: COLORS[index % COLORS.length]
    })) || []

    const pieData = data.trafficSources?.slice(0, 5).map((item: any, index: number) => ({
        name: item.source,
        value: item.sessions,
        fill: COLORS[index % COLORS.length]
    })) || []

    const countryData = data.topCountries?.slice(0, 5).map((item: any, index: number) => ({
        country: item.country,
        sessions: item.sessions,
        fill: COLORS[index % COLORS.length]
    })) || []

    const chartConfig = {
        sessions: {
            label: "Sessions",
            color: "hsl(var(--chart-1))",
        },
        desktop: {
            label: "Desktop",
            color: "hsl(var(--chart-1))",
        },
        mobile: {
            label: "Mobile",
            color: "hsl(var(--chart-2))",
        },
    } satisfies ChartConfig

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-6 mb-8">

            {/* Main Area Chart - Sessions Over Time (Full Width) */}
            <Card className="col-span-full border-white/20 shadow-lg shadow-zinc-500/5 bg-white/60 backdrop-blur-md hover:bg-white/70 transition-colors">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Sessions Overview</CardTitle>
                            <CardDescription>Daily traffic trends over the last 30 days</CardDescription>
                        </div>
                        {/* Optional: Add a subtle badge or metric here */}
                        <div className="flex items-center gap-2 text-sm text-zinc-500">
                            <span className="flex items-center gap-1">
                                <span className="block w-2 h-2 rounded-full bg-[hsl(var(--chart-1))]"></span>
                                Live Data
                            </span>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="px-2 sm:px-6">
                    <ChartContainer
                        config={chartConfig}
                        className="aspect-auto h-[300px] w-full"
                    >
                        <AreaChart
                            accessibilityLayer
                            data={sessionsData}
                            margin={{
                                left: 12,
                                right: 12,
                                top: 12,
                                bottom: 12,
                            }}
                        >
                            <defs>
                                <linearGradient id="fillSessions" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--color-sessions)" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="var(--color-sessions)" stopOpacity={0.01} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#eee" />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={12}
                                minTickGap={32}
                                tickFormatter={(value) => value}
                                style={{ fontSize: '11px', fill: '#888' }}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={12}
                                style={{ fontSize: '11px', fill: '#888' }}
                                tickCount={5}
                            />
                            <ChartTooltip
                                cursor={{ stroke: 'var(--color-sessions)', strokeWidth: 1, strokeDasharray: '4 4' }}
                                content={<ChartTooltipContent indicator="dot" className="w-[150px]" />}
                            />
                            <Area
                                dataKey="sessions"
                                type="monotone" // smooth curve
                                fill="url(#fillSessions)"
                                stroke="var(--color-sessions)"
                                strokeWidth={3}
                                activeDot={{ r: 6, strokeWidth: 0, fill: "var(--color-sessions)" }}
                            />
                        </AreaChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Secondary Charts Row */}

            {/* Pie Chart - Traffic Sources */}
            <Card className="col-span-2 border-white/20 shadow-lg shadow-zinc-500/5 flex flex-col bg-white/60 backdrop-blur-md hover:bg-white/70 transition-colors">
                <CardHeader className="items-center pb-0">
                    <CardTitle className="text-sm font-medium text-zinc-800">Traffic Source Distribution</CardTitle>
                    <CardDescription>Top sources by volume</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-0">
                    <ChartContainer
                        config={chartConfig}
                        className="mx-auto aspect-square max-h-[200px]"
                    >
                        <PieChart>
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Pie
                                data={pieData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={60}
                                strokeWidth={4}
                                stroke="white"
                            >
                                <Label
                                    content={({ viewBox }) => {
                                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                            return (
                                                <text
                                                    x={viewBox.cx}
                                                    y={viewBox.cy}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                >
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={viewBox.cy}
                                                        className="fill-zinc-800 text-2xl font-bold"
                                                    >
                                                        {data.metrics.sessions.toLocaleString()}
                                                    </tspan>
                                                    <tspan
                                                        x={viewBox.cx}
                                                        y={(viewBox.cy || 0) + 20}
                                                        className="fill-zinc-500 text-[10px] uppercase tracking-wider"
                                                    >
                                                        Sessions
                                                    </tspan>
                                                </text>
                                            )
                                        }
                                    }}
                                />
                            </Pie>
                        </PieChart>
                    </ChartContainer>
                </CardContent>
                <CardFooter className="flex-col gap-2 text-sm pt-4">
                    <div className="flex items-center gap-2 font-medium leading-none text-zinc-600">
                        Most traffic from <span className="text-zinc-900 font-semibold">{pieData[0]?.name}</span>
                    </div>
                </CardFooter>
            </Card>

            {/* Bar Chart - Acquisition Channels (Histogram-like) */}
            <Card className="col-span-2 border-white/20 shadow-lg shadow-zinc-500/5 flex flex-col bg-white/60 backdrop-blur-md hover:bg-white/70 transition-colors">
                <CardHeader>
                    <CardTitle className="text-sm font-medium">Acquisition Channels</CardTitle>
                    <CardDescription>Sessions by channel</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                    <ChartContainer config={chartConfig} className="max-h-[200px] w-full">
                        <BarChart
                            accessibilityLayer
                            data={trafficSourceData}
                        >
                            <CartesianGrid vertical={false} strokeDasharray="3 3" />
                            <XAxis
                                dataKey="source"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                tickFormatter={(value) => value.slice(0, 3)} // Truncate for small space
                                style={{ fontSize: '10px' }}
                            />
                            <ChartTooltip
                                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                content={<ChartTooltipContent indicator="dashed" />}
                            />
                            <Bar
                                dataKey="sessions"
                                radius={[4, 4, 0, 0]}
                                barSize={20}
                            />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Bar Chart - Top Countries */}
            <Card className="col-span-2 border-white/20 shadow-lg shadow-zinc-500/5 flex flex-col bg-white/60 backdrop-blur-md hover:bg-white/70 transition-colors">
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-zinc-800">Top Locations</CardTitle>
                    <CardDescription>Sessions by country</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                    <ChartContainer config={chartConfig} className="max-h-[200px] w-full">
                        <BarChart
                            accessibilityLayer
                            data={countryData}
                            layout="vertical"
                            margin={{
                                left: 0,
                                right: 0
                            }}
                        >
                            <CartesianGrid horizontal={false} />
                            <YAxis
                                dataKey="country"
                                type="category"
                                tickLine={false}
                                tickMargin={10}
                                axisLine={false}
                                width={80}
                                style={{ fontSize: '11px' }}
                            />
                            <XAxis dataKey="sessions" type="number" hide />
                            <ChartTooltip
                                cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Bar
                                dataKey="sessions"
                                radius={[0, 4, 4, 0]}
                                barSize={12}
                            />
                        </BarChart>
                    </ChartContainer>
                </CardContent>
            </Card>

            {/* Third Row: Device, Retention, Top Pages */}
            <div className="col-span-full grid gap-6 md:grid-cols-2 lg:grid-cols-6 grid-rows-1">

                {/* Device Breakdown */}
                <Card className="col-span-2 border-white/20 shadow-lg shadow-zinc-500/5 flex flex-col bg-white/60 backdrop-blur-md hover:bg-white/70 transition-colors">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-zinc-800">Device Breakdown</CardTitle>
                        <CardDescription>Sessions by device type</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <ChartContainer config={chartConfig} className="max-h-[200px] w-full">
                            <BarChart
                                accessibilityLayer
                                data={data.deviceBreakdown || []}
                                layout="vertical"
                                margin={{ left: 0, right: 0 }}
                            >
                                <CartesianGrid horizontal={false} />
                                <YAxis
                                    dataKey="device"
                                    type="category"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                    width={70}
                                    style={{ fontSize: '11px' }}
                                />
                                <XAxis dataKey="sessions" type="number" hide />
                                <ChartTooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                                    content={<ChartTooltipContent hideLabel />}
                                />
                                <Bar
                                    dataKey="sessions"
                                    layout="vertical"
                                    radius={4}
                                    barSize={20}
                                >
                                    {/* @ts-ignore */}
                                    {data.deviceBreakdown?.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>

                {/* Top Pages List */}
                <Card className="col-span-2 lg:col-span-4 border-white/20 shadow-lg shadow-zinc-500/5 flex flex-col bg-white/60 backdrop-blur-md hover:bg-white/70 transition-colors">
                    <CardHeader>
                        <CardTitle className="text-sm font-medium text-zinc-800">Top Pages</CardTitle>
                        <CardDescription>Most visited paths</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 overflow-auto">
                        <div className="space-y-4">
                            {data.topPages?.slice(0, 5).map((page: any, i: number) => (
                                <div key={page.path} className="flex items-center">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100/50 border border-white/40 text-xs font-bold text-zinc-500 mr-3">
                                        {i + 1}
                                    </div>
                                    <div className="space-y-1 flex-1">
                                        <p className="text-xs font-medium leading-none text-zinc-900 truncate max-w-[200px] sm:max-w-[300px]">
                                            {page.title}
                                        </p>
                                        <p className="text-[10px] text-zinc-500 truncate">{page.path}</p>
                                    </div>
                                    <div className="font-medium text-xs text-zinc-900 ml-auto">
                                        {page.views.toLocaleString()} <span className="text-[10px] text-zinc-400 font-normal ml-1">views</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    )
}
