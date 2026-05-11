"use client"

import { Zap, Users, Globe } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { useDashboard } from "@/components/linear/dashboard-context"
import { DatePickerWithRange } from "./date-range-picker"
import { VersusDatePicker } from "./versus-date-picker"
import { SyncButton } from "./sync-button"
import { ExportDialog } from "@/components/dashboard/export-dialog"
import { pricingData } from "@/config/subscriptions"
import { EmptyPropertyCTA } from "@/components/dashboard/empty-property-cta"
import { PropertySwitcher } from "@/components/dashboard/property-switcher"
import { CommandPalette } from "./command-palette"
import { cn } from "@/lib/utils"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function LinearHeader() {
    const { data: session } = useSession()
    const { properties, selectedProperty, setSelectedProperty, loading, dateRange, setDateRange, subscription, compareDateRange, setCompareDateRange, propertyLimit } = useDashboard()
    const pathname = usePathname()

    const reportChips = [
        { title: "Devices", href: "/dashboard/devices", icon: Zap },
        { title: "Audience", href: "/dashboard/audience", icon: Users },
        { title: "Sources", href: "/dashboard/sources", icon: Globe },
    ]

    const currentTier = subscription?.tier || "Starter"
    const tierConfig = pricingData.find(t => t.title.toLowerCase() === currentTier.toLowerCase())
    const maxProps = propertyLimit ?? tierConfig?.maxProperties ?? 1
    const freeSlots = Math.max(0, maxProps - properties.length)
    const showUpgrade = maxProps < 30

    const propertySwitcher = !loading && properties.length > 0 && (
        <PropertySwitcher
            properties={properties}
            selectedProperty={selectedProperty}
            setSelectedProperty={setSelectedProperty}
            freeSlots={freeSlots}
            showUpgrade={showUpgrade}
        />
    )

    return (
        <TooltipProvider>
            {/* ── Mobile Header ── */}
            <header className="sticky top-0 z-30 lg:hidden border-b border-zinc-100 bg-white/90 backdrop-blur-xl">
                <div className="flex h-12 items-center justify-between px-4">
                    {/* Left: Property selector */}
                    <div className="flex-1 min-w-0 mr-3">
                        {propertySwitcher ? (
                            <div id="header-property-selector">
                                {propertySwitcher}
                            </div>
                        ) : !loading ? (
                            <EmptyPropertyCTA />
                        ) : (
                            <span className="text-sm font-semibold text-zinc-900 truncate">Analytics</span>
                        )}
                    </div>

                    {/* Right: Minimal actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                        <div id="header-sync"><SyncButton /></div>
                        <Link href="/dashboard/profile">
                            <Avatar className="h-7 w-7 border border-zinc-200">
                                <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} className="object-cover" />
                                <AvatarFallback className="bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-medium text-[10px]">
                                    {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                                </AvatarFallback>
                            </Avatar>
                        </Link>
                    </div>
                </div>
            </header>

            {/* ── Desktop Header ── */}
            <header className="sticky top-0 z-30 hidden lg:flex h-14 items-center border-b border-white/20 bg-white/70 px-4 lg:pl-10 lg:pr-10 backdrop-blur-xl shadow-sm transition-all duration-300">
                <div className="w-full max-w-[1600px] mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div id="header-search">
                                    <CommandPalette />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs">
                                Search pages, commands, and settings (Cmd+K)
                            </TooltipContent>
                        </Tooltip>

                        {/* Report Chips - Quick Navigation */}
                        <nav id="header-nav" className="hidden 2xl:flex items-center gap-1.5 border-l border-zinc-200 pl-6 ml-2">
                            {reportChips.map((chip) => {
                                const active = pathname === chip.href
                                return (
                                    <Tooltip key={chip.href}>
                                        <TooltipTrigger asChild>
                                            <Link
                                                href={chip.href}
                                                className={cn(
                                                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all duration-200 border border-transparent",
                                                    active
                                                        ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                                                        : "text-zinc-500 hover:bg-zinc-100/80 hover:text-zinc-900"
                                                )}
                                            >
                                                <chip.icon className={cn("h-3 w-3", active ? "text-amber-500" : "text-zinc-400")} />
                                                {chip.title}
                                            </Link>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" className="text-xs">
                                            View {chip.title} Report
                                        </TooltipContent>
                                    </Tooltip>
                                )
                            })}
                        </nav>
                    </div>

                    <div className="flex items-center gap-3">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="relative" id="header-export">
                                    <div className="absolute -top-1 -right-1 z-10">
                                        <span className="relative flex h-2.5 w-2.5">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                                        </span>
                                    </div>
                                    <ExportDialog />
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs font-medium">
                                New: Export PDF & CSV reports
                            </TooltipContent>
                        </Tooltip>

                        <div className="h-4 w-px bg-zinc-200 mx-1" />

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div id="header-sync"><SyncButton /></div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs">
                                Refresh Data
                            </TooltipContent>
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm p-1 rounded-lg border border-white/20 shadow-sm px-2">
                                    {pathname.includes("/versus") ? (
                                        <div id="header-versus-picker">
                                            <VersusDatePicker
                                                dateRange={dateRange}
                                                setDateRange={setDateRange}
                                                compareDateRange={compareDateRange}
                                                setCompareDateRange={setCompareDateRange}
                                            />
                                        </div>
                                    ) : (
                                        <div id="header-date-picker">
                                            <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                                        </div>
                                    )}
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-xs">
                                {pathname.includes("/versus") ? "Compare two time periods" : "Select Date Range"}
                            </TooltipContent>
                        </Tooltip>

                        {!loading && properties.length === 0 && (
                            <div id="header-property-selector">
                                <EmptyPropertyCTA />
                            </div>
                        )}
                        {!loading && properties.length > 0 && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className="relative" id="header-property-selector">
                                        {propertySwitcher}
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent side="bottom" className="text-xs">
                                    Switch Property
                                </TooltipContent>
                            </Tooltip>
                        )}

                        <Link href="/dashboard/profile">
                            <Avatar className="h-8 w-8 border border-zinc-200 shadow-sm cursor-pointer hover:ring-2 hover:ring-amber-500/20 transition-all">
                                <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} className="object-cover" />
                                <AvatarFallback className="bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-medium text-xs">
                                    {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                                </AvatarFallback>
                            </Avatar>
                        </Link>
                    </div>
                </div>
            </header>
        </TooltipProvider>
    )
}
