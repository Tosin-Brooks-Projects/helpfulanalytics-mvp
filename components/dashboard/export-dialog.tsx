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
import { Download, FileSpreadsheet, Loader2, FileText, Sparkles, Mail } from "lucide-react"
import { useDashboard } from "@/components/linear/dashboard-context"
import { convertToCSV } from "@/lib/export-utils"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { toast } from "sonner"

export function ExportDialog({ children }: { children?: React.ReactNode } = {}) {
    const [open, setOpen] = useState(false)
    const [exportFormat, setExportFormat] = useState<"csv" | "pdf">("pdf")
    const [loading, setLoading] = useState(false)
    const [loadingStep, setLoadingStep] = useState<string>("")
    const [selectedScopes, setSelectedScopes] = useState<string[]>(["overview", "pages", "sources"])
    const [sendToEmail, setSendToEmail] = useState(false)

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

    const generateDetailedPDF = (results: { scope: string, data: any, insights: any }[]): jsPDF => {
        setLoadingStep("Building PDF report...")
        const doc = new jsPDF()

        const COLORS = {
            primary: [30, 41, 59],
            accent: [100, 116, 139],
            lightBg: [248, 250, 252],
            border: [226, 232, 240],
            text: [15, 23, 42],
            muted: [100, 116, 139],
        }

        // --- Cover Page ---
        doc.setFillColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
        doc.rect(0, 0, 210, 297, 'F')

        doc.setFont("helvetica", "bold")
        doc.setFontSize(36)
        doc.setTextColor(255, 255, 255)
        doc.text("Analytics Report", 30, 70)

        doc.setDrawColor(255, 255, 255)
        doc.setLineWidth(0.5)
        doc.line(30, 80, 100, 80)

        const dateStr = dateRange?.from
            ? `${format(dateRange.from, "MMMM d, yyyy")} — ${format(dateRange.to!, "MMMM d, yyyy")}`
            : "All Time"

        doc.setFontSize(13)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(200, 200, 200)
        doc.text(dateStr, 30, 100)

        const propertyName = selectedProperty === 'demo-property' ? 'Demo Property' : (selectedProperty || 'Property')
        doc.text(propertyName, 30, 112)

        doc.setFontSize(10)
        doc.setTextColor(120, 120, 120)
        doc.text(`Generated ${format(new Date(), "MMMM d, yyyy")}`, 30, 270)

        // --- Executive Summary ---
        doc.addPage()
        doc.setFillColor(COLORS.lightBg[0], COLORS.lightBg[1], COLORS.lightBg[2])
        doc.rect(0, 0, 210, 297, 'F')

        doc.setFont("helvetica", "bold")
        doc.setFontSize(20)
        doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
        doc.text("Executive Summary", 15, 30)

        doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2])
        doc.setLineWidth(0.5)
        doc.line(15, 35, 195, 35)

        const overviewInsights = results.find(r => r.scope === "overview")?.insights?.insights || []
        const summaryText = overviewInsights.length > 0
            ? overviewInsights[0].content
            : "A summary of your analytics data for the selected reporting period. The sections that follow break down each area in detail."

        doc.setFontSize(10)
        doc.setFont("helvetica", "normal")
        doc.setTextColor(COLORS.text[0], COLORS.text[1], COLORS.text[2])
        const splitText = doc.splitTextToSize(summaryText, 175)
        doc.text(splitText, 15, 48)

        // Key Insights
        if (overviewInsights.length > 0) {
            let insightY = 80
            doc.setFont("helvetica", "bold")
            doc.setFontSize(13)
            doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
            doc.text("Key Insights", 15, insightY)
            insightY += 10

            overviewInsights.slice(0, 3).forEach((ins: any) => {
                doc.setFillColor(255, 255, 255)
                doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2])
                doc.roundedRect(15, insightY, 180, 22, 2, 2, 'FD')

                doc.setFontSize(9)
                doc.setFont("helvetica", "bold")
                doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
                doc.text(ins.title, 20, insightY + 8)

                doc.setFont("helvetica", "normal")
                doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2])
                const desc = doc.splitTextToSize(ins.description, 170)
                doc.text(desc, 20, insightY + 15)

                insightY += 28
            })
        }

        // --- Data Pages ---
        doc.addPage()
        let currentY = 25

        results.forEach(({ scope, data, insights }) => {
            if (currentY > 220) {
                doc.addPage()
                currentY = 25
            }

            // Section Header
            doc.setFont("helvetica", "bold")
            doc.setFontSize(15)
            doc.setTextColor(COLORS.primary[0], COLORS.primary[1], COLORS.primary[2])
            const sectionTitle = scope.charAt(0).toUpperCase() + scope.slice(1)
            doc.text(sectionTitle, 15, currentY)

            doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2])
            doc.setLineWidth(0.5)
            doc.line(15, currentY + 3, 195, currentY + 3)
            currentY += 10

            // AI Insight for section
            if (insights?.insights?.length > 0) {
                doc.setFillColor(COLORS.lightBg[0], COLORS.lightBg[1], COLORS.lightBg[2])
                doc.setDrawColor(COLORS.border[0], COLORS.border[1], COLORS.border[2])
                doc.roundedRect(15, currentY, 180, 18, 2, 2, 'FD')

                doc.setFontSize(8)
                doc.setFont("helvetica", "normal")
                doc.setTextColor(COLORS.muted[0], COLORS.muted[1], COLORS.muted[2])
                const insightLine = doc.splitTextToSize(insights.insights[0].description, 170)
                doc.text(insightLine, 20, currentY + 7)

                currentY += 24
            }

            const tableStyles = {
                theme: 'striped' as const,
                headStyles: { fillColor: COLORS.primary as any, fontSize: 9, fontStyle: 'bold' as const },
                bodyStyles: { fontSize: 9, textColor: COLORS.text as any },
            }

            if (scope === "overview") {
                const m = data?.metrics || {}
                autoTable(doc, {
                    startY: currentY,
                    head: [['Metric', 'Value']],
                    body: [
                        ["Sessions", (m.sessions || 0).toLocaleString()],
                        ["Active Users", (m.activeUsers || 0).toLocaleString()],
                        ["Page Views", (m.screenPageViews || 0).toLocaleString()],
                        ["Bounce Rate", `${((m.bounceRate || 0) * 100).toFixed(1)}%`],
                        ["Avg Session Duration", `${Math.round(m.averageSessionDuration || 0)}s`],
                        ["Conversion Rate", `${(m.transactions ? (m.transactions / m.sessions * 100).toFixed(2) : "0.00")}%`]
                    ],
                    ...tableStyles,
                    columnStyles: { 1: { halign: 'right' } },
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
                        ((p.bounceRate || 0) * 100).toFixed(1) + "%"
                    ]),
                    ...tableStyles,
                    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' }, 3: { halign: 'right' } },
                })
                currentY = (doc as any).lastAutoTable.finalY + 15
            }

            if (scope === "sources") {
                const sources = (data.sources || []).slice(0, 20)
                autoTable(doc, {
                    startY: currentY,
                    head: [['Source', 'Medium', 'Sessions', 'Users']],
                    body: sources.map((s: any) => [s.source, s.medium, (s.sessions || 0).toLocaleString(), (s.users || 0).toLocaleString()]),
                    ...tableStyles,
                    columnStyles: { 2: { halign: 'right' }, 3: { halign: 'right' } },
                })
                currentY = (doc as any).lastAutoTable.finalY + 15
            }

            if (scope === "devices") {
                autoTable(doc, {
                    startY: currentY,
                    head: [['Device Category', 'Sessions', 'Users']],
                    body: (data.devices || []).map((d: any) => [d.name, (d.sessions || 0).toLocaleString(), (d.users || 0).toLocaleString()]),
                    ...tableStyles,
                    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
                })
                currentY = (doc as any).lastAutoTable.finalY + 15
            }

            if (scope === "audience") {
                autoTable(doc, {
                    startY: currentY,
                    head: [['Country', 'Sessions', 'Users']],
                    body: (data.countries || []).slice(0, 20).map((c: any) => [c.country, (c.sessions || 0).toLocaleString(), (c.users || 0).toLocaleString()]),
                    ...tableStyles,
                    columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
                })
                currentY = (doc as any).lastAutoTable.finalY + 15
            }
        })

        return doc
    }

    const handleExport = async () => {
        if (!selectedProperty) return toast.error("No property selected")

        setLoading(true)
        setLoadingStep("Fetching data...")
        try {
            const timestamp = format(new Date(), "yyyy-MM-dd")
            const baseFilename = `Analytics_Report_${timestamp}`

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

                let combinedData: any[] = []
                results.forEach(({ scope, data }) => {
                    const flatData = flattenAnalyticsData(data)
                    if (Array.isArray(flatData)) {
                        combinedData = [...combinedData, ...flatData]
                    }
                })

                const csvContent = convertToCSV(combinedData, {
                    filename: baseFilename,
                    download: !sendToEmail
                })

                if (sendToEmail) {
                    setLoadingStep("Sending email...")
                    const blob = new Blob([csvContent], { type: 'text/csv' })
                    const formData = new FormData()
                    formData.append('file', blob, `${baseFilename}.csv`)

                    const emailRes = await fetch("/api/email/send-report", {
                        method: "POST",
                        body: formData
                    })

                    if (!emailRes.ok) {
                        const errBody = await emailRes.json().catch(() => ({}))
                        throw new Error(errBody.error || "Failed to send email")
                    }
                    toast.success("CSV Report sent to your email")
                } else {
                    toast.success("CSV exported successfully")
                }
            } else {
                const doc = generateDetailedPDF(results)

                if (sendToEmail) {
                    setLoadingStep("Sending PDF report via email...")
                    const pdfBlob = doc.output("blob")
                    const formData = new FormData()
                    formData.append("file", pdfBlob, `${baseFilename}.pdf`)

                    const emailRes = await fetch("/api/email/send-report", {
                        method: "POST",
                        body: formData,
                    })

                    if (!emailRes.ok) {
                        const errBody = await emailRes.json().catch(() => ({}))
                        throw new Error(errBody.error || "Failed to send email")
                    }
                    toast.success("PDF Report sent to your email")
                } else {
                    doc.save(`${baseFilename}.pdf`)
                    toast.success("Report downloaded")
                }
            }

            setOpen(false)
        } catch (error: any) {
            console.error(error)
            toast.error(error?.message || "Something went wrong. Please try again.")
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
                        <span className="hidden sm:inline">Export</span>
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent
                className="sm:max-w-[460px] bg-white text-zinc-900 border-zinc-100 shadow-2xl p-0 gap-0 overflow-hidden"
                aria-describedby={undefined}
            >
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-lg font-bold text-zinc-900 flex items-center gap-2 mb-1">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        Export Report
                    </DialogTitle>
                    <DialogDescription className="text-zinc-500 text-xs">
                        Generate a report with AI-powered insights for the selected date range.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-0">
                    <div className="p-6 pt-4 min-h-[220px]">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-full py-8 space-y-4">
                                <Loader2 className="h-10 w-10 text-amber-500 animate-spin" />
                                <div className="text-center space-y-1">
                                    <p className="text-sm font-semibold text-zinc-900">Generating report...</p>
                                    <p className="text-xs text-zinc-500 italic">{loadingStep || "Preparing..."}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-3">
                                    <Label className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Sections</Label>
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

                                <div className="pt-2">
                                    <div className="flex items-center space-x-2 p-2 rounded-lg border border-zinc-100 bg-zinc-50/50 w-fit">
                                        <Checkbox
                                            id="email"
                                            checked={sendToEmail}
                                            onCheckedChange={(checked) => setSendToEmail(checked === true)}
                                            className="border-zinc-300 data-[state=checked]:bg-amber-500 data-[state=checked]:border-amber-500"
                                        />
                                        <Label htmlFor="email" className="text-xs font-medium text-zinc-600 cursor-pointer flex items-center gap-1">
                                            <Mail className="h-3 w-3" />
                                            Send via Email
                                        </Label>
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
                            {loading ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-2 h-3.5 w-3.5" />}
                            Generate
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
