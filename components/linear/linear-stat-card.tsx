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
    variant?: "default" | "indigo" | "amber" | "emerald" | "rose"
}

export function LinearStatCard({
    title,
    value,
    icon: Icon,
    trend,
    chartData,
    className,
    description,
    variant = "default"
}: LinearStatCardProps) {
    const variants = {
        default: {
            container: "bg-white hover:border-zinc-300",
            iconBg: "bg-zinc-50 group-hover:bg-zinc-100",
            iconColor: "text-zinc-400 group-hover:text-zinc-600",
            sparkline: "#71717a"
        },
        indigo: {
            container: "bg-gradient-to-br from-indigo-50/40 via-white to-white border-indigo-100 hover:border-indigo-200 hover:shadow-indigo-500/5",
            iconBg: "bg-indigo-50 group-hover:bg-indigo-100",
            iconColor: "text-indigo-500",
            sparkline: "#6366f1"
        },
        amber: {
            container: "bg-gradient-to-br from-amber-50/40 via-white to-white border-amber-100 hover:border-amber-200 hover:shadow-amber-500/5",
            iconBg: "bg-amber-50 group-hover:bg-amber-100",
            iconColor: "text-amber-500",
            sparkline: "#f59e0b"
        },
        emerald: {
            container: "bg-gradient-to-br from-emerald-50/40 via-white to-white border-emerald-100 hover:border-emerald-200 hover:shadow-emerald-500/5",
            iconBg: "bg-emerald-50 group-hover:bg-emerald-100",
            iconColor: "text-emerald-500",
            sparkline: "#10b981"
        },
        rose: {
            container: "bg-gradient-to-br from-rose-50/40 via-white to-white border-rose-100 hover:border-rose-200 hover:shadow-rose-500/5",
            iconBg: "bg-rose-50 group-hover:bg-rose-100",
            iconColor: "text-rose-500",
            sparkline: "#f43f5e"
        }
    }

    const currentVariant = variants[variant]

    return (
        <div className={cn(
            "group relative overflow-hidden rounded-xl border p-5 transition-all duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
            currentVariant.container,
            className
        )}>
            <div className="relative z-10 flex flex-col justify-between h-full gap-4">
                <div className="flex items-center justify-between">
                    <TooltipProvider delayDuration={300}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-1.5 cursor-help">
                                    <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{title}</span>
                                    {description && <Info className="h-3 w-3 text-zinc-300 group-hover:text-zinc-400 transition-colors" />}
                                </div>
                            </TooltipTrigger>
                            {description && (
                                <TooltipContent side="top" className="max-w-[200px] text-[10px] leading-relaxed">
                                    {description}
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>
                    <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                        currentVariant.iconBg
                    )}>
                        <Icon className={cn("h-4 w-4 transition-colors", currentVariant.iconColor)} />
                    </div>
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
                                color={currentVariant.sparkline}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
