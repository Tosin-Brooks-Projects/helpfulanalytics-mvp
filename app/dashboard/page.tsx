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
                    <div className="flex h-[50vh] flex-col items-center justify-center rounded-lg border border-white/5 bg-white/[0.02] text-center p-8">
                        {loading ? (
                            <div className="flex flex-col items-center gap-4">
                                <span className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
                                <p className="text-zinc-500">Loading your properties...</p>
                            </div>
                        ) : (
                            <div className="max-w-md space-y-4">
                                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M18 17V9" /><path d="M13 17V5" /><path d="M8 17v-3" /></svg>
                                </div>
                                <h3 className="text-xl font-medium text-zinc-100">No Property Selected</h3>
                                <p className="text-zinc-400">
                                    Connect a Google Analytics 4 property to start seeing insights.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </LinearShell>
    )
}
