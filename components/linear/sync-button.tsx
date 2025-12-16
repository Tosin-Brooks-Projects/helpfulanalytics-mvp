"use client"

import { useState } from "react"
import { RefreshCw, Check, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function SyncButton() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")

    const handleSync = async () => {
        setStatus("loading")
        try {
            const res = await fetch("/api/analytics/sync", { method: "POST" })
            if (!res.ok) throw new Error("Sync failed")
            setStatus("success")

            // Reset after 3 seconds
            setTimeout(() => setStatus("idle"), 3000)
        } catch (error) {
            console.error(error)
            setStatus("error")
            setTimeout(() => setStatus("idle"), 3000)
        }
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={status === "loading"}
            className={cn(
                "h-8 border-white/10 bg-white/5 text-zinc-400 hover:text-zinc-100 transition-all",
                status === "success" && "border-green-500/20 bg-green-500/10 text-green-400",
                status === "error" && "border-red-500/20 bg-red-500/10 text-red-400"
            )}
        >
            {status === "loading" ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : status === "success" ? (
                <Check className="h-3.5 w-3.5" />
            ) : status === "error" ? (
                <AlertCircle className="h-3.5 w-3.5" />
            ) : (
                <RefreshCw className="h-3.5 w-3.5" />
            )}
            <span className="ml-2 hidden sm:inline">
                {status === "loading" ? "Syncing..." : status === "success" ? "Synced" : "Sync Data"}
            </span>
        </Button>
    )
}
