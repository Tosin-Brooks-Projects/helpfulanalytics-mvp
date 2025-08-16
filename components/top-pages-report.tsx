"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, TrendingUp, Clock, MousePointer } from "lucide-react"

interface PageData {
  pagePath: string
  pageTitle: string
  pageViews: number
  uniquePageViews: number
  avgTimeOnPage: number
  bounceRate: number
  percentage: number
}

interface TopPagesReportProps {
  data?: {
    pages: PageData[]
    totalPageViews: number
  }
  loading?: boolean
  error?: string | null
}

export function TopPagesReport({ data, loading, error }: TopPagesReportProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Pages
          </CardTitle>
          <CardDescription>Most visited pages on your site</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center p-4 border rounded">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
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
            Top Pages
          </CardTitle>
          <CardDescription>Most visited pages on your site</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Error loading pages data: {error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!data || !data.pages || data.pages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Pages
          </CardTitle>
          <CardDescription>Most visited pages on your site</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No pages data available</p>
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Top Pages
        </CardTitle>
        <CardDescription>Most visited pages • Total: {formatNumber(data.totalPageViews)} page views</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page</TableHead>
              <TableHead className="text-right">Page Views</TableHead>
              <TableHead className="text-right">Unique Views</TableHead>
              <TableHead className="text-right">Avg. Time</TableHead>
              <TableHead className="text-right">Bounce Rate</TableHead>
              <TableHead className="text-right">% of Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.pages.map((page, index) => (
              <TableRow key={index}>
                <TableCell className="max-w-xs">
                  <div className="space-y-1">
                    <div className="font-medium text-sm truncate" title={page.pageTitle}>
                      {page.pageTitle || "Untitled"}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <span className="truncate" title={page.pagePath}>
                        {page.pagePath}
                      </span>
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">{formatNumber(page.pageViews)}</TableCell>
                <TableCell className="text-right">{formatNumber(page.uniquePageViews)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(page.avgTimeOnPage)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <MousePointer className="h-3 w-3" />
                    {(page.bounceRate * 100).toFixed(1)}%
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary">{page.percentage.toFixed(1)}%</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
