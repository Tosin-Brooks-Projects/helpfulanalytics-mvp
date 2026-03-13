"use client"

import { useEffect, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Card } from "@/components/ui/card"
import { Users, CreditCard, Clock, Activity, ArrowUp, ArrowDown } from "lucide-react"

export default function AdminOverviewPage() {
    const [stats, setStats] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch("/api/admin/stats")
                const data = await res.json()
                setStats(data.stats || [])
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    const icons: Record<string, any> = {
        "Total Users": Users,
        "Active Trials": Clock,
        "Paid Subscriptions": CreditCard,
        "System Health": Activity,
    }

    return (
        <AdminShell>
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900 font-outfit">Overview</h2>
                    <p className="text-zinc-500 mt-1">Global system performance and user growth.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {loading ? (
                        [...Array(4)].map((_, i) => (
                            <Card key={i} className="h-32 animate-pulse bg-white border-zinc-200" />
                        ))
                    ) : (
                        stats.map((stat) => {
                            const Icon = icons[stat.title] || Activity
                            return (
                                <Card key={stat.title} className="p-6 bg-white border-zinc-200 shadow-sm">
                                    <div className="flex items-center justify-between space-y-0 pb-2">
                                        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">{stat.title}</p>
                                        <div className="h-8 w-8 rounded-lg bg-zinc-50 flex items-center justify-center">
                                            <Icon className="h-4 w-4 text-zinc-400" />
                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <div className="text-2xl font-bold text-zinc-900">{stat.value}</div>
                                        {stat.delta && (
                                            <p className="text-xs font-medium text-emerald-600 mt-1 flex items-center gap-1">
                                                {stat.trend === "up" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
                                                {stat.delta}
                                            </p>
                                        )}
                                    </div>
                                </Card>
                            )
                        })
                    )}
                </div>

                {/* Additional segments could go here (e.g., Conversion Charts) */}
                <Card className="p-12 border-white/20 shadow-lg shadow-zinc-500/5 bg-white/60 backdrop-blur-md flex flex-col items-center justify-center text-center">
                    <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                        <Activity className="h-6 w-6 text-amber-500" />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900">System Activity</h3>
                    <p className="text-sm text-zinc-500 max-w-sm mt-2">
                        Real-time activity logs and conversion funnel tracking will be implemented in Phase 2.
                    </p>
                </Card>
            </div>
        </AdminShell>
    )
}
