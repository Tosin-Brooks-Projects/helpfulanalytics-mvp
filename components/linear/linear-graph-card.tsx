"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface LinearGraphCardProps {
    title: string
    subtitle?: string
    children: ReactNode
    className?: string
    action?: ReactNode
}

export function LinearGraphCard({ title, subtitle, children, className, action }: LinearGraphCardProps) {
    return (
        <div className={cn("rounded-lg border border-zinc-200 bg-white p-6 shadow-sm", className)}>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
                    {subtitle && <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>}
                </div>
                {action}
            </div>
            <div className="w-full">
                {children}
            </div>
        </div>
    )
}
