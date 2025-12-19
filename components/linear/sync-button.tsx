"use client"

import { useState } from "react"
import { RefreshCw, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { useDashboard } from "./dashboard-context"

export function SyncButton() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
    const { selectedProperty } = useDashboard()

    const handleSync = async () => {
        setStatus("loading")
        const toastId = toast.loading("Syncing analytics data...")

        try {
            // Support selected property sync for faster feedback
            const url = selectedProperty ? `/api/analytics/sync?propertyId=${selectedProperty}` : "/api/analytics/sync"
            const res = await fetch(url, { method: "POST" })

            if (!res.ok) throw new Error("Sync failed")

            setStatus("success")
            toast.success("Analytics synced successfully", { id: toastId })

            // Reset after 3 seconds
            setTimeout(() => setStatus("idle"), 3000)
        } catch (error) {
            console.error(error)
            setStatus("error")
            toast.error("Failed to sync analytics", { id: toastId })
            setTimeout(() => setStatus("idle"), 3000)
        }
    }

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={handleSync}
            disabled={status === "loading"}
            title="Sync Data"
            className={cn(
                "h-8 w-8 shrink-0 border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-all shadow-sm relative overflow-hidden flex items-center justify-center p-0 rounded-md",
                status === "loading" && "border-amber-500/20",
                status === "success" && "border-green-500/20 bg-green-50 text-green-600",
                status === "error" && "border-red-500/20 bg-red-50 text-red-600"
            )}
        >
            {status === "loading" && (
                <div className="absolute inset-0 bg-amber-500/5 animate-pulse" />
            )}
            {status === "loading" ? (
                <RefreshCw className="h-4 w-4 animate-spin text-amber-500 relative z-10" />
            ) : status === "success" ? (
                <Check className="h-4 w-4 relative z-10" />
            ) : status === "error" ? (
                <AlertCircle className="h-4 w-4 relative z-10" />
            ) : (
                <RefreshCw className="h-4 w-4 relative z-10" />
            )}
        </Button>
    )
}
