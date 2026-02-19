"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Sparkles, Bot, AlertTriangle, Lightbulb, TrendingUp } from "lucide-react"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Insight {
    type: "Insight" | "Trend" | "Suggestion" | "Alert"
    title: string
    description: string
    content: string
}

import { DateRange } from "react-day-picker"

interface CoachCommentaryProps {
    propertyId: string
    dateRange: DateRange | undefined
    compareDateRange: DateRange | undefined
    reportType?: string
}

export function CoachCommentary({ propertyId, dateRange, compareDateRange, reportType = "overview" }: CoachCommentaryProps) {
    const [insights, setInsights] = useState<Insight[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)

    useEffect(() => {
        async function fetchInsights() {
            if (!propertyId || !dateRange?.from || !compareDateRange?.from) return

            setLoading(true)
            setError(false)
            try {
                const res = await fetch('/api/ai/insights', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        propertyId,
                        reportType,
                        startDate: dateRange.from.toISOString().split('T')[0],
                        endDate: (dateRange.to || dateRange.from).toISOString().split('T')[0],
                        compareStartDate: compareDateRange.from.toISOString().split('T')[0],
                        compareEndDate: (compareDateRange.to || compareDateRange.from).toISOString().split('T')[0]
                    })
                })

                if (!res.ok) throw new Error("Failed to fetch")

                const data = await res.json()
                if (data.error) throw new Error(data.error)

                // Ensure array
                const items = Array.isArray(data) ? data : (data.insights || [])
                setInsights(items)
            } catch (err) {
                console.error("Coach failed:", err)
                setError(true)
            } finally {
                setLoading(false)
            }
        }

        fetchInsights()
    }, [propertyId, dateRange, compareDateRange, reportType])

    if (!dateRange?.from || !compareDateRange?.from) return null

    return (
        <Card className="p-6 border-zinc-200 bg-gradient-to-br from-zinc-50 to-white overflow-hidden relative">
            <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                    <Bot className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-bold text-zinc-900">Coach&apos;s Corner</h3>
                {loading && <span className="text-xs text-zinc-400 animate-pulse">Analyzing match footage...</span>}
            </div>

            {loading ? (
                <div className="space-y-3">
                    <div className="h-16 bg-zinc-100 rounded-md w-full animate-pulse" />
                    <div className="h-16 bg-zinc-100 rounded-md w-full animate-pulse delay-75" />
                </div>
            ) : error ? (
                <div className="text-sm text-red-500 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Coach is currently unavailable (AI Error).
                </div>
            ) : (
                <div className="grid gap-3">
                    {insights.slice(0, 3).map((insight, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className={cn(
                                "p-3 rounded-md border text-sm",
                                insight.type === 'Trend' ? "bg-emerald-50 border-emerald-100 text-emerald-800" :
                                    insight.type === 'Alert' ? "bg-red-50 border-red-100 text-red-800" :
                                        "bg-white border-zinc-100 text-zinc-700 shadow-sm"
                            )}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                {insight.type === 'Trend' && <TrendingUp className="h-3 w-3" />}
                                {insight.type === 'Suggestion' && <Lightbulb className="h-3 w-3" />}
                                {insight.type === 'Insight' && <Sparkles className="h-3 w-3" />}
                                <span className="font-bold">{insight.title}</span>
                            </div>
                            <p className="opacity-90 leading-relaxed">{insight.description}</p>
                        </motion.div>
                    ))}
                </div>
            )}

            <Sparkles className="absolute -bottom-4 -right-4 h-24 w-24 text-amber-500/5 rotate-12 pointer-events-none" />
        </Card>
    )
}
