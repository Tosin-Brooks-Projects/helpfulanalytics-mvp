"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Monitor, Smartphone, Tablet } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"

interface DeviceData {
  deviceCategory: string
  sessions: number
  users: number
  bounceRate: number
  avgSessionDuration: number
  percentage: number
}

interface BrowserData {
  browser: string
  sessions: number
  percentage: number
}

interface DevicesReportProps {
  data?: {
    devices: DeviceData[]
    browsers: BrowserData[]
    totalSessions: number
  }
  loading?: boolean
  error?: string | null
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--muted-foreground))", "hsl(var(--border))"]

export function DevicesReport({ data, loading, error }: DevicesReportProps) {
  if (loading) {
    return (
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Devices</CardTitle>
          <CardDescription>Sessions by device category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full bg-muted/20 animate-pulse rounded-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="col-span-3 border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-600">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!data || !data.devices || data.devices.length === 0) {
    return (
      <Card className="col-span-3">
        <CardHeader>
          <CardTitle>Devices</CardTitle>
          <CardDescription>No device data available</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center text-muted-foreground">
          No data
        </CardContent>
      </Card>
    )
  }

  const chartData = data.devices.map(d => ({
    name: d.deviceCategory,
    value: d.sessions
  }))

  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle>Devices</CardTitle>
        <CardDescription>Sessions by device category</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ borderRadius: "8px", border: "1px solid hsl(var(--border))", background: "hsl(var(--background))" }}
                itemStyle={{ color: "hsl(var(--foreground))" }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
