"use client"

import { cn } from "@/lib/utils"
import { LucideIcon, Info } from "lucide-react"
import { Sparkline } from "@/components/ui/sparkline"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

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
    description?: string
}

export function LinearStatCard({ title, value, icon: Icon, trend, chartData, className, description }: LinearStatCardProps) {
    return (
        <div className={cn(
            "group relative overflow-hidden rounded-lg border border-zinc-200 bg-white p-5 transition-all duration-300 hover:shadow-md hover:border-zinc-300",
            className
        )}>
            <div className="relative z-10 flex flex-col justify-between h-full gap-4">
                <div className="flex items-center justify-between">
                    <TooltipProvider delayDuration={300}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 cursor-help">
                                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{title}</span>
                                    {description && <Info className="h-3 w-3 text-zinc-300 group-hover:text-amber-500 transition-colors" />}
                                </div>
                            </TooltipTrigger>
                            {description && (
                                <TooltipContent side="top" className="max-w-[200px] text-[10px] leading-relaxed">
                                    {description}
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>
                    <Icon className="h-4 w-4 text-zinc-400 transition-colors group-hover:text-zinc-600" />
                </div>

                <div className="flex items-end justify-between">
                    <div>
                        <div className="text-2xl font-bold tracking-tight text-zinc-900 tabular-nums">
                            {value}
                        </div>
                        {trend && (
                            <div className="mt-1 flex items-center gap-1.5">
                                <span className={cn(
                                    "text-xs font-medium",
                                    trend.value >= 0 ? "text-emerald-600" : "text-rose-600"
                                )}>
                                    {trend.value >= 0 ? "+" : ""}{trend.value}%
                                </span>
                                <span className="text-xs text-zinc-500">{trend.label}</span>
                            </div>
                        )}
                    </div>

                    {chartData && (
                        <div className="h-8 w-16 opacity-60 transition-opacity group-hover:opacity-100">
                            <Sparkline
                                data={chartData}
                                width={64}
                                height={32}
                                color={trend?.value && trend.value < 0 ? "#e11d48" : "#059669"}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
