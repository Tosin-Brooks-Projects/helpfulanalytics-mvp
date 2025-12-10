"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"
import { Sparkline } from "@/components/ui/sparkline"

interface StatCardProps {
    title: string
    value: string | number
    icon: LucideIcon
    description?: string
    trend?: {
        value: number
        label: string
    }
    chartData?: number[]
    customTitle?: React.ReactNode
}

export function StatCard({ title, value, icon: Icon, description, trend, chartData, customTitle }: StatCardProps) {
    return (
        <div className="group relative overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:border-primary/20">
            <div className="p-6">
                <div className="flex items-center justify-between space-y-0 pb-2">
                    <p className="text-sm font-medium text-muted-foreground">{customTitle || title}</p>
                    <Icon className="h-4 w-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex items-end justify-between pt-4">
                    <div>
                        <div className="text-2xl font-bold tabular-nums tracking-tight">{value}</div>
                        {(description || trend) && (
                            <p className="text-xs text-muted-foreground mt-1">
                                {trend && (
                                    <span className={cn("mr-1 font-medium", trend.value >= 0 ? "text-emerald-500" : "text-rose-500")}>
                                        {trend.value >= 0 ? "+" : ""}
                                        {trend.value}%
                                    </span>
                                )}{" "}
                                {description}
                            </p>
                        )}
                    </div>
                    {chartData && (
                        <div className="h-[32px] w-[64px] opacity-30 group-hover:opacity-100 transition-opacity">
                            <Sparkline data={chartData} width={64} height={32} color={trend?.value && trend.value < 0 ? "#f43f5e" : "#10b981"} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
