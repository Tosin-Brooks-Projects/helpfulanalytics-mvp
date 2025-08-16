"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Eye, MousePointer, Clock } from "lucide-react"

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
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse w-16 mb-2" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-red-600">Error loading metrics: {error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-500">No metrics data available</p>
        </CardContent>
      </Card>
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
      title: "Sessions",
      value: formatNumber(data.sessions),
      icon: Users,
      description: "Total sessions",
    },
    {
      title: "Users",
      value: formatNumber(data.users),
      icon: Users,
      description: "Unique visitors",
    },
    {
      title: "Page Views",
      value: formatNumber(data.pageViews),
      icon: Eye,
      description: "Total page views",
    },
    {
      title: "Bounce Rate",
      value: `${(data.bounceRate * 100).toFixed(1)}%`,
      icon: MousePointer,
      description: "Single-page sessions",
    },
    {
      title: "Avg. Session Duration",
      value: formatDuration(data.avgSessionDuration),
      icon: Clock,
      description: "Time per session",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {metrics.map((metric, index) => {
        const Icon = metric.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">{metric.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
