"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { PropertySelector } from "@/components/property-selector" // Fixed import // Fixed import
import { DateRangeSelector } from "@/components/date-range-selector"
import { ReportSelector, type ReportType } from "@/components/report-selector"
import { MetricsOverview } from "@/components/metrics-overview"
import { TrafficSources } from "@/components/traffic-sources"
import { TopPagesReport } from "@/components/top-pages-report"
import { DevicesReport } from "@/components/devices-report"
import { LocationsReport } from "@/components/locations-report"
import { AcquisitionReport } from "@/components/acquisition-report"
import { ErrorBoundary } from "@/components/error-boundary"

import { DashboardShell } from "@/components/layout/dashboard-shell"
import { StatCard } from "@/components/ui/stat-card"
import { Users, Eye, MousePointer, Clock } from "lucide-react"

interface DateRange {
  from: Date
  to: Date
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [selectedProperty, setSelectedProperty] = useState<string>("")
  const [selectedReport, setSelectedReport] = useState<ReportType>("overview")
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  })
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load saved preferences
  useEffect(() => {
    const savedProperty = localStorage.getItem("selectedProperty")
    const savedReport = localStorage.getItem("selectedReport") as ReportType
    const savedDateRange = localStorage.getItem("dateRange")

    if (savedProperty) setSelectedProperty(savedProperty)
    if (savedReport) setSelectedReport(savedReport)
    if (savedDateRange) {
      const parsed = JSON.parse(savedDateRange)
      setDateRange({
        from: new Date(parsed.from),
        to: new Date(parsed.to),
      })
    }
  }, [])

  // Save preferences
  useEffect(() => {
    if (selectedProperty) {
      localStorage.setItem("selectedProperty", selectedProperty)
    }
  }, [selectedProperty])

  useEffect(() => {
    localStorage.setItem("selectedReport", selectedReport)
  }, [selectedReport])

  useEffect(() => {
    localStorage.setItem("dateRange", JSON.stringify(dateRange))
  }, [dateRange])

  // Fetch analytics data
  useEffect(() => {
    if (selectedProperty) {
      fetchAnalyticsData()
    }
  }, [selectedProperty, selectedReport, dateRange])

  const fetchAnalyticsData = async () => {
    if (!selectedProperty) return

    setLoading(true)
    setError(null)

    try {
      const startDate = dateRange.from.toISOString().split("T")[0]
      const endDate = dateRange.to.toISOString().split("T")[0]

      const response = await fetch(
        `/api/analytics?propertyId=${selectedProperty}&reportType=${selectedReport}&startDate=${startDate}&endDate=${endDate}`,
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch analytics data")
      }

      const data = await response.json()
      setAnalyticsData(data)
    } catch (error) {
      console.error("Failed to fetch analytics data:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch analytics data")
    } finally {
      setLoading(false)
    }
  }

  const renderReport = () => {
    switch (selectedReport) {
      case "overview":
        return (
          <div className="space-y-6">
            {/* We'll replace MetricsOverview with inline StatCards for better control or keep it if updated */}
            <MetricsOverview metrics={analyticsData?.metrics} loading={loading} error={error} />
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
              <div className="col-span-4">
                <TrafficSources data={analyticsData?.trafficSources} loading={loading} error={error} />
              </div>
              <div className="col-span-3">
                {/* Placeholder for another chart or devices */}
                <DevicesReport data={analyticsData} loading={loading} error={error} />
              </div>
            </div>
          </div>
        )
      case "pages":
        return <TopPagesReport data={analyticsData} loading={loading} error={error} />
      case "devices":
        return <DevicesReport data={analyticsData} loading={loading} error={error} />
      case "locations":
        return <LocationsReport data={analyticsData} loading={loading} error={error} />
      case "acquisition":
        return <AcquisitionReport data={analyticsData} loading={loading} error={error} />
      default:
        return <div>Invalid report type</div>
    }
  }

  if (status === "loading") {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  if (status === "unauthenticated") {
    redirect("/login")
  }

  return (
    <DashboardShell>
      <div className="flex flex-col space-y-8 p-8">
        <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
            <p className="text-muted-foreground">
              Overview of your property performance.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <PropertySelector onPropertySelect={setSelectedProperty} selectedProperty={selectedProperty} />
            <DateRangeSelector dateRange={dateRange} onDateRangeChange={setDateRange} />
          </div>
        </div>

        {/* Report Selector Tabs - Could be moved to a Tabs component */}
        {selectedProperty && (
          <div className="flex items-center space-x-2 pb-4">
            <ReportSelector selectedReport={selectedReport} onReportSelect={setSelectedReport} />
          </div>
        )}

        {selectedProperty && (
          <ErrorBoundary>
            {renderReport()}
          </ErrorBoundary>
        )}
      </div>
    </DashboardShell>
  )
}
