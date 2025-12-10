"use client"

import { useEffect, useState } from "react"
import { LinearShell } from "@/components/linear/linear-shell"
import { LinearGraphCard, LinearDataTable } from "@/components/linear"
import { useDashboard } from "@/components/linear/dashboard-context"

interface SourceData {
    source: string
    medium: string
    users: number
    sessions: number
    bounceRate: number
}

export default function SourcesPage() {
    const { selectedProperty } = useDashboard()
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            if (!selectedProperty) return
            setLoading(true)
            try {
                const res = await fetch(`/api/analytics?propertyId=${selectedProperty}&reportType=acquisition`)
                const json = await res.json()
                setData(json)
            } catch (error) {
                console.error("Failed to fetch sources data", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [selectedProperty])

    if (loading) {
        return (
            <LinearShell>
                <div className="flex items-center justify-center h-96 text-zinc-500">
                    Loading sources data...
                </div>
            </LinearShell>
        )
    }

    const acquisitionData: SourceData[] = data?.sources || []

    return (
        <LinearShell>
            <div className="flex flex-col gap-8">
                <div>
                    <h1 className="text-2xl font-medium tracking-tight text-zinc-100">Traffic Sources</h1>
                    <p className="text-sm text-zinc-400">Where your users are coming from.</p>
                </div>

                <LinearGraphCard title="Acquisition Channels">
                    <LinearDataTable<SourceData>
                        data={acquisitionData}
                        columns={[
                            {
                                header: "Source / Medium",
                                accessorKey: "source",
                                className: "font-medium",
                                cell: (item) => `${item.source} / ${item.medium}`
                            },
                            { header: "Users", accessorKey: "users", className: "text-right" },
                            { header: "Sessions", accessorKey: "sessions", className: "text-right" },
                            {
                                header: "Bounce Rate",
                                accessorKey: "bounceRate",
                                className: "text-right text-zinc-500",
                                cell: (item) => `${(item.bounceRate * 100).toFixed(1)}%`
                            },
                        ]}
                    />
                </LinearGraphCard>
            </div>
        </LinearShell>
    )
}
