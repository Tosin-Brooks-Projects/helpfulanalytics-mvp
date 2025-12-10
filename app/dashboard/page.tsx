"use client"

import { LinearShell } from "@/components/linear/linear-shell"
import { LinearMetricsOverview, LinearGreeting } from "@/components/linear"
import { useDashboard } from "@/components/linear/dashboard-context"

export default function LinearDashboardPage() {
    const { selectedProperty, loading } = useDashboard()

    return (
        <LinearShell>
            <div className="flex flex-col gap-8">
                <LinearGreeting />

                {selectedProperty ? (
                    <LinearMetricsOverview propertyId={selectedProperty} />
                ) : (
                    <div className="flex h-64 items-center justify-center rounded-lg border border-white/5 bg-white/[0.02] text-zinc-500">
                        {loading ? "Loading properties..." : "No property selected"}
                    </div>
                )}
            </div>
        </LinearShell>
    )
}
