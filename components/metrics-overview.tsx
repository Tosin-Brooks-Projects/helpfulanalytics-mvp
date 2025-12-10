"use client"

import { Users, Clock, MousePointer2, Activity } from "lucide-react"
import { StatCard } from "@/components/ui/stat-card"
import { AIInsightsPanel } from "@/components/ai-insights-panel"

interface MetricsOverviewProps {
  metrics: {
    activeUsers: number
    totalUsers: number
    averageSessionDuration: number
    screenPageViews: number
    bounceRate: number
  } | null
  loading: boolean
  error: string | null
}

export function MetricsOverview({ metrics, loading, error }: MetricsOverviewProps) {
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="rounded-md bg-destructive/15 p-4 text-destructive">Error: {error}</div>
  }

  if (!metrics) {
    return <div>No data available</div>
  }

  // Mock data for sparklines (in a real app, this would come from the API)
  const mockTrendData = [12, 18, 15, 25, 22, 30, 28, 35, 40, 38, 45, 42]
  const mockUsersData = [100, 120, 115, 130, 140, 135, 150, 160, 155, 170, 180, 190]
  const mockBounceData = [45, 42, 44, 40, 38, 35, 36, 34, 32, 30, 28, 25]

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value={metrics.totalUsers.toLocaleString()}
          icon={Users}
          description="Total users in selected period"
          trend={{ value: 12, label: "vs last period" }}
          chartData={mockUsersData}
        />
        <StatCard
          title="Active Users"
          value={metrics.activeUsers.toLocaleString()}
          icon={Activity}
          description="Users active in the last 30 minutes"
          chartData={mockTrendData}
          customTitle={
            <div className="flex items-center gap-2">
              <span>Active Users</span>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
            </div>
          }
        />
        <StatCard
          title="Avg. Session Duration"
          value={`${Math.round(metrics.averageSessionDuration)}s`}
          icon={Clock}
          description="Average time spent on site"
          trend={{ value: 5, label: "vs last period" }}
          chartData={mockTrendData}
        />
        <StatCard
          title="Bounce Rate"
          value={`${(metrics.bounceRate * 100).toFixed(1)}%`}
          icon={MousePointer2}
          description="Percentage of single-page sessions"
          trend={{ value: -2.5, label: "vs last period" }}
          chartData={mockBounceData}
        />
      </div>

      {/* AI Insights Panel */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-3">
          <AIInsightsPanel />
        </div>
      </div>
    </div>
  )
}
