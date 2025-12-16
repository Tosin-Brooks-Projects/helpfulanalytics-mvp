"use client"

import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"
import { Sparkline } from "@/components/ui/sparkline"

interface LinearStatCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    trend?: {
        value: number
        label: string
    }
    chartData?: number[]
    className?: string
}

export function LinearStatCard({ title, value, icon: Icon, trend, chartData, className }: LinearStatCardProps) {
    return (
        <div className={cn(
            "group relative overflow-hidden rounded-lg border border-white/5 bg-white/[0.02] p-5 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04]",
            className
        )}>
            {/* Glow Effect */}
            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-amber-500/10 blur-[50px] transition-all duration-500 group-hover:bg-amber-500/20" />

            <div className="relative z-10 flex flex-col justify-between h-full gap-4">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{title}</span>
                    <Icon className="h-4 w-4 text-zinc-600 transition-colors group-hover:text-zinc-400" />
                </div>

                <div className="flex items-end justify-between">
                    <div>
                        <div className="text-2xl font-medium tracking-tight text-zinc-100 tabular-nums">
                            {value}
                        </div>
                        {trend && (
                            <div className="mt-1 flex items-center gap-1.5">
                                <span className={cn(
                                    "text-xs font-medium",
                                    trend.value >= 0 ? "text-emerald-400" : "text-rose-400"
                                )}>
                                    {trend.value >= 0 ? "+" : ""}{trend.value}%
                                </span>
                                <span className="text-xs text-zinc-600">{trend.label}</span>
                            </div>
                        )}
                    </div>

                    {chartData && (
                        <div className="h-8 w-16 opacity-40 transition-opacity group-hover:opacity-100">
                            <Sparkline
                                data={chartData}
                                width={64}
                                height={32}
                                color={trend?.value && trend.value < 0 ? "#fb7185" : "#34d399"}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
