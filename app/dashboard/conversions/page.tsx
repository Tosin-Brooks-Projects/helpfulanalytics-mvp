"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { LinearShell } from "@/components/linear/linear-shell"
import { LinearGraphCard, LinearDataTable, NoPropertyPlaceholder } from "@/components/linear"
import { DateFilterBar } from "@/components/linear/date-filter-bar"
import { useDashboard } from "@/components/linear/dashboard-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, TrendingUp } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { format } from "date-fns"

export default function ConversionsPage() {
  const { selectedProperty, dateRange } = useDashboard()
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      if (!selectedProperty) return
      setLoading(true)
      try {
        const start = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : "30daysAgo"
        const end = dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : "today"
        const res = await fetch(`/api/analytics?propertyId=${selectedProperty}&reportType=conversions&startDate=${start}&endDate=${end}`)
        const json = await res.json()
        setData(json)
      } catch (error) {
        console.error("Failed to fetch conversions data", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedProperty, dateRange])

  const conversions = data?.conversions || []
  const top = conversions.length > 0 ? conversions[0] : null

  if (!selectedProperty) {
    return (
      <LinearShell>
        <NoPropertyPlaceholder title="Conversions" description="Select a property to see your key events (conversions)." />
      </LinearShell>
    )
  }

  if (loading) {
    return (
      <LinearShell>
        <div className="flex items-center justify-center h-96 text-zinc-500 animate-pulse">Loading conversions...</div>
      </LinearShell>
    )
  }

  return (
    <LinearShell>
      <div className="flex flex-col gap-6 sm:gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">Conversions</h1>
            <p className="text-sm text-zinc-500">Key events (GA4 conversions) by volume.</p>
          </div>
          <DateFilterBar />
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
          <Card className="border-white/20 shadow-lg shadow-zinc-500/5 bg-white/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-600">Top Conversion</CardTitle>
              <Target className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-900 truncate">{top?.eventName || "--"}</div>
              <p className="text-xs text-zinc-500 mt-1">Highest key events</p>
            </CardContent>
          </Card>
          <Card className="border-white/20 shadow-lg shadow-zinc-500/5 bg-white/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-600">Total Key Events</CardTitle>
              <TrendingUp className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-900">{(data?.totalKeyEvents || 0).toLocaleString()}</div>
              <p className="text-xs text-zinc-500 mt-1">Across key events</p>
            </CardContent>
          </Card>
          <Card className="border-white/20 shadow-lg shadow-zinc-500/5 bg-white/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-600">Key Events Tracked</CardTitle>
              <Target className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-900">{conversions.length}</div>
              <p className="text-xs text-zinc-500 mt-1">In this range</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:space-y-0 lg:grid lg:gap-6 lg:grid-cols-2">
          <LinearGraphCard title="Top Key Events" className="h-[280px] sm:h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={conversions.slice(0, 8)} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                <XAxis type="number" hide />
                <YAxis dataKey="eventName" type="category" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#71717a" }} width={120} />
                <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                <Bar dataKey="keyEvents" radius={[0, 4, 4, 0]} barSize={18}>
                  {conversions.slice(0, 8).map((_: any, index: number) => (
                    <Cell key={`conv-cell-${index}`} fill={index === 0 ? "hsl(var(--chart-1))" : "#10b981"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </LinearGraphCard>

          <LinearGraphCard title="Conversion Breakdown">
            <LinearDataTable
              data={conversions}
              columns={[
                { header: "Key event", accessorKey: "eventName" as any },
                { header: "Key events", accessorKey: "keyEvents" as any, className: "text-right" },
                { header: "Users", accessorKey: "users" as any, className: "text-right", mobileHidden: true },
                { header: "%", accessorKey: "percentage" as any, className: "text-right text-zinc-500", cell: (i: any) => `${(i.percentage || 0).toFixed(1)}%` },
              ]}
            />
          </LinearGraphCard>
        </div>
      </div>
    </LinearShell>
  )
}

