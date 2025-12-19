"use client"

import { useEffect, useState } from "react"
import { LinearShell } from "@/components/linear/linear-shell"
import { LinearGraphCard, LinearDataTable, NoPropertyPlaceholder } from "@/components/linear"
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

    const acquisitionData: SourceData[] = data?.sources || []

    return (
        <LinearShell>
            {!selectedProperty ? (
                <NoPropertyPlaceholder
                    title="Traffic Sources"
                    description="Select a property to see where your traffic is coming from and which channels perform best."
                />
            ) : loading ? (
                <div className="flex items-center justify-center h-96 text-zinc-500 animate-pulse">
                    Loading sources data...
                </div>
            ) : (
                <div className="flex flex-col gap-8">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Traffic Sources</h1>
                        <p className="text-sm text-zinc-500">Where your users are coming from.</p>
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
            )}
        </LinearShell>
    )
}
