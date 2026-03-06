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
import { Download, FileSpreadsheet, Loader2, FileText, Sparkles } from "lucide-react"
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
    const [exportFormat, setExportFormat] = useState<"csv" | "pdf">("pdf")
    const [loading, setLoading] = useState(false)
    const [loadingStep, setLoadingStep] = useState<string>("")
    const [selectedScopes, setSelectedScopes] = useState<string[]>(["overview", "pages", "sources"])

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
        let reportTypeParam = scope === "sources" ? "sources" : scope
        if (scope === "performance") reportTypeParam = "pages"

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

    const fetchAIInsights = async (scope: string) => {
        const startDate = dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined
        const endDate = dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined

        try {
            const res = await fetch("/api/ai/insights", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    propertyId: selectedProperty || "demo-property",
                    reportType: scope,
                    startDate,
                    endDate
                })
            })
            if (!res.ok) return null
            return await res.json()
        } catch (e) {
            console.error("AI Fetch Failure:", e)
            return null
        }
    }

    const generateDetailedPDF = (results: { scope: string, data: any, insights: any }[], filename: string) => {
        setLoadingStep("Drafting final PDF with AI insights...")
        const doc = new jsPDF()

        const COLORS = {
            primary: [245, 158, 11], // Amber 500 (Helpful Analytics Brand)
            secondary: [71, 85, 105], // Slate 600
            light: [255, 251, 235], // Amber 50
            border: [254, 243, 199], // Amber 200
            text: [30, 41, 59], // Slate 800
            muted: [100, 116, 139], // Slate 500
            white: [255, 255, 255]
        }

        // --- Cover Page ---
        doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
        doc.rect(0, 0, 210, 60, 'F')

        doc.setFont("helvetica", "bold")
        doc.setFontSize(32)
        doc.setTextColor(255, 255, 255)
        doc.text("Helpful Analytics", 105, 30, { align: "center" })
        doc.setFontSize(14)
        doc.text("Professional Analytics & AI Insights", 105, 42, { align: "center" })

        doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
        doc.setFontSize(24)
        doc.text("Executive Performance Report", 105, 100, { align: "center" })

        doc.setFontSize(16)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2])
        doc.text("POWERED BY KEA ARCHITECTURE", 105, 115, { align: "center" })

        doc.setDrawColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
        doc.setLineWidth(1)
        doc.line(30, 130, 180, 130)

        doc.setFontSize(11)
        doc.text(`Generated: ${new Date().toLocaleString()}`, 105, 150, { align: "center" })
        const dateStr = dateRange?.from ? `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to!, "MMM d, yyyy")}` : "All Time"
        doc.text(`Reporting Period: ${dateStr}`, 105, 160, { align: "center" })
        doc.text(`Property: ${selectedProperty === 'demo-property' ? 'Demo Property' : selectedProperty || 'Current Property'}`, 105, 170, { align: "center" })

        // Footer for Cover
        doc.setFontSize(9)
        doc.text("CONFIDENTIAL | © 2026 Helpful Analytics Engine", 105, 280, { align: "center" })

        // --- Kea Executive Summary ---
        doc.addPage()
        doc.setFillColor(COLORS.light[0], COLORS.light[1], COLORS.light[2])
        doc.rect(15, 20, 180, 250, 'F')

        doc.setFont("helvetica", "bold")
        doc.setFontSize(20)
        doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
        doc.text("KEA EXEC SUMMARY", 25, 40)

        doc.setFontSize(12)
        doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
        doc.setFont("helvetica", "italic")
        doc.text('"A Bird\'s Eye View of your data ecosystem."', 25, 50)

        doc.setFont("helvetica", "normal")
        doc.setFontSize(11)
        doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])

        const overviewInsights = results.find(r => r.scope === "overview")?.insights?.insights || []
        const summaryText = overviewInsights.length > 0
            ? overviewInsights[0].content
            : "Hey — I'm Kea. Looking at your metrics for this period, it's clear you've got some interesting movements. The reports following this summary will break down exactly where your wins are coming from and what needs a tweak. Let's fly through the details."

        const splitText = doc.splitTextToSize(summaryText, 160)
        doc.text(splitText, 25, 70)

        // Add a "Key Wins" section to summary
        doc.setFont("helvetica", "bold")
        doc.text("SNAPSHOT INSIGHTS:", 25, 110)
        doc.setFont("helvetica", "normal")
        let summaryY = 120
        overviewInsights.slice(0, 3).forEach((ins: any) => {
            doc.text(`• ${ins.title}: ${ins.description}`, 25, summaryY)
            summaryY += 10
        })

        // Footer Helper
        const addFooter = (data: any) => {
            const pageCount = doc.getNumberOfPages()
            doc.setFontSize(9)
            doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2])
            doc.text(`Helpful Analytics — Professional AI Report`, 15, 285)
            doc.text(`Page ${data.pageNumber} of ${pageCount}`, 195, 285, { align: "right" })
        }

        doc.addPage()
        let currentY = 25

        results.forEach(({ scope, data, insights }) => {
            if (currentY > 200) {
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
            currentY += 12

            // AI Insight Box for Section
            if (insights?.insights?.length > 0) {
                doc.setFillColor(255, 251, 235) // Light amber
                doc.setDrawColor(252, 211, 77) // Amber 300
                doc.rect(15, currentY, 180, 25, 'FD')

                doc.setFontSize(10)
                doc.setFont("helvetica", "bold")
                doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
                doc.text("AI RUNDOWN", 20, currentY + 7)

                doc.setFont("helvetica", "normal")
                doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
                const insightLine = insights.insights[0].description
                doc.text(insightLine, 20, currentY + 15)

                currentY += 35
            }

            // Tables based on scope
            if (scope === "overview") {
                const m = data?.metrics || {}
                autoTable(doc, {
                    startY: currentY,
                    head: [['Metric', 'Performance Value']],
                    body: [
                        ["Total Sessions", (m.sessions || 0).toLocaleString()],
                        ["Active Users", (m.activeUsers || 0).toLocaleString()],
                        ["Page Views", (m.screenPageViews || 0).toLocaleString()],
                        ["Bounce Rate", `${(m.bounceRate || 0).toFixed(1)}%`],
                        ["Avg Session Duration", `${Math.round(m.averageSessionDuration || 0)}s`],
                        ["Conversion Rate", `${(m.transactions ? (m.transactions / m.sessions * 100).toFixed(2) : "0.00")}%`]
                    ],
                    theme: 'striped',
                    headStyles: { fillColor: COLORS.primary, halign: 'center' },
                    columnStyles: { 1: { halign: 'right', fontStyle: 'bold' } },
                    didDrawPage: addFooter
                })
                currentY = (doc as any).lastAutoTable.finalY + 15
            }

            if (scope === "pages" || scope === "performance") {
                const pages = (data.pages || []).slice(0, 25)
                autoTable(doc, {
                    startY: currentY,
                    head: [['Page Path', 'Views', 'Unique', 'Bounce %']],
                    body: pages.map((p: any) => [
                        p.pagePath || "/",
                        (p.pageViews || 0).toLocaleString(),
                        (p.uniquePageViews || 0).toLocaleString(),
                        (p.bounceRate || 0).toFixed(1) + "%"
                    ]),
                    theme: 'striped',
                    headStyles: { fillColor: COLORS.primary },
                    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
                    didDrawPage: addFooter
                })
                currentY = (doc as any).lastAutoTable.finalY + 15
            }

            if (scope === "sources") {
                const sources = (data.sources || []).slice(0, 20)
                autoTable(doc, {
                    startY: currentY,
                    head: [['Source', 'Medium', 'Sessions', 'Users']],
                    body: sources.map((s: any) => [s.source, s.medium, (s.sessions || 0).toLocaleString(), (s.users || 0).toLocaleString()]),
                    theme: 'striped',
                    headStyles: { fillColor: COLORS.primary },
                    didDrawPage: addFooter
                })
                currentY = (doc as any).lastAutoTable.finalY + 15
            }

            if (scope === "devices") {
                autoTable(doc, {
                    startY: currentY,
                    head: [['Device Category', 'Sessions', 'Users']],
                    body: (data.devices || []).map((d: any) => [d.name, (d.sessions || 0).toLocaleString(), (d.users || 0).toLocaleString()]),
                    theme: 'grid',
                    headStyles: { fillColor: COLORS.secondary },
                    didDrawPage: addFooter
                })
                currentY = (doc as any).lastAutoTable.finalY + 15
            }

            if (scope === "audience") {
                autoTable(doc, {
                    startY: currentY,
                    head: [['Country', 'Sessions', 'Users']],
                    body: (data.countries || []).slice(0, 20).map((c: any) => [c.country, (c.sessions || 0).toLocaleString(), (c.users || 0).toLocaleString()]),
                    theme: 'striped',
                    headStyles: { fillColor: COLORS.primary },
                    didDrawPage: addFooter
                })
                currentY = (doc as any).lastAutoTable.finalY + 15
            }
        })

        doc.save(`${filename}.pdf`)
    }

    const handleExport = async () => {
        if (!selectedProperty) return toast.error("No property selected")

        setLoading(true)
        setLoadingStep("Commencing AI analysis...")
        try {
            const timestamp = format(new Date(), "yyyy-MM-dd")
            const baseFilename = `HelpfulAnalytics_AI_Report_${timestamp}`

            const results = await Promise.all(
                selectedScopes.map(async (scope) => {
                    setLoadingStep(`Analyzing ${scope}...`)
                    const data = await fetchReportData(scope)
                    const insights = await fetchAIInsights(scope)
                    return { scope, data, insights }
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
                toast.success("CSV Export successful")
            } else {
                generateDetailedPDF(results, baseFilename)
                toast.success("Professional AI Report downloaded")
            }

            setOpen(false)
        } catch (error) {
            console.error(error)
            toast.error("Process interrupted. Please verify your property selection.")
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
                        <span className="hidden sm:inline">Export Insights</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[460px] bg-white text-zinc-900 border-zinc-100 shadow-2xl p-0 gap-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        <DialogTitle className="text-lg font-bold text-zinc-900">AI Analytics Report</DialogTitle>
                    </div>
                    <DialogDescription className="text-zinc-500 text-xs">
                        Generate professional PDF reports with AI-powered trend analysis and segment rundowns.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-0">
                    <div className="p-6 pt-4 min-h-[220px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full py-8 space-y-4">
                                <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
                                <div className="text-center space-y-1">
                                    <p className="text-sm font-semibold text-zinc-900">AI Analysis in Progress</p>
                                    <p className="text-xs text-zinc-500 italic">"{loadingStep || "Consulting Kea..."}"</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-3">
                                    <Label className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Report Composition</Label>
                                    <div className="grid grid-cols-1 gap-2">
                                        {scopes.map((scope) => (
                                            <div key={scope.id} className="flex items-start space-x-3 p-2.5 rounded-xl border border-transparent hover:border-amber-100 hover:bg-amber-50/30 transition-all group">
                                                <Checkbox
                                                    id={scope.id}
                                                    checked={selectedScopes.includes(scope.id)}
                                                    onCheckedChange={() => handleScopeToggle(scope.id)}
                                                    className="mt-0.5 border-zinc-300 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                                                />
                                                <div className="grid gap-0.5 leading-none">
                                                    <Label
                                                        htmlFor={scope.id}
                                                        className="text-sm font-semibold leading-none cursor-pointer text-zinc-700 group-hover:text-amber-700 transition-colors"
                                                    >
                                                        {scope.label}
                                                    </Label>
                                                    <p className="text-[10px] text-zinc-400 group-hover:text-zinc-500">
                                                        {scope.description}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-zinc-50 p-4 border-t border-zinc-100 flex items-center justify-between">
                        <div className="flex items-center gap-2 p-1 bg-zinc-200/50 rounded-lg">
                            <button
                                onClick={() => setExportFormat("pdf")}
                                className={cn(
                                    "px-4 py-1.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-1.5",
                                    exportFormat === "pdf"
                                        ? "bg-white text-zinc-900 shadow-sm"
                                        : "text-zinc-500 hover:text-zinc-700"
                                )}
                            >
                                <FileText className="h-3 w-3" />
                                PDF
                            </button>
                            <button
                                onClick={() => setExportFormat("csv")}
                                className={cn(
                                    "px-4 py-1.5 rounded-md text-[10px] font-bold transition-all flex items-center gap-1.5",
                                    exportFormat === "csv"
                                        ? "bg-white text-zinc-900 shadow-sm"
                                        : "text-zinc-500 hover:text-zinc-700"
                                )}
                            >
                                <FileSpreadsheet className="h-3 w-3" />
                                CSV
                            </button>
                        </div>

                        <Button
                            onClick={handleExport}
                            disabled={loading || selectedScopes.length === 0}
                            className="bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20 text-xs px-8 h-9 font-bold rounded-lg transition-transform active:scale-95"
                        >
                            {loading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Sparkles className="mr-2 h-3.5 w-3.5" />}
                            Generate Report
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
