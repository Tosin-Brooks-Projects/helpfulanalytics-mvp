"use client"

import { LinearShell } from "@/components/linear/linear-shell"
import { LinearMetricsOverview, LinearGreeting, NoPropertyPlaceholder } from "@/components/linear"
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
                    <NoPropertyPlaceholder />
                )}
            </div>
        </LinearShell>
    )
}
