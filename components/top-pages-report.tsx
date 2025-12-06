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
          <CardTitle>Top Pages</CardTitle>
          <CardDescription>Loading page data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 w-full bg-muted/20 animate-pulse rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-600">Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!data || !data.pages || data.pages.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Pages</CardTitle>
          <CardDescription>No page data available</CardDescription>
        </CardHeader>
        <CardContent className="p-8 text-center text-muted-foreground">
          No pages found for this period.
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
        <CardTitle>Top Pages</CardTitle>
        <CardDescription>Most visited pages • Total: {formatNumber(data.totalPageViews)} views</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Page</TableHead>
              <TableHead className="text-right">Views</TableHead>
              <TableHead className="text-right">Avg. Time</TableHead>
              <TableHead className="text-right">Bounce</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.pages.map((page, index) => (
              <TableRow key={index}>
                <TableCell className="max-w-[200px] sm:max-w-md">
                  <div className="flex flex-col">
                    <span className="font-medium truncate" title={page.pageTitle}>{page.pageTitle || "Untitled"}</span>
                    <span className="text-xs text-muted-foreground truncate" title={page.pagePath}>{page.pagePath}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">{formatNumber(page.pageViews)}</TableCell>
                <TableCell className="text-right text-muted-foreground">{formatDuration(page.avgTimeOnPage)}</TableCell>
                <TableCell className="text-right text-muted-foreground">{(page.bounceRate * 100).toFixed(0)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
