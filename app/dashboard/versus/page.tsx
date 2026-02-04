"use client"

import { LinearShell } from "@/components/linear/linear-shell"
import { VersusOverview } from "@/components/linear/versus-overview"
import { LinearGreeting } from "@/components/linear"
import { useDashboard } from "@/components/linear/dashboard-context"
import { NoPropertyPlaceholder } from "@/components/linear"

export default function VersusPage() {
    const { selectedProperty } = useDashboard()

    return (
        <LinearShell>
            <div className="flex flex-col gap-8">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Versus Comparison</h1>
                </div>

                {selectedProperty ? (
                    <VersusOverview />
                ) : (
                    <NoPropertyPlaceholder />
                )}
            </div>
        </LinearShell>
    )
}
