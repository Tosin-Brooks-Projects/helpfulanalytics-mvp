"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, TrendingUp, Users, ArrowRight, Lightbulb, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Typewriter } from "@/components/ui/typewriter-effect"
import { useDashboard } from "@/components/linear/dashboard-context"

interface Insight {
    type: string
    title: string
    description: string
}

export function AIInsightsPanel() {
    const { selectedProperty, dateRange } = useDashboard()
    const [insights, setInsights] = useState<Insight[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(false)

    useEffect(() => {
        async function fetchInsights() {
            if (!selectedProperty || !dateRange?.from || !dateRange?.to) return

            setLoading(true)
            setError(false)
            try {
                const res = await fetch("/api/ai/insights", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        propertyId: selectedProperty,
                        startDate: dateRange.from.toISOString().split('T')[0],
                        endDate: dateRange.to.toISOString().split('T')[0]
                    }),
                })

                if (res.ok) {
                    const data = await res.json()
                    if (data.insights) {
                        setInsights(data.insights)
                    }
                } else {
                    if (res.status === 401) {
                        setInsights([{
                            type: "Configuration",
                            title: "Setup Required",
                            description: "Please add OPENROUTER_API_KEY to your .env file and restart the server."
                        }])
                    } else {
                        setError(true)
                    }
                }
            } catch (err) {
                console.error("Failed to fetch AI insights", err)
                setError(true)
            } finally {
                setLoading(false)
            }
        }

        fetchInsights()
    }, [selectedProperty, dateRange])


    const getIcon = (type: string) => {
        switch (type.toLowerCase()) {
            case "traffic anomaly": return <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            case "engagement spike": return <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            default: return <Lightbulb className="h-4 w-4 text-amber-500" />
        }
    }

    return (
        <div className="rounded-xl border bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-6 dark:from-slate-900/50 dark:to-slate-800/50">
            <div className="flex items-center gap-2 pb-4">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                <h3 className="text-sm font-medium text-indigo-950 dark:text-indigo-100">
                    AI Analysis
                </h3>
            </div>

            <div className="space-y-6 min-h-[150px]">
                {loading ? (
                    <div className="flex h-full min-h-[150px] items-center justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
                    </div>
                ) : error ? (
                    <div className="flex h-full min-h-[150px] items-center justify-center text-xs text-muted-foreground">
                        Unable to generate insights at this time.
                    </div>
                ) : insights.length === 0 ? (
                    <div className="flex h-full min-h-[150px] items-center justify-center text-xs text-muted-foreground">
                        No significant insights found for this period.
                    </div>
                ) : (
                    insights.map((insight, i) => (
                        <div key={i} className="flex gap-4">
                            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm dark:bg-slate-800">
                                {getIcon(insight.type)}
                            </div>
                            <div className="space-y-1">
                                <p className="text-sm font-medium leading-none">{insight.title}</p>
                                <p className="text-sm text-muted-foreground">
                                    <Typewriter text={insight.description} speed={15} />
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="mt-6 flex justify-end">
                <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground">
                    View Full Report <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
            </div>
        </div>
    )
}
