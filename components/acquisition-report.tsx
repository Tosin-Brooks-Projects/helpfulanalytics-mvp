"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, UserPlus, Clock, MousePointer } from "lucide-react"

interface AcquisitionData {
  source: string
  medium: string
  sessions: number
  users: number
  newUsers: number
  bounceRate: number
  avgSessionDuration: number
  percentage: number
}

interface AcquisitionReportProps {
  data?: {
    sources: AcquisitionData[]
    totalSessions: number
  }
  loading?: boolean
  error?: string | null
}

export function AcquisitionReport({ data, loading, error }: AcquisitionReportProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Traffic Acquisition
          </CardTitle>
          <CardDescription>How visitors find your site</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center p-4 border rounded">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-48" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
                </div>
                <div className="h-6 bg-gray-200 rounded animate-pulse w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Traffic Acquisition
          </CardTitle>
          <CardDescription>How visitors find your site</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Error loading acquisition data: {error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!data || !data.sources || data.sources.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Traffic Acquisition
          </CardTitle>
          <CardDescription>How visitors find your site</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No acquisition data available</p>
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

  const getSourceIcon = (source: string, medium: string) => {
    const lowerSource = source.toLowerCase()
    const lowerMedium = medium.toLowerCase()

    if (lowerSource.includes("google") || lowerMedium.includes("organic")) {
      return "🔍"
    }
    if (lowerSource.includes("facebook") || lowerSource.includes("instagram")) {
      return "📱"
    }
    if (lowerSource.includes("twitter") || lowerSource.includes("linkedin")) {
      return "🐦"
    }
    if (lowerMedium.includes("email")) {
      return "📧"
    }
    if (lowerMedium.includes("referral")) {
      return "🔗"
    }
    if (lowerMedium.includes("cpc") || lowerMedium.includes("paid")) {
      return "💰"
    }
    if (lowerSource === "(direct)") {
      return "🌐"
    }
    return "📊"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Traffic Acquisition
        </CardTitle>
        <CardDescription>
          Traffic sources • Total: {formatNumber(data.totalSessions)} sessions from {data.sources.length} sources
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Source / Medium</TableHead>
              <TableHead className="text-right">Sessions</TableHead>
              <TableHead className="text-right">Users</TableHead>
              <TableHead className="text-right">New Users</TableHead>
              <TableHead className="text-right">Avg. Duration</TableHead>
              <TableHead className="text-right">Bounce Rate</TableHead>
              <TableHead className="text-right">% of Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.sources.map((source, index) => (
              <TableRow key={index}>
                <TableCell className="max-w-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getSourceIcon(source.source, source.medium)}</span>
                    <div className="space-y-1">
                      <div className="font-medium text-sm">
                        {source.source} / {source.medium}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <span>Source: {source.source}</span>
                        <span>•</span>
                        <span>Medium: {source.medium}</span>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">{formatNumber(source.sessions)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Users className="h-3 w-3" />
                    {formatNumber(source.users)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <UserPlus className="h-3 w-3" />
                    {formatNumber(source.newUsers)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(source.avgSessionDuration)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <MousePointer className="h-3 w-3" />
                    {(source.bounceRate * 100).toFixed(1)}%
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary">{source.percentage.toFixed(1)}%</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
