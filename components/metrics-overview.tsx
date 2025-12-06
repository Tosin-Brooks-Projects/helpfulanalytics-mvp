"use client"

import { Users, Eye, MousePointer, Clock } from "lucide-react"
import { StatCard } from "@/components/ui/stat-card"

interface MetricsData {
  sessions: number
  users: number
  pageViews: number
  bounceRate: number
  avgSessionDuration: number
}

interface MetricsOverviewProps {
  data?: MetricsData
  loading?: boolean
  error?: string | null
}

export function MetricsOverview({ data, loading, error }: MetricsOverviewProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 rounded-xl border bg-card/50 animate-pulse" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-600 dark:bg-red-950/50 dark:border-red-900 dark:text-red-400">
        Error loading metrics: {error}
      </div>
    )
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center text-muted-foreground">
        No metrics data available
      </div>
    )
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toLocaleString()
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const metrics = [
    {
      title: "Total Sessions",
      value: formatNumber(data.sessions),
      icon: Users,
      description: "Total sessions",
      trend: { value: 12, label: "vs last month" }, // Simulated trend
    },
    {
      title: "Unique Users",
      value: formatNumber(data.users),
      icon: Users,
      description: "Unique visitors",
      trend: { value: 8, label: "vs last month" }, // Simulated trend
    },
    {
      title: "Page Views",
      value: formatNumber(data.pageViews),
      icon: Eye,
      description: "Total page views",
      trend: { value: -2, label: "vs last month" }, // Simulated trend
    },
    {
      title: "Bounce Rate",
      value: `${(data.bounceRate * 100).toFixed(1)}%`,
      icon: MousePointer,
      description: "Single-page sessions",
      trend: { value: -5, label: "vs last month" }, // Simulated trend (negative is good here usually, but keeping simple)
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <StatCard
          key={index}
          index={index}
          title={metric.title}
          value={metric.value}
          icon={metric.icon}
          description={metric.description}
          trend={metric.trend}
        />
      ))}
    </div>
  )
}
