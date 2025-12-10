"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export type ReportType = "overview" | "pages" | "devices" | "locations" | "acquisition"

interface ReportSelectorProps {
    selectedReport: ReportType
    onReportSelect: (report: ReportType) => void
}

export function ReportSelector({ selectedReport, onReportSelect }: ReportSelectorProps) {
    return (
        <Tabs value={selectedReport} onValueChange={(v) => onReportSelect(v as ReportType)}>
            <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="pages">Pages</TabsTrigger>
                <TabsTrigger value="devices">Devices</TabsTrigger>
                <TabsTrigger value="locations">Locations</TabsTrigger>
                <TabsTrigger value="acquisition">Acquisition</TabsTrigger>
            </TabsList>
        </Tabs>
    )
}
