"use client"

import { LinearShell } from "@/components/linear/linear-shell"
import { LinearMetricsOverview, LinearGreeting, NoPropertyPlaceholder } from "@/components/linear"
import { VersusOverview } from "@/components/linear/versus-overview"
import { DateFilterBar } from "@/components/linear/date-filter-bar"
import { useDashboard } from "@/components/linear/dashboard-context"

export default function LinearDashboardPage() {
    const { selectedProperty, loading, isVersus } = useDashboard()

    return (
        <LinearShell>
            <div className="flex flex-col gap-8">
                <div className="flex justify-end w-full">
                    <DateFilterBar />
                </div>
                <LinearGreeting />

                {selectedProperty ? (
                    isVersus ? (
                        <VersusOverview />
                    ) : (
                        <LinearMetricsOverview propertyId={selectedProperty} />
                    )
                ) : (
                    <NoPropertyPlaceholder />
                )}
            </div>
        </LinearShell>
    )
}
