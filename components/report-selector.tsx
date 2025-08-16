"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart3, Globe, Smartphone, FileText, TrendingUp } from "lucide-react"

export type ReportType = "overview" | "pages" | "devices" | "locations" | "acquisition"

interface ReportSelectorProps {
  selectedReport: ReportType
  onReportSelect: (report: ReportType) => void
}

const reports = [
  {
    id: "overview" as ReportType,
    title: "Overview",
    description: "Key metrics and traffic trends",
    icon: BarChart3,
    color: "bg-blue-50 border-blue-200 text-blue-700",
  },
  {
    id: "pages" as ReportType,
    title: "Top Pages",
    description: "Most visited content",
    icon: FileText,
    color: "bg-green-50 border-green-200 text-green-700",
  },
  {
    id: "devices" as ReportType,
    title: "Devices & Tech",
    description: "Device types and browsers",
    icon: Smartphone,
    color: "bg-purple-50 border-purple-200 text-purple-700",
  },
  {
    id: "locations" as ReportType,
    title: "Locations",
    description: "Geographic audience data",
    icon: Globe,
    color: "bg-orange-50 border-orange-200 text-orange-700",
  },
  {
    id: "acquisition" as ReportType,
    title: "Traffic Sources",
    description: "How users find your site",
    icon: TrendingUp,
    color: "bg-pink-50 border-pink-200 text-pink-700",
  },
]

export function ReportSelector({ selectedReport, onReportSelect }: ReportSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics Reports</CardTitle>
        <CardDescription>Choose which report to view</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {reports.map((report) => {
            const Icon = report.icon
            const isSelected = selectedReport === report.id

            return (
              <Button
                key={report.id}
                variant={isSelected ? "default" : "outline"}
                className={`h-auto p-4 flex flex-col items-center gap-2 ${isSelected ? "" : "hover:bg-gray-50"}`}
                onClick={() => onReportSelect(report.id)}
              >
                <Icon className="w-6 h-6" />
                <div className="text-center">
                  <div className="font-medium text-sm">{report.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{report.description}</div>
                </div>
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
