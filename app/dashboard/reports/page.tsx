"use client"

import { LinearShell } from "@/components/linear/linear-shell"
import { TopPagesView } from "@/components/linear/reports/top-pages-view"
import { useDashboard } from "@/components/linear/dashboard-context"
import { NoPropertyPlaceholder } from "@/components/linear"

export default function ReportsPage() {
    const { selectedProperty } = useDashboard()

    return (
        <LinearShell>
            {selectedProperty ? (
                <TopPagesView propertyId={selectedProperty} />
            ) : (
                <NoPropertyPlaceholder />
            )}
        </LinearShell>
    )
}
