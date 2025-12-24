"use client"

import { LinearShell } from "@/components/linear/linear-shell"
import { LinearMetricsOverview, LinearGreeting, NoPropertyPlaceholder } from "@/components/linear"
import { DateFilterBar } from "@/components/linear/date-filter-bar"
import { useDashboard } from "@/components/linear/dashboard-context"

export default function LinearDashboardPage() {
    const { selectedProperty, loading } = useDashboard()

    return (
        <LinearShell>
            <div className="flex flex-col gap-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <LinearGreeting />
                    <DateFilterBar />
                </div>

                {selectedProperty ? (
                    <LinearMetricsOverview propertyId={selectedProperty} />
                ) : (
                    <NoPropertyPlaceholder />
                )}
            </div>
        </LinearShell>
    )
}
