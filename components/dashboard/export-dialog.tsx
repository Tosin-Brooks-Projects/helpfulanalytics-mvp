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

// Add declaration to fix typescript complaining about autoTable on jsPDF instance if needed, 
// though importing it usually works. We'll use the imported function directly or apply it.

const convertToCSVString = (data: any[], title?: string) => {
    if (!data || !data.length) return ""
    const headers = Object.keys(data[0])
    const rows = data.map(row => headers.map(fieldName => {
        const val = row[fieldName]
        return typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
    }).join(","))

    return (title ? `\n# ${title}\n` : "") + headers.join(",") + "\n" + rows.join("\n")
}

export function ExportDialog() {
    const [open, setOpen] = useState(false)
    const [exportFormat, setExportFormat] = useState<"csv" | "pdf">("csv")
    const [loading, setLoading] = useState(false)
    const [loadingStep, setLoadingStep] = useState<string>("")

    // Custom selection state
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

        // Request up to 1000 items for exports to get "Full Data"
        q.set("limit", "1000")

        const res = await fetch(`/api/analytics?${q.toString()}`)
        if (!res.ok) throw new Error(`Failed to fetch ${scope}`)
        return res.json()
    }

    const generateDetailedPDF = (results: { scope: string, data: any }[], filename: string) => {
        setLoadingStep("Generating PDF pages...")
        const doc = new jsPDF()
        const primaryColor = [245, 158, 11] as [number, number, number] // Amber-500
        const secondaryColor = [100, 116, 139] as [number, number, number] // Slate-500

        // --- Cover Page ---
        doc.setFillColor(255, 255, 255)
        doc.rect(0, 0, 210, 297, "F")

        // Logo / Brand
        doc.setFontSize(32)
        doc.setTextColor(...primaryColor)
        doc.setFont("helvetica", "bold")
        doc.text("Helpful Analytics", 105, 100, { align: "center" })

        doc.setFontSize(14)
        doc.setTextColor(50, 50, 50)
        doc.setFont("helvetica", "normal")
        doc.text("Comprehensive Analytics Export", 105, 115, { align: "center" })

        // Metadata
        doc.setFontSize(10)
        doc.setTextColor(100, 100, 100)
        doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 105, 130, { align: "center" })
        doc.text(`Period: ${dateRange?.from ? format(dateRange.from, 'MMM d, yyyy') : 'Start'} - ${dateRange?.to ? format(dateRange.to, 'MMM d, yyyy') : 'End'}`, 105, 136, { align: "center" })

        // Footer acknowledgement
        doc.setFontSize(8)
        doc.setTextColor(150, 150, 150)
        doc.text("Powered by HelpfulAnalytics Engine", 105, 280, { align: "center" })

        doc.addPage()

        // --- Content Pages ---
        let pageNumber = 2

        results.forEach(({ scope, data }) => {
            // Section Header
            doc.setFontSize(18)
            doc.setTextColor(...primaryColor)
            doc.setFont("helvetica", "bold")
            doc.text(scope.toUpperCase(), 14, 20)

            // Draw a line under title
            doc.setDrawColor(...primaryColor)
            doc.setLineWidth(0.5)
            doc.line(14, 22, 196, 22)

            let startY = 30

            // 1. Overview Metrics (Special Handling)
            if (scope === "overview") {
                const metrics = [
                    { label: "Total Sessions", value: data.sessions },
                    { label: "Total Users", value: data.totalUsers },
                    { label: "Page Views", value: data.pageViews || data.screenPageViews },
                    { label: "Bounce Rate", value: `${(data.bounceRate * 100).toFixed(1)}%` },
                    { label: "Engagement Rate", value: `${(data.engagementRate * 100).toFixed(1)}%` },
                    { label: "Avg Session Duration", value: `${Math.round(data.avgSessionDuration)}s` },
                ]

                autoTable(doc, {
                    startY: startY,
                    head: [['Metric', 'Value']],
                    body: metrics.map(m => [m.label, m.value]),
                    theme: 'striped',
                    headStyles: { fillColor: primaryColor },
                    styles: { fontSize: 12, cellPadding: 5 },
                    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 100 } }
                })

                // Add Traffic Sources Table if present in overview
                if (data.trafficSources && Array.isArray(data.trafficSources)) {
                    // @ts-ignore
                    const finalY = doc.lastAutoTable.finalY + 15
                    doc.setFontSize(14)
                    doc.setTextColor(0, 0, 0)
                    doc.text("Top Traffic Sources", 14, finalY)

                    autoTable(doc, {
                        startY: finalY + 5,
                        head: [['Source', 'Sessions', '%']],
                        body: data.trafficSources.map((s: any) => [
                            s.source,
                            s.sessions,
                            `${s.percentage.toFixed(1)}%`
                        ]),
                        theme: 'grid',
                        headStyles: { fillColor: secondaryColor }
                    })
                }

            } else if (scope === "pages") {
                const pages = Array.isArray(data.topPages) ? data.topPages : (Array.isArray(data) ? data : (data.pages || []))

                if (pages.length > 0) {
                    autoTable(doc, {
                        startY: startY,
                        head: [['Page Path', 'Title', 'Views', 'Unique', 'Bounce %']],
                        body: pages.map((p: any) => [
                            p.pagePath || p.path,
                            (p.pageTitle || p.title || "").substring(0, 40),
                            p.screenPageViews || p.pageViews || p.views,
                            p.uniquePageViews,
                            (p.bounceRate * 100).toFixed(1) + "%"
                        ]),
                        theme: 'grid',
                        headStyles: { fillColor: primaryColor },
                        styles: { fontSize: 9 },
                        columnStyles: { 0: { cellWidth: 50 }, 1: { cellWidth: 60 } }
                    })
                } else {
                    doc.setFontSize(10)
                    doc.setTextColor(100, 100, 100)
                    doc.text("No page data available for this period.", 14, startY)
                }

            } else if (scope === "devices") {
                // Devices Table
                if (data.devices) {
                    doc.setFontSize(12)
                    doc.setTextColor(0, 0, 0)
                    doc.text("Device Categories", 14, startY)

                    autoTable(doc, {
                        startY: startY + 5,
                        head: [['Category', 'Sessions', 'Users', 'Bounce %']],
                        body: data.devices.map((d: any) => [
                            d.deviceCategory,
                            d.sessions,
                            d.users,
                            (d.bounceRate * 100).toFixed(1) + "%"
                        ]),
                        theme: 'grid',
                        headStyles: { fillColor: secondaryColor }
                    })
                    // @ts-ignore
                    startY = doc.lastAutoTable.finalY + 15
                }

                // Browsers Table
                if (data.browsers) {
                    doc.setFontSize(12)
                    doc.setTextColor(0, 0, 0)
                    doc.text("Top Browsers", 14, startY)

                    autoTable(doc, {
                        startY: startY + 5,
                        head: [['Browser', 'Sessions', '% Share']],
                        body: data.browsers.slice(0, 15).map((b: any) => [
                            b.browser,
                            b.sessions,
                            b.percentage.toFixed(1) + "%"
                        ]),
                        theme: 'grid',
                        headStyles: { fillColor: secondaryColor }
                    })
                    // @ts-ignore
                    startY = doc.lastAutoTable.finalY + 15
                }

                // OS Table
                if (data.os) {
                    if (startY > 250) { doc.addPage(); startY = 20; }
                    doc.setFontSize(12)
                    doc.setTextColor(0, 0, 0)
                    doc.text("Operating Systems", 14, startY)

                    autoTable(doc, {
                        startY: startY + 5,
                        head: [['OS', 'Sessions', '% Share']],
                        body: data.os.slice(0, 15).map((o: any) => [
                            o.name,
                            o.sessions,
                            o.percentage.toFixed(1) + "%"
                        ]),
                        theme: 'grid',
                        headStyles: { fillColor: secondaryColor }
                    })
                }

            } else if (scope === "audience") {
                // Countries
                const countries = data.countries || data // handle if raw array
                if (Array.isArray(countries)) {
                    autoTable(doc, {
                        startY: startY,
                        head: [['Country', 'Sessions', 'Users', 'Bounce %']],
                        body: countries.map((c: any) => [
                            c.country,
                            c.sessions,
                            c.users,
                            (c.bounceRate * 100).toFixed(1) + "%"
                        ]),
                        theme: 'grid',
                        headStyles: { fillColor: primaryColor }
                    })
                }

            } else if (scope === "sources") {
                // Sources
                const sources = data.sources || data
                if (Array.isArray(sources)) {
                    autoTable(doc, {
                        startY: startY,
                        head: [['Source', 'Medium', 'Sessions', 'Users', 'New Users']],
                        body: sources.map((s: any) => [
                            s.source,
                            s.medium,
                            s.sessions,
                            s.users,
                            s.newUsers
                        ]),
                        theme: 'grid',
                        headStyles: { fillColor: primaryColor }
                    })
                }
            }

            // Always add a page break after each section unless it's the last one
            if (scope !== results[results.length - 1].scope) {
                doc.addPage()
                pageNumber++
            }
        })

        // Add page numbers to all pages
        const pageCount = doc.getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i)
            doc.setFontSize(8)
            doc.setTextColor(150, 150, 150)
            doc.text(`Page ${i} of ${pageCount} - HelpfulAnalytics Export`, 105, 290, { align: "center" })
        }

        doc.save(`${filename}.pdf`)
    }

    const handleExport = async () => {
        if (!selectedProperty) return toast.error("No property selected")

        setLoading(true)
        setLoadingStep("Initializing...")
        try {
            const timestamp = new Date().toISOString().split('T')[0]
            const baseFilename = `analytics_${timestamp}`

            setLoadingStep("Fetching high-volume data...")
            toast.info("Fetching fresh data from Google Analytics...")

            const results = await Promise.all(
                selectedScopes.map(async (scope) => {
                    const data = await fetchReportData(scope)
                    return { scope, data }
                })
            )

            setLoadingStep("Processing export...")

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
                link.setAttribute("href", url)
                link.setAttribute("download", `${baseFilename}.csv`)
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)

                toast.success("CSV Export complete")
            } else if (exportFormat === "pdf") {
                generateDetailedPDF(results, baseFilename)
                toast.success("PDF Export complete")
            }

            setOpen(false)
        } catch (error) {
            console.error(error)
            toast.error("Export failed. Please check your connection.")
        } finally {
            setLoading(false)
            setLoadingStep("")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-2 bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-500 hover:text-zinc-900 shadow-sm transition-colors text-[11px] font-medium"
                >
                    <Download className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Export Data</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[460px] bg-white text-zinc-900 border-zinc-100 shadow-2xl p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-lg font-bold text-zinc-900">Export Analytics Data</DialogTitle>
                    <DialogDescription className="text-zinc-500 text-xs">
                        Download raw data directly from the API. Select the data you wish to export.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-0">
                    <div className="p-6 pt-4 min-h-[220px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full py-8 space-y-4">
                                <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
                                <div className="text-center space-y-1">
                                    <p className="text-sm font-semibold text-zinc-900">Exporting Data</p>
                                    <p className="text-xs text-zinc-500">{loadingStep || "Please wait..."}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-3">
                                    <Label className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Data Selection</Label>
                                    {scopes.map((scope) => (
                                        <div key={scope.id} className="flex items-start space-x-3">
                                            <Checkbox
                                                id={scope.id}
                                                checked={selectedScopes.includes(scope.id)}
                                                onCheckedChange={() => handleScopeToggle(scope.id)}
                                                className="mt-0.5 border-zinc-300 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                                            />
                                            <div className="grid gap-1.5 leading-none">
                                                <Label
                                                    htmlFor={scope.id}
                                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-zinc-700"
                                                >
                                                    {scope.label}
                                                </Label>
                                                <p className="text-[11px] text-zinc-500">
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
                                PDF
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
                                CSV
                            </button>
                        </div>

                        <Button
                            onClick={handleExport}
                            disabled={loading || selectedScopes.length === 0}
                            className="bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/10 text-xs px-6"
                        >
                            {loading ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
                            {loading ? "Exporting..." : "Download Data"}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
