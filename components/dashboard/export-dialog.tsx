"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Download, FileSpreadsheet, Loader2, FileText, Mail, Check, BarChart2 } from "lucide-react"
import { useDashboard } from "@/components/linear/dashboard-context"
import { convertToCSV } from "@/lib/export-utils"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { toast } from "sonner"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"

const SCOPES = [
    { id: "overview",  label: "Overview",        detail: "Sessions, users, bounce rate" },
    { id: "devices",   label: "Devices",          detail: "OS, browser, screen breakdown" },
    { id: "pages",     label: "Top pages",        detail: "Most visited paths" },
    { id: "audience",  label: "Audience",         detail: "Countries and cities" },
    { id: "sources",   label: "Traffic sources",  detail: "Source / medium acquisition" },
]

export function ExportDialog({ children }: { children?: React.ReactNode } = {}) {
    const [open, setOpen] = useState(false)
    const [fmt, setFmt] = useState<"csv" | "pdf">("pdf")
    const [loading, setLoading] = useState(false)
    const [step, setStep] = useState<string>("")
    const [done, setDone] = useState<string[]>([])
    const [selected, setSelected] = useState<string[]>(["overview", "pages", "sources"])
    const [email, setEmail] = useState(false)
    const reduced = useReducedMotion()

    const { selectedProperty, dateRange } = useDashboard()

    const toggle = (id: string) =>
        setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

    const dates = () => {
        const s = dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined
        const e = dateRange?.to   ? format(dateRange.to,   "yyyy-MM-dd") : undefined
        return { s, e }
    }

    const fetchScope = async (scope: string) => {
        const { s, e } = dates()
        const q = new URLSearchParams()
        if (s) q.set("startDate", s)
        if (e) q.set("endDate", e)
        q.set("propertyId", selectedProperty || "")
        q.set("reportType", scope === "performance" ? "pages" : scope)
        q.set("limit", "1000")
        const r = await fetch(`/api/analytics?${q}`)
        if (!r.ok) throw new Error(`Failed to fetch ${scope}`)
        return r.json()
    }

    const fetchInsights = async (scope: string) => {
        const { s, e } = dates()
        try {
            const r = await fetch("/api/ai/insights", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ propertyId: selectedProperty || "demo-property", reportType: scope, startDate: s, endDate: e }),
            })
            return r.ok ? r.json() : null
        } catch { return null }
    }

    const buildPDF = (results: { scope: string; data: any; insights: any }[]): jsPDF => {
        setStep("Building PDF…")
        const doc = new jsPDF()
        const C = {
            dark:   [30, 41, 59]  as [number,number,number],
            light:  [248, 250, 252] as [number,number,number],
            border: [226, 232, 240] as [number,number,number],
            text:   [15, 23, 42]  as [number,number,number],
            muted:  [100, 116, 139] as [number,number,number],
        }

        // Cover
        doc.setFillColor(...C.dark); doc.rect(0, 0, 210, 297, "F")
        doc.setFont("helvetica", "bold"); doc.setFontSize(36)
        doc.setTextColor(255, 255, 255); doc.text("Analytics Report", 30, 70)
        doc.setDrawColor(255, 255, 255); doc.setLineWidth(0.5); doc.line(30, 80, 100, 80)
        const dStr = dateRange?.from
            ? `${format(dateRange.from, "MMMM d, yyyy")} – ${format(dateRange.to!, "MMMM d, yyyy")}`
            : "All time"
        doc.setFontSize(13); doc.setFont("helvetica", "normal"); doc.setTextColor(200, 200, 200)
        doc.text(dStr, 30, 100)
        doc.text(selectedProperty === "demo-property" ? "Demo Property" : (selectedProperty || "Property"), 30, 112)
        doc.setFontSize(10); doc.setTextColor(120, 120, 120)
        doc.text(`Generated ${format(new Date(), "MMMM d, yyyy")}`, 30, 270)

        // Executive summary
        doc.addPage()
        doc.setFillColor(...C.light); doc.rect(0, 0, 210, 297, "F")
        doc.setFont("helvetica", "bold"); doc.setFontSize(20)
        doc.setTextColor(...C.dark); doc.text("Executive Summary", 15, 30)
        doc.setDrawColor(...C.border); doc.setLineWidth(0.5); doc.line(15, 35, 195, 35)
        const overviewIns = results.find(r => r.scope === "overview")?.insights?.insights || []
        const summary = overviewIns[0]?.content || "Summary of your analytics for the selected period."
        doc.setFontSize(10); doc.setFont("helvetica", "normal")
        doc.setTextColor(...C.text); doc.text(doc.splitTextToSize(summary, 175), 15, 48)
        if (overviewIns.length > 0) {
            let y = 80
            doc.setFont("helvetica", "bold"); doc.setFontSize(13); doc.setTextColor(...C.dark)
            doc.text("Key insights", 15, y); y += 10
            overviewIns.slice(0, 3).forEach((ins: any) => {
                doc.setFillColor(255, 255, 255); doc.setDrawColor(...C.border)
                doc.roundedRect(15, y, 180, 22, 2, 2, "FD")
                doc.setFontSize(9); doc.setFont("helvetica", "bold"); doc.setTextColor(...C.dark)
                doc.text(ins.title, 20, y + 8)
                doc.setFont("helvetica", "normal"); doc.setTextColor(...C.muted)
                doc.text(doc.splitTextToSize(ins.description, 170), 20, y + 15)
                y += 28
            })
        }

        // Data pages
        doc.addPage(); let cy = 25
        const ts = { theme: "striped" as const, headStyles: { fillColor: C.dark, fontSize: 9, fontStyle: "bold" as const }, bodyStyles: { fontSize: 9, textColor: C.text } }
        results.forEach(({ scope, data, insights }) => {
            if (cy > 220) { doc.addPage(); cy = 25 }
            doc.setFont("helvetica", "bold"); doc.setFontSize(15); doc.setTextColor(...C.dark)
            doc.text(scope.charAt(0).toUpperCase() + scope.slice(1), 15, cy)
            doc.setDrawColor(...C.border); doc.setLineWidth(0.5); doc.line(15, cy + 3, 195, cy + 3); cy += 10
            if (insights?.insights?.length > 0) {
                doc.setFillColor(...C.light); doc.setDrawColor(...C.border)
                doc.roundedRect(15, cy, 180, 18, 2, 2, "FD")
                doc.setFontSize(8); doc.setFont("helvetica", "normal"); doc.setTextColor(...C.muted)
                doc.text(doc.splitTextToSize(insights.insights[0].description, 170), 20, cy + 7)
                cy += 24
            }
            if (scope === "overview") {
                const m = data?.metrics || {}
                autoTable(doc, { startY: cy, head: [["Metric", "Value"]], body: [["Sessions",(m.sessions||0).toLocaleString()],["Active users",(m.activeUsers||0).toLocaleString()],["Page views",(m.screenPageViews||0).toLocaleString()],["Bounce rate",`${((m.bounceRate||0)*100).toFixed(1)}%`],["Avg session",`${Math.round(m.averageSessionDuration||0)}s`]], ...ts, columnStyles: { 1: { halign: "right" } } })
                cy = (doc as any).lastAutoTable.finalY + 15
            }
            if (scope === "pages") {
                autoTable(doc, { startY: cy, head: [["Path","Views","Unique","Bounce"]], body: (data.pages||[]).slice(0,25).map((p:any)=>[p.pagePath||"/",(p.pageViews||0).toLocaleString(),(p.uniquePageViews||0).toLocaleString(),((p.bounceRate||0)*100).toFixed(1)+"%"]), ...ts, columnStyles: { 1:{halign:"right"},2:{halign:"right"},3:{halign:"right"} } })
                cy = (doc as any).lastAutoTable.finalY + 15
            }
            if (scope === "sources") {
                autoTable(doc, { startY: cy, head: [["Source","Medium","Sessions","Users"]], body: (data.sources||[]).slice(0,20).map((s:any)=>[s.source,s.medium,(s.sessions||0).toLocaleString(),(s.users||0).toLocaleString()]), ...ts, columnStyles: { 2:{halign:"right"},3:{halign:"right"} } })
                cy = (doc as any).lastAutoTable.finalY + 15
            }
            if (scope === "devices") {
                autoTable(doc, { startY: cy, head: [["Device","Sessions","Users"]], body: (data.devices||[]).map((d:any)=>[d.name,(d.sessions||0).toLocaleString(),(d.users||0).toLocaleString()]), ...ts, columnStyles: { 1:{halign:"right"},2:{halign:"right"} } })
                cy = (doc as any).lastAutoTable.finalY + 15
            }
            if (scope === "audience") {
                autoTable(doc, { startY: cy, head: [["Country","Sessions","Users"]], body: (data.countries||[]).slice(0,20).map((c:any)=>[c.country,(c.sessions||0).toLocaleString(),(c.users||0).toLocaleString()]), ...ts, columnStyles: { 1:{halign:"right"},2:{halign:"right"} } })
                cy = (doc as any).lastAutoTable.finalY + 15
            }
        })
        return doc
    }

    const handleExport = async () => {
        if (!selectedProperty) return toast.error("No property selected")
        setLoading(true); setDone([])
        const ts = format(new Date(), "yyyy-MM-dd")
        const base = `Analytics_Report_${ts}`
        try {
            const results = await Promise.all(
                selected.map(async scope => {
                    setStep(scope)
                    const data     = await fetchScope(scope)
                    const insights = await fetchInsights(scope)
                    setDone(d => [...d, scope])
                    return { scope, data, insights }
                })
            )
            if (fmt === "csv") {
                const { flattenAnalyticsData } = await import("@/lib/export-utils")
                let combined: any[] = []
                results.forEach(({ data }) => { const flat = flattenAnalyticsData(data); if (Array.isArray(flat)) combined = [...combined, ...flat] })
                const csv = convertToCSV(combined, { filename: base, download: !email })
                if (email) {
                    setStep("email")
                    const blob = new Blob([csv], { type: "text/csv" })
                    const fd = new FormData(); fd.append("file", blob, `${base}.csv`)
                    const r = await fetch("/api/email/send-report", { method: "POST", body: fd })
                    if (!r.ok) throw new Error((await r.json().catch(()=>({}))).error || "Email failed")
                    toast.success("CSV sent to your email")
                } else { toast.success("CSV exported") }
            } else {
                const doc = buildPDF(results)
                if (email) {
                    setStep("email")
                    const blob = doc.output("blob"); const fd = new FormData(); fd.append("file", blob, `${base}.pdf`)
                    const r = await fetch("/api/email/send-report", { method: "POST", body: fd })
                    if (!r.ok) throw new Error((await r.json().catch(()=>({}))).error || "Email failed")
                    toast.success("PDF sent to your email")
                } else { doc.save(`${base}.pdf`); toast.success("Report downloaded") }
            }
            setOpen(false)
        } catch (err: any) {
            toast.error(err?.message || "Something went wrong")
        } finally { setLoading(false); setStep(""); setDone([]) }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" size="sm" className="h-8 gap-2 bg-white border-zinc-200 hover:bg-zinc-50 text-zinc-500 hover:text-zinc-900 shadow-sm transition-colors duration-150 text-[11px] font-medium">
                        <Download className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Export</span>
                    </Button>
                )}
            </DialogTrigger>

            <DialogContent className="p-0 gap-0 sm:max-w-[420px] bg-white border-zinc-200/80 shadow-xl shadow-zinc-900/8 rounded-2xl overflow-hidden" aria-describedby={undefined}>

                {/* Header */}
                <div className="px-5 pt-5 pb-4 border-b border-zinc-100">
                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
                            <BarChart2 className="h-3.5 w-3.5 text-amber-600" strokeWidth={2} />
                        </div>
                        <h2 className="text-[15px] font-semibold text-zinc-900 tracking-tight">Export report</h2>
                    </div>
                    <p className="text-[12px] text-zinc-400 pl-[calc(1.75rem+10px)]">
                        AI-powered insights included for your date range.
                    </p>
                </div>

                {/* Body */}
                <div className="px-4 py-4 min-h-[240px]">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.18 }}
                                className="flex flex-col gap-2 py-2"
                            >
                                <p className="text-[11px] font-medium text-zinc-500 mb-1">
                                    {step === "email" ? "Sending…" : "Fetching data"}
                                </p>
                                {selected.map(id => {
                                    const s = SCOPES.find(x => x.id === id)!
                                    const isDone = done.includes(id)
                                    const isActive = step === id
                                    return (
                                        <div key={id} className={cn("flex items-center gap-2.5 rounded-lg px-3 py-2 transition-colors duration-200", isDone ? "bg-zinc-50" : isActive ? "bg-amber-50/60" : "opacity-40")}>
                                            <div className={cn("flex h-4 w-4 items-center justify-center rounded-full border transition-colors duration-200", isDone ? "border-zinc-300 bg-zinc-100" : isActive ? "border-amber-400 bg-amber-50" : "border-zinc-200")}>
                                                {isDone
                                                    ? <Check className="h-2.5 w-2.5 text-zinc-500" />
                                                    : isActive
                                                    ? <motion.div className="h-2 w-2 rounded-full bg-amber-400" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.8, repeat: Infinity }} />
                                                    : null
                                                }
                                            </div>
                                            <span className={cn("text-[12px] font-medium", isDone ? "text-zinc-500 line-through decoration-zinc-300" : isActive ? "text-amber-700" : "text-zinc-400")}>
                                                {s.label}
                                            </span>
                                        </div>
                                    )
                                })}
                            </motion.div>
                        ) : (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.18 }}
                                className="space-y-1"
                            >
                                <p className="text-[11px] text-zinc-400 mb-2.5">Sections to include</p>
                                {SCOPES.map(scope => (
                                    <button
                                        key={scope.id}
                                        onClick={() => toggle(scope.id)}
                                        className={cn(
                                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left",
                                            "transition-colors duration-150 group",
                                            selected.includes(scope.id)
                                                ? "bg-zinc-50"
                                                : "hover:bg-zinc-50/60"
                                        )}
                                    >
                                        <div className={cn(
                                            "h-4 w-4 shrink-0 rounded-[4px] border flex items-center justify-center transition-colors duration-150",
                                            selected.includes(scope.id)
                                                ? "bg-amber-500 border-amber-500"
                                                : "border-zinc-300 group-hover:border-zinc-400"
                                        )}>
                                            {selected.includes(scope.id) && (
                                                <Check className="h-2.5 w-2.5 text-white" strokeWidth={2.5} />
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className={cn("text-[13px] font-medium leading-none", selected.includes(scope.id) ? "text-zinc-900" : "text-zinc-600")}>
                                                {scope.label}
                                            </p>
                                            <p className="text-[11px] text-zinc-400 mt-0.5">{scope.detail}</p>
                                        </div>
                                    </button>
                                ))}

                                {/* Email toggle */}
                                <button
                                    onClick={() => setEmail(v => !v)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors duration-150 hover:bg-zinc-50/60 mt-1 border-t border-zinc-100 pt-3"
                                >
                                    <div className={cn("h-4 w-4 shrink-0 rounded-[4px] border flex items-center justify-center transition-colors duration-150", email ? "bg-amber-500 border-amber-500" : "border-zinc-300")}>
                                        {email && <Check className="h-2.5 w-2.5 text-white" strokeWidth={2.5} />}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Mail className="h-3.5 w-3.5 text-zinc-400" />
                                        <span className="text-[12px] font-medium text-zinc-600">Send to my email</span>
                                    </div>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-3 px-4 py-3 border-t border-zinc-100 bg-zinc-50/50">
                    {/* Format toggle */}
                    <div className="flex items-center gap-0.5 p-0.5 bg-zinc-100 rounded-lg">
                        {(["pdf", "csv"] as const).map(f => (
                            <button
                                key={f}
                                onClick={() => setFmt(f)}
                                className={cn(
                                    "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all duration-150",
                                    fmt === f ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                                )}
                            >
                                {f === "pdf" ? <FileText className="h-3 w-3" /> : <FileSpreadsheet className="h-3 w-3" />}
                                {f.toUpperCase()}
                            </button>
                        ))}
                    </div>

                    <motion.button
                        onClick={handleExport}
                        disabled={loading || selected.length === 0}
                        className="flex items-center gap-2 px-5 py-2 rounded-xl text-[12px] font-semibold bg-amber-500 hover:bg-amber-400 text-white shadow-sm shadow-amber-500/20 disabled:opacity-50 transition-colors duration-150"
                        whileTap={reduced ? {} : { scale: 0.97 }}
                    >
                        {loading
                            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            : <Download className="h-3.5 w-3.5" />
                        }
                        {loading ? "Working…" : "Generate"}
                    </motion.button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
