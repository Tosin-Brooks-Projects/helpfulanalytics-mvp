"use client"

import { useEffect, useState } from "react"
import { LinearShell } from "@/components/linear/linear-shell"
import { LinearGraphCard, LinearDataTable } from "@/components/linear"
import { FileText } from "lucide-react"
import { useDashboard } from "@/components/linear/dashboard-context"

interface PageData {
    pagePath: string
    pageTitle: string
    pageViews: number
    uniquePageViews: number
    avgTimeOnPage: number
    bounceRate: number
}

export default function ReportsPage() {
    const { selectedProperty } = useDashboard()
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            if (!selectedProperty) return
            setLoading(true)
            try {
                const res = await fetch(`/api/analytics?propertyId=${selectedProperty}&reportType=pages`)
                const json = await res.json()
                setData(json)
            } catch (error) {
                console.error("Failed to fetch reports data", error)
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
                    Loading reports...
                </div>
            </LinearShell>
        )
    }

    const pagesData: PageData[] = data?.pages || []

    return (
        <LinearShell>
            <div className="flex flex-col gap-8">
                <div>
                    <h1 className="text-2xl font-medium tracking-tight text-zinc-100">Reports</h1>
                    <p className="text-sm text-zinc-400">Detailed breakdown of your content performance.</p>
                </div>

                <LinearGraphCard title="Top Pages" subtitle="Most visited pages in the last 30 days">
                    <LinearDataTable<PageData>
                        data={pagesData}
                        columns={[
                            {
                                header: "Page Path",
                                accessorKey: "pagePath",
                                cell: (item) => (
                                    <div className="flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-zinc-600" />
                                        <div className="flex flex-col">
                                            <span className="font-medium">{item.pageTitle}</span>
                                            <span className="text-xs text-zinc-500">{item.pagePath}</span>
                                        </div>
                                    </div>
                                )
                            },
                            { header: "Page Views", accessorKey: "pageViews", className: "text-right" },
                            { header: "Unique Users", accessorKey: "uniquePageViews", className: "text-right text-zinc-500" },
                            {
                                header: "Avg. Time",
                                accessorKey: "avgTimeOnPage",
                                className: "text-right",
                                cell: (item) => `${Math.floor(item.avgTimeOnPage)}s`
                            },
                            {
                                header: "Bounce Rate",
                                accessorKey: "bounceRate",
                                className: "text-right",
                                cell: (item) => `${(item.bounceRate * 100).toFixed(1)}%`
                            },
                        ]}
                    />
                </LinearGraphCard>
            </div>
        </LinearShell>
    )
}
