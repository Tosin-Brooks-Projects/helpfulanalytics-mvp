"use client"

import { useDashboard } from "./dashboard-context"
import { subDays, startOfYear } from "date-fns"
import { cn } from "@/lib/utils"

export function DateFilterBar() {
    const { setDateRange, dateRange } = useDashboard()

    const presets = [
        { label: "7D", days: 7 },
        { label: "30D", days: 30 },
        { label: "90D", days: 90 },
        { label: "YTD", days: "year" },
    ]

    const handleSelect = (days: number | string) => {
        if (days === "year") {
            setDateRange({ from: startOfYear(new Date()), to: new Date() })
        } else if (typeof days === 'number') {
            setDateRange({ from: subDays(new Date(), days), to: new Date() })
        }
    }

    return (
        <div className="flex items-center gap-1 bg-white/50 backdrop-blur-sm p-1 rounded-lg border border-white/20 shadow-sm w-fit">
            {presets.map((preset) => {
                // Simple active check logic (approximate)
                let isActive = false
                if (dateRange?.to && dateRange?.from) {
                    const diff = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 3600 * 24))
                    if (preset.days === "year") {
                        isActive = dateRange.from.getDate() === 1 && dateRange.from.getMonth() === 0
                    } else {
                        isActive = Math.abs(diff - (preset.days as number)) <= 1
                    }
                }

                return (
                    <button
                        key={preset.label}
                        onClick={() => handleSelect(preset.days)}
                        className={cn(
                            "px-2.5 py-1 text-[10px] font-bold rounded-md transition-all",
                            isActive
                                ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200"
                                : "text-zinc-500 hover:text-zinc-900 hover:bg-white/50"
                        )}
                    >
                        {preset.label}
                    </button>
                )
            })}
        </div>
    )
}
