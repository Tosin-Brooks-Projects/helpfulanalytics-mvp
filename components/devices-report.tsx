"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Monitor, Smartphone, Tablet, Globe, Clock, MousePointer } from "lucide-react"

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

export function DevicesReport({ data, loading, error }: DevicesReportProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="h-5 w-5" />
              Devices & Technology
            </CardTitle>
            <CardDescription>Device types and browser information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex justify-between items-center p-4 border rounded">
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-32" />
                  </div>
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-16" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Devices & Technology
          </CardTitle>
          <CardDescription>Device types and browser information</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Error loading devices data: {error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!data || !data.devices || data.devices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Devices & Technology
          </CardTitle>
          <CardDescription>Device types and browser information</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No devices data available</p>
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

  const getDeviceIcon = (deviceCategory: string) => {
    switch (deviceCategory.toLowerCase()) {
      case "mobile":
        return Smartphone
      case "tablet":
        return Tablet
      case "desktop":
      default:
        return Monitor
    }
  }

  return (
    <div className="space-y-6">
      {/* Device Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Device Categories
          </CardTitle>
          <CardDescription>
            Sessions by device type • Total: {formatNumber(data.totalSessions)} sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Device Type</TableHead>
                <TableHead className="text-right">Sessions</TableHead>
                <TableHead className="text-right">Users</TableHead>
                <TableHead className="text-right">Avg. Duration</TableHead>
                <TableHead className="text-right">Bounce Rate</TableHead>
                <TableHead className="text-right">% of Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.devices.map((device, index) => {
                const DeviceIcon = getDeviceIcon(device.deviceCategory)
                return (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <DeviceIcon className="h-4 w-4" />
                        <span className="font-medium capitalize">{device.deviceCategory}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">{formatNumber(device.sessions)}</TableCell>
                    <TableCell className="text-right">{formatNumber(device.users)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDuration(device.avgSessionDuration)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <MousePointer className="h-3 w-3" />
                        {(device.bounceRate * 100).toFixed(1)}%
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="secondary">{device.percentage.toFixed(1)}%</Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Browser Information */}
      {data.browsers && data.browsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Top Browsers
            </CardTitle>
            <CardDescription>Most popular browsers used by your visitors</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.browsers.slice(0, 8).map((browser, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{browser.browser}</span>
                  <span className="text-muted-foreground">
                    {formatNumber(browser.sessions)} ({browser.percentage.toFixed(1)}%)
                  </span>
                </div>
                <Progress value={browser.percentage} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
