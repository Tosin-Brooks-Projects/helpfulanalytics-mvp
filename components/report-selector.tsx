"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type ReportType = "overview" | "pages" | "devices" | "locations" | "acquisition"

interface ReportSelectorProps {
  selectedReport: ReportType
  onReportSelect: (report: ReportType) => void
}

const reports = [
  { id: "overview", title: "Overview" },
  { id: "pages", title: "Top Pages" },
  { id: "devices", title: "Devices" },
  { id: "locations", title: "Locations" },
  { id: "acquisition", title: "Traffic" },
]

export function ReportSelector({ selectedReport, onReportSelect }: ReportSelectorProps) {
  return (
    <Tabs value={selectedReport} onValueChange={(v) => onReportSelect(v as ReportType)} className="w-full">
      <TabsList className="grid w-full grid-cols-5 bg-muted/50">
        {reports.map((report) => (
          <TabsTrigger key={report.id} value={report.id}>
            {report.title}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}
