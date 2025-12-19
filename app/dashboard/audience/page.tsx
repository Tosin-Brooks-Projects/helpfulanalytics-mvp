"use client"

import { useEffect, useState } from "react"
import { LinearShell } from "@/components/linear/linear-shell"
import { LinearGraphCard, LinearDataTable, NoPropertyPlaceholder } from "@/components/linear"
import { useDashboard } from "@/components/linear/dashboard-context"

export default function AudiencePage() {
    const { selectedProperty } = useDashboard()
    const [devicesData, setDevicesData] = useState<any>(null)
    const [locationsData, setLocationsData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            if (!selectedProperty) return
            setLoading(true)
            try {
                const [devicesRes, locationsRes] = await Promise.all([
                    fetch(`/api/analytics?propertyId=${selectedProperty}&reportType=devices`),
                    fetch(`/api/analytics?propertyId=${selectedProperty}&reportType=locations`)
                ])

                const devicesJson = await devicesRes.json()
                const locationsJson = await locationsRes.json()

                setDevicesData(devicesJson)
                setLocationsData(locationsJson)
            } catch (error) {
                console.error("Failed to fetch audience data", error)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [selectedProperty])

    return (
        <LinearShell>
            {!selectedProperty ? (
                <NoPropertyPlaceholder
                    title="Audience Insights"
                    description="Select a property to see where your users are from and what devices they use."
                />
            ) : loading ? (
                <div className="flex items-center justify-center h-96 text-zinc-500 animate-pulse">
                    Loading audience data...
                </div>
            ) : (
                <div className="flex flex-col gap-8">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Audience</h1>
                        <p className="text-sm text-zinc-500">Understand who your users are and where they come from.</p>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <LinearGraphCard title="Top Countries">
                            <LinearDataTable
                                data={locationsData?.countries || []}
                                columns={[
                                    { header: "Country", accessorKey: "country" },
                                    { header: "Users", accessorKey: "users", className: "text-right" },
                                    {
                                        header: "%",
                                        accessorKey: "percentage",
                                        className: "text-right text-zinc-500",
                                        cell: (item) => `${item.percentage.toFixed(1)}%`
                                    },
                                ]}
                            />
                        </LinearGraphCard>

                        <LinearGraphCard title="Devices">
                            <LinearDataTable
                                data={devicesData?.devices || []}
                                columns={[
                                    { header: "Device Category", accessorKey: "deviceCategory" },
                                    { header: "Sessions", accessorKey: "sessions", className: "text-right" },
                                    {
                                        header: "%",
                                        accessorKey: "percentage",
                                        className: "text-right text-zinc-500",
                                        cell: (item) => `${item.percentage.toFixed(1)}%`
                                    },
                                ]}
                            />
                        </LinearGraphCard>
                    </div>
                </div>
            )}
        </LinearShell>
    )
}
