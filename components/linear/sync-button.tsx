"use client"

import { useState } from "react"
import { RefreshCw, Check, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useDashboard } from "./dashboard-context"
import { motion, useReducedMotion } from "framer-motion"

const E = [0.23, 1, 0.32, 1] as const

export function SyncButton() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const { selectedProperty } = useDashboard()
    const reduced = useReducedMotion()

    const handleSync = async () => {
        setStatus("loading")
        const toastId = toast.loading("Syncing analytics data...")

        try {
            const url = selectedProperty ? `/api/analytics/sync?propertyId=${selectedProperty}` : "/api/analytics/sync"
            const res = await fetch(url, { method: "POST" })

            if (!res.ok) throw new Error("Sync failed")

            setStatus("success")
            toast.success("Analytics synced successfully", { id: toastId })
            setTimeout(() => setStatus("idle"), 3000)
        } catch (error) {
            console.error(error)
            setStatus("error")
            toast.error("Failed to sync analytics", { id: toastId })
            setTimeout(() => setStatus("idle"), 3000)
        }
    }

    const isLoading = status === "loading"
    const isSuccess = status === "success"
    const isError = status === "error"

    return (
        <motion.button
            onClick={handleSync}
            disabled={isLoading}
            title="Sync Data"
            whileHover={reduced ? undefined : { scale: 1.05 }}
            whileTap={reduced ? undefined : { scale: 0.93 }}
            transition={{ duration: 0.15, ease: E }}
            className={cn(
                "relative h-8 w-8 shrink-0 flex items-center justify-center rounded-md border shadow-sm overflow-hidden",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
                "transition-colors duration-150",
                isLoading && "border-amber-200 bg-amber-50/50 cursor-not-allowed",
                isSuccess && "border-emerald-200 bg-emerald-50 text-emerald-600",
                isError && "border-red-200 bg-red-50 text-red-600",
                !isLoading && !isSuccess && !isError && "border-zinc-200 bg-white text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50/80",
            )}
        >
            {/* Shimmer sweep on hover (idle only) */}
            {!isLoading && !isSuccess && !isError && (
                <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ x: "-100%", opacity: 0 }}
                    whileHover={reduced ? {} : { x: "100%", opacity: [0, 0.12, 0] }}
                    transition={{ duration: 0.45, ease: "linear" }}
                    style={{ background: "linear-gradient(90deg, transparent, #f59e0b, transparent)" }}
                />
            )}

            {isLoading && (
                <motion.div
                    className="absolute inset-0 bg-amber-400/8 rounded-md"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                />
            )}

            <motion.div
                key={status}
                initial={reduced ? {} : { opacity: 0, scale: 0.7, rotate: isLoading ? -30 : 0 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 0.18, ease: E }}
            >
                {isLoading ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-500" />
                ) : isSuccess ? (
                    <Check className="h-3.5 w-3.5" />
                ) : isError ? (
                    <AlertCircle className="h-3.5 w-3.5" />
                ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                )}
            </motion.div>
        </motion.button>
    )
}
