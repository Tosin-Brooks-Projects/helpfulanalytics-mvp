"use client"

import { Bell, Lock, Plus, Zap, Users, Globe, BarChart3, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { useDashboard } from "@/components/linear/dashboard-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DatePickerWithRange } from "./date-range-picker"
import { SyncButton } from "./sync-button"
import { DownloadReportButton } from "@/components/dashboard/download-report-button"
import { pricingData } from "@/config/subscriptions"
import { AddPropertyModal } from "@/components/dashboard/add-property-modal"
import { CommandPalette } from "./command-palette"
import { cn } from "@/lib/utils"

export function LinearHeader() {
    const { data: session } = useSession()
    const { properties, selectedProperty, setSelectedProperty, loading, dateRange, setDateRange, subscription } = useDashboard()
    const pathname = usePathname()

    const reportChips = [
        { title: "Realtime", href: "/dashboard/realtime", icon: Zap },
        { title: "Audience", href: "/dashboard/audience", icon: Users },
        { title: "Sources", href: "/dashboard/sources", icon: Globe },
    ]

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/20 bg-white/60 px-4 pl-14 lg:px-10 backdrop-blur-md">
            <div className="flex items-center gap-6">
                <CommandPalette />

                {/* Report Chips - Quick Navigation */}
                <nav className="hidden xl:flex items-center gap-1.5 border-l border-zinc-200 pl-6 ml-2">
                    {reportChips.map((chip) => {
                        const active = pathname === chip.href
                        return (
                            <Link
                                key={chip.href}
                                href={chip.href}
                                className={cn(
                                    "flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold transition-all duration-200",
                                    active
                                        ? "bg-amber-500/10 text-amber-600 shadow-sm"
                                        : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                                )}
                            >
                                <chip.icon className={cn("h-3 w-3", active ? "text-amber-500" : "text-zinc-400")} />
                                {chip.title}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="flex items-center gap-3">
                <DownloadReportButton />
                <div className="h-4 w-px bg-zinc-200 mx-1 hidden sm:block" />
                <SyncButton />
                <DatePickerWithRange date={dateRange} setDate={setDateRange} />

                {!loading && properties.length > 0 && (
                    <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                        <SelectTrigger className="h-8 min-w-[160px] border-white/20 bg-white/50 hover:bg-white/80 text-[11px] font-medium text-zinc-900 focus:ring-0 rounded-md shadow-sm transition-all px-2.5 backdrop-blur-sm">
                            <SelectValue placeholder="Select Property" className="truncate" />
                        </SelectTrigger>
                        <SelectContent className="border-zinc-200 bg-white text-zinc-700 shadow-2xl rounded-lg min-w-[220px]">
                            <div className="p-1">
                                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2 py-1.5 block">Properties</span>
                                {properties.map((prop) => (
                                    <SelectItem
                                        key={prop.id}
                                        value={prop.id}
                                        className="text-[11px] font-medium focus:bg-amber-500/10 focus:text-amber-600 cursor-pointer rounded-md py-1.5 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="flex h-4 w-4 items-center justify-center rounded-sm bg-zinc-100 text-[9px] font-bold text-zinc-500">
                                                {prop.name.charAt(0)}
                                            </div>
                                            {prop.name}
                                        </div>
                                    </SelectItem>
                                ))}
                            </div>

                            <div className="mt-1 border-t border-zinc-100 p-1 bg-zinc-50/50">
                                {/* Logic for Free/Locked Slots */}
                                {(() => {
                                    const currentTier = subscription?.tier || "Starter"
                                    const tierConfig = pricingData.find(t => t.title.toLowerCase() === currentTier.toLowerCase())
                                    const maxProps = tierConfig?.maxProperties || 1
                                    const usage = properties.length
                                    const freeSlots = Math.max(0, maxProps - usage)

                                    const slots = []
                                    // Add Property Action
                                    if (freeSlots > 0) {
                                        slots.push(
                                            <AddPropertyModal key="add-new">
                                                <div className="flex w-full cursor-pointer select-none items-center rounded-md py-1.5 px-2 text-[11px] font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-colors">
                                                    <Plus className="mr-2 h-3.5 w-3.5 text-zinc-400" />
                                                    <span>Add Property</span>
                                                    <span className="ml-auto text-[10px] text-zinc-400 bg-white border border-zinc-200 px-1 rounded">{freeSlots} left</span>
                                                </div>
                                            </AddPropertyModal>
                                        )
                                    }

                                    // Upgrade Action
                                    if (maxProps < 30) {
                                        slots.push(
                                            <Link key="upgrade" href="/dashboard/settings" className="flex w-full cursor-pointer select-none items-center rounded-md py-1.5 px-2 text-[11px] font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-colors mt-0.5">
                                                <Lock className="mr-2 h-3.5 w-3.5 text-zinc-400" />
                                                <span>Upgrade Plan</span>
                                            </Link>
                                        )
                                    }
                                    return slots
                                })()}
                            </div>
                        </SelectContent>
                    </Select>
                )}

                <Link href="/dashboard/profile">
                    <div className="h-7 w-7 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 ring-2 ring-white cursor-pointer hover:ring-amber-500/50 transition-all shadow-sm overflow-hidden flex items-center justify-center">
                        {session?.user?.image ? (
                            <img src={session.user.image} alt={session.user.name || "User"} className="h-full w-full object-cover" />
                        ) : (
                            <User className="h-4 w-4 text-white" />
                        )}
                    </div>
                </Link>
            </div>
        </header>
    )
}
