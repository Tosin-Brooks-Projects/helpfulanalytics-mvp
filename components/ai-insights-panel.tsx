"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, TrendingUp, Users, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Typewriter } from "@/components/ui/typewriter-effect"

export function AIInsightsPanel() {
    return (
        <div className="rounded-xl border bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-6 dark:from-slate-900/50 dark:to-slate-800/50">
            <div className="flex items-center gap-2 pb-4">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                <h3 className="text-sm font-medium text-indigo-950 dark:text-indigo-100">
                    AI Analysis
                </h3>
            </div>

            <div className="space-y-6">
                <div className="flex gap-4">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm dark:bg-slate-800">
                        <TrendingUp className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Traffic Anomaly</p>
                        <p className="text-sm text-muted-foreground">
                            <Typewriter text="Traffic is up 12% this week, primarily driven by organic search. This exceeds the projected growth of 5%." speed={20} />
                        </p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white shadow-sm dark:bg-slate-800">
                        <Users className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">Engagement Spike</p>
                        <p className="text-sm text-muted-foreground">
                            <Typewriter text="Visitors from Twitter are spending 2x longer on your site than average. Consider increasing ad spend on this channel." speed={20} />
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-end">
                <Button variant="ghost" size="sm" className="h-8 text-xs text-muted-foreground hover:text-foreground">
                    View Full Report <ArrowRight className="ml-1 h-3 w-3" />
                </Button>
            </div>
        </div>
    )
}
