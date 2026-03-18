"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { LinearShell } from "@/components/linear/linear-shell"
import { LinearGraphCard, LinearDataTable, NoPropertyPlaceholder } from "@/components/linear"
import { DateFilterBar } from "@/components/linear/date-filter-bar"
import { useDashboard } from "@/components/linear/dashboard-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MousePointerClick, TrendingUp } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { format } from "date-fns"

export default function LandingPagesPage() {
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
        const res = await fetch(`/api/analytics?propertyId=${selectedProperty}&reportType=landing&startDate=${start}&endDate=${end}`)
        const json = await res.json()
        setData(json)
      } catch (error) {
        console.error("Failed to fetch landing pages data", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [selectedProperty, dateRange])

  const pages = data?.landingPages || []
  const top = pages.length > 0 ? pages[0] : null

  if (!selectedProperty) {
    return (
      <LinearShell>
        <NoPropertyPlaceholder title="Landing Pages" description="Select a property to see your top landing pages." />
      </LinearShell>
    )
  }

  if (loading) {
    return (
      <LinearShell>
        <div className="flex items-center justify-center h-96 text-zinc-500 animate-pulse">Loading landing pages...</div>
      </LinearShell>
    )
  }

  return (
    <LinearShell>
      <div className="flex flex-col gap-6 sm:gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900">Landing Pages</h1>
            <p className="text-sm text-zinc-500">Which pages start the most sessions.</p>
          </div>
          <DateFilterBar />
        </div>

        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
          <Card className="border-white/20 shadow-lg shadow-zinc-500/5 bg-white/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-600">Top Landing Page</CardTitle>
              <MousePointerClick className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-900 truncate">{top?.path || "--"}</div>
              <p className="text-xs text-zinc-500 mt-1">Most sessions started</p>
            </CardContent>
          </Card>
          <Card className="border-white/20 shadow-lg shadow-zinc-500/5 bg-white/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-600">Total Sessions</CardTitle>
              <TrendingUp className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-900">{(data?.totalSessions || 0).toLocaleString()}</div>
              <p className="text-xs text-zinc-500 mt-1">Across landing pages</p>
            </CardContent>
          </Card>
          <Card className="border-white/20 shadow-lg shadow-zinc-500/5 bg-white/60 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-600">Tracked Pages</CardTitle>
              <MousePointerClick className="h-4 w-4 text-zinc-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-900">{pages.length}</div>
              <p className="text-xs text-zinc-500 mt-1">In this range</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:space-y-0 lg:grid lg:gap-6 lg:grid-cols-2">
          <LinearGraphCard title="Top Landing Pages" className="h-[280px] sm:h-[380px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={pages.slice(0, 8)} margin={{ top: 5, right: 15, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#eee" />
                <XAxis type="number" hide />
                <YAxis dataKey="path" type="category" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "#71717a" }} width={140} />
                <Tooltip cursor={{ fill: "rgba(0,0,0,0.05)" }} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }} />
                <Bar dataKey="sessions" radius={[0, 4, 4, 0]} barSize={18}>
                  {pages.slice(0, 8).map((_: any, index: number) => (
                    <Cell key={`lp-cell-${index}`} fill={index === 0 ? "hsl(var(--chart-1))" : "#f59e0b"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </LinearGraphCard>

          <LinearGraphCard title="Landing Page Breakdown">
            <LinearDataTable
              data={pages}
              columns={[
                { header: "Page", accessorKey: "path" as any },
                { header: "Sessions", accessorKey: "sessions" as any, className: "text-right" },
                { header: "Users", accessorKey: "users" as any, className: "text-right", mobileHidden: true },
                {
                  header: "Engagement",
                  accessorKey: "engagementRate" as any,
                  className: "text-right text-zinc-500",
                  mobileHidden: true,
                  cell: (i: any) => `${((i.engagementRate || 0) * 100).toFixed(1)}%`,
                },
                { header: "%", accessorKey: "percentage" as any, className: "text-right text-zinc-500", cell: (i: any) => `${(i.percentage || 0).toFixed(1)}%` },
              ]}
            />
          </LinearGraphCard>
        </div>
      </div>
    </LinearShell>
  )
}

