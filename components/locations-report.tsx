"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Globe, Users, Clock, MousePointer } from "lucide-react"

interface LocationData {
  country: string
  countryCode: string
  sessions: number
  users: number
  bounceRate: number
  avgSessionDuration: number
  percentage: number
}

interface LocationsReportProps {
  data?: {
    countries: LocationData[]
    totalSessions: number
  }
  loading?: boolean
  error?: string | null
}

export function LocationsReport({ data, loading, error }: LocationsReportProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Geographic Locations
          </CardTitle>
          <CardDescription>Where your visitors are located</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center p-4 border rounded">
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
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
            <Globe className="h-5 w-5" />
            Geographic Locations
          </CardTitle>
          <CardDescription>Where your visitors are located</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Error loading locations data: {error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!data || !data.countries || data.countries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Geographic Locations
          </CardTitle>
          <CardDescription>Where your visitors are located</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No location data available</p>
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

  const getFlagEmoji = (countryCode: string) => {
    if (!countryCode || countryCode.length !== 2) return "🌍"
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0))
    return String.fromCodePoint(...codePoints)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Geographic Locations
        </CardTitle>
        <CardDescription>
          Visitor locations • Total: {formatNumber(data.totalSessions)} sessions from {data.countries.length} countries
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Country</TableHead>
              <TableHead className="text-right">Sessions</TableHead>
              <TableHead className="text-right">Users</TableHead>
              <TableHead className="text-right">Avg. Duration</TableHead>
              <TableHead className="text-right">Bounce Rate</TableHead>
              <TableHead className="text-right">% of Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.countries.map((location, index) => (
              <TableRow key={index}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getFlagEmoji(location.countryCode)}</span>
                    <span className="font-medium">{location.country}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">{formatNumber(location.sessions)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Users className="h-3 w-3" />
                    {formatNumber(location.users)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(location.avgSessionDuration)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <MousePointer className="h-3 w-3" />
                    {(location.bounceRate * 100).toFixed(1)}%
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Badge variant="secondary">{location.percentage.toFixed(1)}%</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
