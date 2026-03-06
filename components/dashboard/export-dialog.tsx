"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Download, FileSpreadsheet, Loader2, FileText } from "lucide-react"
import { useDashboard } from "@/components/linear/dashboard-context"
import { downloadJSON } from "@/lib/export-utils"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const convertToCSVString = (data: any[], title?: string) => {
    if (!data || !data.length) return ""
    const headers = Object.keys(data[0])
    const rows = data.map(row => headers.map(fieldName => {
        const val = row[fieldName]
        return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
    }).join(","))

    return (title ? `\n# ${title}\n` : "") + headers.join(",") + "\n" + rows.join("\n")
}

export function ExportDialog({ children }: { children?: React.ReactNode } = {}) {
    const [open, setOpen] = useState(false)
    const [exportFormat, setExportFormat] = useState<"csv" | "pdf">("csv")
    const [loading, setLoading] = useState(false)
    const [loadingStep, setLoadingStep] = useState<string>("")
    const [selectedScopes, setSelectedScopes] = useState<string[]>(["overview"])

    const { selectedProperty, dateRange } = useDashboard()

    const scopes = [
        { id: "overview", label: "Overview Metrics", description: "Sessions, Users, Bounce Rate" },
        { id: "devices", label: "Devices & Tech", description: "OS, Browser, Screen Res breakdown" },
        { id: "pages", label: "Top Pages", description: "Most visited page paths" },
        { id: "audience", label: "Audience Locations", description: "Top countries and cities" },
        { id: "sources", label: "Traffic Sources", description: "Source/Medium acquisition data" },
    ]

    const handleScopeToggle = (id: string) => {
        setSelectedScopes(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        )
    }

    const fetchReportData = async (scope: string) => {
        let reportTypeParam = "overview"
        if (scope === "devices") reportTypeParam = "devices"
        if (scope === "pages") reportTypeParam = "pages"
        if (scope === "audience") reportTypeParam = "audience"
        if (scope === "sources") reportTypeParam = "sources"

        const startDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined
        const endDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined

        const q = new URLSearchParams()
        if (startDate) q.set("startDate", startDate)
        if (endDate) q.set("endDate", endDate)
        q.set("propertyId", selectedProperty || "")
        q.set("reportType", reportTypeParam)
        q.set("limit", "1000")

        const res = await fetch(`/api/analytics?${q.toString()}`)
        if (!res.ok) throw new Error(`Failed to fetch ${scope}`)
        return res.json()
    }

    const generateDetailedPDF = (results: { scope: string, data: any }[], filename: string) => {
        setLoadingStep("Generating PDF pages...")
        const doc = new jsPDF()

        const COLORS = {
            primary: [79, 70, 229], // Indigo 600
            secondary: [71, 85, 105], // Slate 600
            light: [248, 250, 252], // Slate 50
            border: [226, 232, 240], // Slate 200
            text: [30, 41, 59], // Slate 800
            muted: [100, 116, 139] // Slate 500
        }

        // --- Cover Page ---
        // Header Graphic
        doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
        doc.rect(0, 0, 210, 40, 'F')

        doc.setFont("helvetica", "bold")
        doc.setFontSize(28)
        doc.setTextColor(255, 255, 255)
        doc.text("Helpful Analytics", 105, 25, { align: "center" })

        // Title Section
        doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
        doc.setFontSize(22)
        doc.text("Performance Insights Report", 105, 80, { align: "center" })

        doc.setFontSize(14)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2])
        doc.text("ANALYTICS EXPORT DATA", 105, 95, { align: "center" })

        // Divider
        doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2])
        doc.setLineWidth(0.5)
        doc.line(40, 105, 170, 105)

        // Metadata
        doc.setFontSize(11)
        doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 125, { align: "center" })
        const dateStr = dateRange?.from ? `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to!, "MMM d, yyyy")}` : "All Time"
        doc.text(`Reporting Period: ${dateStr}`, 105, 135, { align: "center" })
        doc.text(`Property: ${selectedProperty || "Demo Property"}`, 105, 145, { align: "center" })

        // Footer for Cover Page
        doc.setFontSize(9)
        doc.text("© 2026 Helpful Analytics Engine", 105, 280, { align: "center" })

        // Helper for Footer on Content Pages
        const addFooter = (data: any) => {
            const pageCount = doc.getNumberOfPages()
            doc.setFontSize(9)
            doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2])
            doc.text(`Helpful Analytics — Marketing Analysis`, 15, 285)
            doc.text(`Page ${data.pageNumber} of ${pageCount}`, 195, 285, { align: "right" })
        }

        doc.addPage()
        let currentY = 25

        results.forEach(({ scope, data }) => {
            // Check for new page if close to bottom
            if (currentY > 240) {
                doc.addPage()
                currentY = 25
            }

            // Section Header
            doc.setFont("helvetica", "bold")
            doc.setFontSize(18)
            doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
            doc.text(scope.toUpperCase() + " ANALYSIS", 15, currentY)

            doc.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
            doc.setLineWidth(0.8)
            doc.line(15, currentY + 3, 195, currentY + 3)
            currentY += 15

            // 1. Overview Style Metrics
            if (scope === "overview") {
                const m = data?.metrics || {}
                const metricsRow1 = [
                    { label: "Sessions", value: (m.sessions || 0).toLocaleString() },
                    { label: "Active Users", value: (m.activeUsers || 0).toLocaleString() },
                    { label: "Page Views", value: (m.screenPageViews || 0).toLocaleString() },
                ]
                const metricsRow2 = [
                    { label: "Bounce Rate", value: `${(m.bounceRate || 0).toFixed(1)}%` },
                    { label: "Avg Duration", value: `${Math.round(m.averageSessionDuration || 0)}s` },
                    { label: "Reports", value: (results.length).toString() },
                ]

                autoTable(doc, {
                    startY: currentY,
                    head: [['Performance Summary', 'Values']],
                    body: [
                        ...metricsRow1.map(item => [item.label, item.value]),
                        ...metricsRow2.map(item => [item.label, item.value])
                    ],
                    theme: 'striped',
                    headStyles: { fillColor: COLORS.primary, halign: 'center' },
                    columnStyles: { 0: { cellWidth: 100 }, 1: { halign: 'right', fontStyle: 'bold' } },
                    margin: { left: 15, right: 15 },
                    didDrawPage: addFooter
                })

                currentY = (doc as any).lastAutoTable.finalY + 20

                // Add Traffic Sources Table
                if (data.trafficSources) {
                    doc.setFontSize(14)
                    doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
                    doc.text("Primary Acquisition Channels", 15, currentY)

                    autoTable(doc, {
                        startY: currentY + 5,
                        head: [['Source', 'Users']],
                        body: data.trafficSources.map((s: any) => [s.name || "Direct", (s.users || 0).toLocaleString()]),
                        theme: 'grid',
                        headStyles: { fillColor: COLORS.secondary },
                        margin: { left: 15, right: 15 },
                        didDrawPage: addFooter
                    })
                    currentY = (doc as any).lastAutoTable.finalY + 20
                }
            }

            // 2. High Density Tables (Pages/Audience/Sources)
            if (scope === "pages" || scope === "performance") {
                const pages = data.pages || []
                autoTable(doc, {
                    startY: currentY,
                    head: [['Page Path', 'Title', 'Views', 'Bounce %']],
                    body: pages.slice(0, 30).map((p: any) => [
                        p.pagePath || "/",
                        (p.pageTitle || "").substring(0, 45),
                        (p.pageViews || 0).toLocaleString(),
                        (p.bounceRate || 0).toFixed(1) + "%"
                    ]),
                    theme: 'striped',
                    headStyles: { fillColor: COLORS.primary },
                    styles: { fontSize: 9 },
                    columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' } },
                    didDrawPage: addFooter
                })
                currentY = (doc as any).lastAutoTable.finalY + 20
            }

            if (scope === "audience") {
                const countries = data.countries || []
                autoTable(doc, {
                    startY: currentY,
                    head: [['Country', 'Sessions', 'Users', 'Bounce %']],
                    body: countries.map((c: any) => [
                        c.country || "Unknown",
                        (c.sessions || 0).toLocaleString(),
                        (c.users || 0).toLocaleString(),
                        (c.bounceRate || 0).toFixed(1) + "%"
                    ]),
                    theme: 'striped',
                    headStyles: { fillColor: COLORS.primary },
                    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
                    didDrawPage: addFooter
                })
                currentY = (doc as any).lastAutoTable.finalY + 20
            }

            if (scope === "devices") {
                autoTable(doc, {
                    startY: currentY,
                    head: [['Device', 'Sessions', 'Users']],
                    body: (data.devices || []).map((d: any) => [d.name || "Unknown", (d.sessions || 0).toLocaleString(), (d.users || 0).toLocaleString()]),
                    theme: 'grid',
                    headStyles: { fillColor: COLORS.secondary },
                    didDrawPage: addFooter
                })
                currentY = (doc as any).lastAutoTable.finalY + 15

                autoTable(doc, {
                    startY: currentY,
                    head: [['Browser', 'Sessions', 'Share %']],
                    body: (data.browsers || []).slice(0, 10).map((b: any) => [b.browser, (b.sessions || 0).toLocaleString(), (b.percentage || 0).toFixed(1) + "%"]),
                    theme: 'grid',
                    headStyles: { fillColor: COLORS.secondary },
                    didDrawPage: addFooter
                })
                currentY = (doc as any).lastAutoTable.finalY + 20
            }

            if (scope === "sources") {
                const sources = data.sources || []
                autoTable(doc, {
                    startY: currentY,
                    head: [['Source', 'Medium', 'Sessions', 'Users']],
                    body: sources.slice(0, 20).map((s: any) => [s.source, s.medium, (s.sessions || 0).toLocaleString(), (s.users || 0).toLocaleString()]),
                    theme: 'striped',
                    headStyles: { fillColor: COLORS.primary },
                    didDrawPage: addFooter
                })
                currentY = (doc as any).lastAutoTable.finalY + 20
            }
        })

        doc.save(`${filename}.pdf`)
    }

    const handleExport = async () => {
        if (!selectedProperty) return toast.error("No property selected")

        setLoading(true)
        setLoadingStep("Initializing...")
        try {
            const timestamp = new Date().toISOString().split('T')[0]
            const baseFilename = `analytics_report_${timestamp}`

            setLoadingStep("Fetching report data...")

            const results = await Promise.all(
                selectedScopes.map(async (scope) => {
                    const data = await fetchReportData(scope)
                    return { scope, data }
                })
            )

            if (exportFormat === "csv") {
                const { flattenAnalyticsData } = await import("@/lib/export-utils")
                let combinedCSV = ""
                results.forEach(({ scope, data }) => {
                    const flatData = flattenAnalyticsData(data)
                    if (Array.isArray(flatData)) {
                        combinedCSV += convertToCSVString(flatData, scope.toUpperCase()) + "\n\n"
                    }
                })

                const blob = new Blob([combinedCSV], { type: 'text/csv;charset=utf-8;' })
                const url = URL.createObjectURL(blob)
                const link = document.createElement("a")
                link.href = url
                link.download = `${baseFilename}.csv`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                toast.success("CSV Export complete")
            } else {
                generateDetailedPDF(results, baseFilename)
                toast.success("PDF Report generated")
            }

            setOpen(false)
        } catch (error) {
            console.error(error)
            toast.error("Export failed. Please check your data or connection.")
        } finally {
            setLoading(false)
            setLoadingStep("")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-2 bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-500 hover:text-zinc-900 shadow-sm transition-colors text-[11px] font-medium"
                    >
                        <Download className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Export Data</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[460px] bg-white text-zinc-900 border-zinc-100 shadow-2xl p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-lg font-bold text-zinc-900">Export Analytics Data</DialogTitle>
                    <DialogDescription className="text-zinc-500 text-xs">
                        Download professional reports directly from Helpful Analytics.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-0">
                    <div className="p-6 pt-4 min-h-[220px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full py-8 space-y-4">
                                <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
                                <div className="text-center space-y-1">
                                    <p className="text-sm font-semibold text-zinc-900">Generating Report</p>
                                    <p className="text-xs text-zinc-500">{loadingStep || "Please wait..."}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-3">
                                    <Label className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Select Report Sections</Label>
                                    {scopes.map((scope) => (
                                        <div key={scope.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-slate-50 transition-colors">
                                            <Checkbox
                                                id={scope.id}
                                                checked={selectedScopes.includes(scope.id)}
                                                onCheckedChange={() => handleScopeToggle(scope.id)}
                                                className="mt-0.5 border-zinc-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                            />
                                            <div className="grid gap-1 leading-none">
                                                <Label
                                                    htmlFor={scope.id}
                                                    className="text-sm font-medium leading-none cursor-pointer text-zinc-700"
                                                >
                                                    {scope.label}
                                                </Label>
                                                <p className="text-[10px] text-zinc-500">
                                                    {scope.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-zinc-50 p-4 border-t border-zinc-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setExportFormat("pdf")}
                                className={cn(
                                    "px-3 py-1.5 rounded-md text-[10px] font-bold border transition-all flex items-center gap-1.5",
                                    exportFormat === "pdf"
                                        ? "bg-white border-zinc-300 text-zinc-900 shadow-sm"
                                        : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-700"
                                )}
                            >
                                <FileText className="h-3 w-3" />
                                PDF Report
                            </button>
                            <button
                                onClick={() => setExportFormat("csv")}
                                className={cn(
                                    "px-3 py-1.5 rounded-md text-[10px] font-bold border transition-all flex items-center gap-1.5",
                                    exportFormat === "csv"
                                        ? "bg-white border-zinc-300 text-zinc-900 shadow-sm"
                                        : "bg-transparent border-transparent text-zinc-500 hover:text-zinc-700"
                                )}
                            >
                                <FileSpreadsheet className="h-3 w-3" />
                                CSV Data
                            </button>
                        </div>

                        <Button
                            onClick={handleExport}
                            disabled={loading || selectedScopes.length === 0}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/10 text-xs px-6"
                        >
                            {loading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
                            {loading ? "Exporting..." : "Generate Download"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
