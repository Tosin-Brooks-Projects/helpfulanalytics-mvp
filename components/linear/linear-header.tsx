"use client"

import { Bell, Lock, Plus } from "lucide-react"
import Link from "next/link"
import { useDashboard } from "@/components/linear/dashboard-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "./date-range-picker"
import { SyncButton } from "./sync-button"
import { DownloadReportButton } from "@/components/dashboard/download-report-button"
import { pricingData } from "@/config/subscriptions"
import { AddPropertyModal } from "@/components/dashboard/add-property-modal"

export function LinearHeader() {
    const { properties, selectedProperty, setSelectedProperty, loading, dateRange, setDateRange, subscription } = useDashboard()

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/5 bg-[#09090b]/80 px-4 pl-14 lg:px-10 backdrop-blur-xl">
            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center text-sm text-zinc-500">
                    <span className="text-zinc-300">Dashboard</span>
                    <span className="mx-2">/</span>
                    <span>Overview</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <DownloadReportButton />
                <SyncButton />
                <DatePickerWithRange date={dateRange} setDate={setDateRange} />

                {!loading && properties.length > 0 && (
                    <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                        <SelectTrigger className="h-8 w-[160px] md:w-[200px] border-white/10 bg-white/5 text-xs text-zinc-300 focus:ring-0">
                            <SelectValue placeholder="Select Property" />
                        </SelectTrigger>
                        <SelectContent className="border-white/10 bg-[#09090b] text-zinc-300">
                            {/* Active Properties */}
                            {properties.map((prop) => (
                                <SelectItem key={prop.id} value={prop.id} className="text-xs focus:bg-white/10 focus:text-zinc-100">
                                    {prop.name}
                                </SelectItem>
                            ))}

                            {/* Logic for Free/Locked Slots */}
                            {(() => {
                                const currentTier = subscription?.tier || "Starter"
                                const tierConfig = pricingData.find(t => t.title.toLowerCase() === currentTier.toLowerCase())
                                const maxProps = tierConfig?.maxProperties || 1
                                const usage = properties.length
                                const freeSlots = Math.max(0, maxProps - usage)

                                // Render Free Slots
                                const slots = []
                                for (let i = 0; i < freeSlots; i++) {
                                    slots.push(
                                        <AddPropertyModal key={`free-${i}`}>
                                            <div className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-xs outline-none text-zinc-500 hover:bg-white/5 hover:text-zinc-300 transition-colors opacity-75 hover:opacity-100">
                                                <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                                                    <Plus className="h-3 w-3" />
                                                </span>
                                                <span>Add Property</span>
                                            </div>
                                        </AddPropertyModal>
                                    )
                                }

                                // Render Locked Slot (if not Enterprise/Infinite)
                                if (maxProps < 30) {
                                    slots.push(
                                        <Link key="locked" href="/dashboard/settings" className="relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-xs outline-none text-zinc-500 hover:bg-white/5 hover:text-zinc-300 transition-colors">
                                            <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                                                <Lock className="h-3 w-3" />
                                            </span>
                                            <span>Upgrade for more</span>
                                        </Link>
                                    )
                                }
                                return slots
                            })()}
                        </SelectContent>
                    </Select>
                )}

                <Link href="/dashboard/notifications" className="text-zinc-500 hover:text-zinc-300 transition-colors">
                    <Bell className="h-4 w-4" />
                </Link>
                <Link href="/dashboard/profile">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 ring-2 ring-[#09090b] cursor-pointer hover:ring-indigo-500/50 transition-all" />
                </Link>
            </div>
        </header>
    )
}
