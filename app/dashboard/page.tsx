"use client"

import { LinearShell } from "@/components/linear/linear-shell"
import { LinearMetricsOverview, LinearGreeting, NoPropertyPlaceholder } from "@/components/linear"
import { DateFilterBar } from "@/components/linear/date-filter-bar"
import { useDashboard } from "@/components/linear/dashboard-context"
import { Suspense } from "react"

export const dynamic = "force-dynamic"

export default function LinearDashboardPage() {
    const { selectedProperty, loading } = useDashboard()

    return (
        <LinearShell>
            <Suspense fallback={<div className="h-96 animate-pulse bg-zinc-100 rounded-xl" />}>
                <div className="flex flex-col gap-8">
                    <div className="flex justify-end w-full">
                        <DateFilterBar />
                    </div>
                    <LinearGreeting />

                    {selectedProperty ? (
                        <LinearMetricsOverview propertyId={selectedProperty} />
                    ) : (
                        <NoPropertyPlaceholder />
                    )}
                </div>
            </Suspense>
        </LinearShell>
    )
}
