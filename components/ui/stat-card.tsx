"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

interface StatCardProps {
    title: string
    value: string | number
    description?: string
    icon?: React.ElementType
    className?: string
    trend?: {
        value: number
        label: string
    }
    index?: number
}

export function StatCard({ title, value, description, icon: Icon, className, trend, index = 0 }: StatCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
        >
            <Card className={cn("overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all hover:border-primary/50 hover:shadow-md", className)}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                    {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold tracking-tight">{value}</div>
                    {(description || trend) && (
                        <p className="text-xs text-muted-foreground mt-1">
                            {trend && (
                                <span className={cn("mr-1 font-medium", trend.value > 0 ? "text-emerald-500" : "text-rose-500")}>
                                    {trend.value > 0 ? "+" : ""}
                                    {trend.value}%
                                </span>
                            )}
                            {description}
                        </p>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    )
}
