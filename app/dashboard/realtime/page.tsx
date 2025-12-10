"use client"

import { useEffect, useState } from "react"
import { LinearShell } from "@/components/linear/linear-shell"
import { LinearGraphCard, LinearDataTable } from "@/components/linear"
import { Activity, Globe, Smartphone } from "lucide-react"
import { useDashboard } from "@/components/linear/dashboard-context"

export default function RealtimePage() {
    const { selectedProperty } = useDashboard()
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            if (!selectedProperty) return
            // Don't set loading to true on refresh to avoid flicker
            if (!data) setLoading(true)

            try {
                const res = await fetch(`/api/analytics?propertyId=${selectedProperty}&reportType=realtime`)
                const json = await res.json()
                setData(json)
            } catch (error) {
                console.error("Failed to fetch realtime data", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
        // Poll every 30 seconds
        const interval = setInterval(fetchData, 30000)
        return () => clearInterval(interval)
    }, [selectedProperty])

    if (loading && !data) {
        return (
            <LinearShell>
                <div className="flex items-center justify-center h-96 text-zinc-500">
                    Loading realtime data...
                </div>
            </LinearShell>
        )
    }

    const activeUsers = data?.activeUsers || 0
    const activePages = data?.pages || []

    return (
        <LinearShell>
            <div className="flex flex-col gap-8">
                <div>
                    <div className="flex items-center gap-2">
                        <div className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </div>
                        <h1 className="text-2xl font-medium tracking-tight text-zinc-100">Realtime Overview</h1>
                    </div>
                    <p className="text-sm text-zinc-400 mt-1">Monitoring active users in the last 30 minutes.</p>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Big Counter */}
                    <LinearGraphCard title="Users Right Now" className="lg:col-span-1 h-64 flex flex-col justify-center items-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent" />
                        <div className="text-8xl font-bold text-zinc-100 tracking-tighter relative z-10 transition-all duration-500">
                            {activeUsers}
                        </div>
                        <p className="text-zinc-500 mt-4 animate-pulse">Updating live...</p>
                    </LinearGraphCard>

                    {/* Device Breakdown - Placeholder for now as Realtime API is limited */}
                    <LinearGraphCard title="Device Breakdown" className="lg:col-span-2 h-64">
                        <div className="flex items-center justify-around h-full pb-6">
                            <div className="flex flex-col items-center gap-2">
                                <div className="p-4 rounded-full bg-white/5 text-zinc-400">
                                    <Smartphone className="h-6 w-6" />
                                </div>
                                <span className="text-2xl font-medium text-zinc-200">--</span>
                                <span className="text-xs text-zinc-500">Mobile</span>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="p-4 rounded-full bg-white/5 text-zinc-400">
                                    <Globe className="h-6 w-6" />
                                </div>
                                <span className="text-2xl font-medium text-zinc-200">--</span>
                                <span className="text-xs text-zinc-500">Desktop</span>
                            </div>
                        </div>
                    </LinearGraphCard>
                </div>

                {/* Active Pages Table */}
                <LinearGraphCard title="Top Active Pages">
                    <LinearDataTable
                        data={activePages}
                        columns={[
                            { header: "Page Title", accessorKey: "title", className: "w-1/2" },
                            { header: "Path", accessorKey: "path", className: "font-mono text-xs text-zinc-500" },
                            { header: "Active Users", accessorKey: "active", className: "text-right font-medium text-emerald-400" },
                        ]}
                    />
                </LinearGraphCard>
            </div>
        </LinearShell>
    )
}
