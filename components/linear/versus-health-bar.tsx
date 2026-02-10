"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Trophy, Medal, AlertCircle } from "lucide-react"

interface VersusHealthBarProps {
    currentValue: number
    previousValue: number
    metricLabel: string
    isWinning: boolean
}

export function VersusHealthBar({ currentValue, previousValue, metricLabel, isWinning }: VersusHealthBarProps) {
    const total = currentValue + previousValue
    // Avoid division by zero
    const currentPercent = total > 0 ? (currentValue / total) * 100 : 50
    const previousPercent = total > 0 ? (previousValue / total) * 100 : 50

    return (
        <div className="w-full space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm font-medium gap-2">
                <div className={cn("flex items-center gap-2", isWinning ? "text-amber-600" : "text-zinc-500")}>
                    <span className="font-bold">This Period</span>
                    <span className="text-xs opacity-70">({currentValue.toLocaleString()})</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                    <span className="text-xs opacity-70">({previousValue.toLocaleString()})</span>
                    <span className="font-bold">Last Period</span>
                </div>
            </div>

            <div className="relative h-8 w-full overflow-hidden rounded-full bg-zinc-100 flex shadow-inner border border-zinc-200">
                {/* Current Period Bar (Left) */}
                <motion.div
                    initial={{ width: "50%" }}
                    animate={{ width: `${currentPercent}%` }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                    className={cn(
                        "h-full flex items-center justify-start px-2 sm:px-3 relative z-10",
                        isWinning
                            ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                            : "bg-zinc-300 text-zinc-600"
                    )}
                >
                    <span className="text-[10px] sm:text-xs font-bold whitespace-nowrap">
                        {currentPercent.toFixed(1)}%
                    </span>
                    {isWinning && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1.4 }}
                            className="absolute right-2 hidden sm:block"
                        >
                            <Trophy className="h-4 w-4 text-white drop-shadow-md" />
                        </motion.div>
                    )}
                </motion.div>

                {/* Previous Period Bar (Right) */}
                <motion.div
                    initial={{ width: "50%" }}
                    animate={{ width: `${previousPercent}%` }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                    className={cn(
                        "h-full flex items-center justify-end px-2 sm:px-3",
                        !isWinning
                            ? "bg-gradient-to-l from-emerald-500 to-teal-500 text-white"
                            : "bg-zinc-200 text-zinc-500"
                    )}
                >
                    {!isWinning && (
                        <div className="mr-2 hidden sm:block">
                            <Medal className="h-4 w-4 text-white drop-shadow-md" />
                        </div>
                    )}
                    <span className="text-[10px] sm:text-xs font-bold whitespace-nowrap">
                        {previousPercent.toFixed(1)}%
                    </span>
                </motion.div>

                {/* Vs Badge Center */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 bg-white rounded-full p-1 shadow-sm border border-zinc-100">
                    <div className="h-5 w-5 sm:h-6 sm:w-6 rounded-full bg-zinc-900 flex items-center justify-center text-[8px] sm:text-[10px] font-black text-white italic">
                        VS
                    </div>
                </div>
            </div>

            <div className="text-center">
                <p className="text-[10px] sm:text-xs text-zinc-400">
                    Based on total {metricLabel.toLowerCase()} volume
                </p>
            </div>
        </div>
    )
}
