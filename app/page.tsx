"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { PropertySelector } from "@/components/property-selector"
import { DateRangeSelector } from "@/components/date-range-selector"
import { ReportSelector, type ReportType } from "@/components/report-selector"
import { MetricsOverview } from "@/components/metrics-overview"
import { TrafficSources } from "@/components/traffic-sources"
import { TopPagesReport } from "@/components/top-pages-report"
import { DevicesReport } from "@/components/devices-report"
import { LocationsReport } from "@/components/locations-report"
import { AcquisitionReport } from "@/components/acquisition-report"
import { ErrorBoundary } from "@/components/error-boundary"
import { LoadingSkeleton } from "@/components/loading-skeleton"

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

  const formatDateRange = (range: DateRange) => {
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric", year: "numeric" }
    return `${range.from.toLocaleDateString("en-US", options)} - ${range.to.toLocaleDateString("en-US", options)}`
  }

  const renderReport = () => {
    switch (selectedReport) {
      case "overview":
        return (
          <div className="space-y-6">
            <MetricsOverview data={analyticsData?.metrics} loading={loading} error={error} />
            <TrafficSources data={analyticsData?.trafficSources} loading={loading} error={error} />
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
    return <LoadingSkeleton />
  }

  if (status === "unauthenticated") {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            {selectedProperty && <p className="text-gray-600 mt-1">{formatDateRange(dateRange)}</p>}
          </div>
          <div className="flex items-center gap-4">
            <DateRangeSelector dateRange={dateRange} onDateRangeChange={setDateRange} />
          </div>
        </div>

        {/* Property Selector */}
        <PropertySelector onPropertySelect={setSelectedProperty} selectedProperty={selectedProperty} />

        {/* Report Selector */}
        {selectedProperty && <ReportSelector selectedReport={selectedReport} onReportSelect={setSelectedReport} />}

        {/* Report Content */}
        {selectedProperty && <ErrorBoundary>{renderReport()}</ErrorBoundary>}
      </div>
    </div>
  )
}
