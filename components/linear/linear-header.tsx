"use client"

import { Bell, Lock, Plus, Zap, Users, Globe, BarChart3, User, Swords } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { useDashboard } from "@/components/linear/dashboard-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { DatePickerWithRange } from "./date-range-picker"
import { SyncButton } from "./sync-button"
import { ExportDialog } from "@/components/dashboard/export-dialog"
import { pricingData } from "@/config/subscriptions"
import { AddPropertyModal } from "@/components/dashboard/add-property-modal"
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
    const { properties, selectedProperty, setSelectedProperty, loading, dateRange, setDateRange, subscription, isVersus, setIsVersus, compareDateRange, setCompareDateRange } = useDashboard()
    const pathname = usePathname()

    const reportChips = [
        { title: "Devices", href: "/dashboard/devices", icon: Zap },
        { title: "Audience", href: "/dashboard/audience", icon: Users },
        { title: "Sources", href: "/dashboard/sources", icon: Globe },
    ]

    return (
        <TooltipProvider>
            <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/20 bg-white/70 px-4 pl-14 lg:px-8 backdrop-blur-xl shadow-sm transition-all duration-300">
                <div className="flex items-center gap-6">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <div id="header-search"> {/* Wrapper div required for some triggers */}
                                <CommandPalette />
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">
                            Search pages, commands, and settings (Cmd+K)
                        </TooltipContent>
                    </Tooltip>

                    {/* Report Chips - Quick Navigation */}
                    <nav id="header-nav" className="hidden xl:flex items-center gap-1.5 border-l border-zinc-200 pl-6 ml-2">
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
                                {/* Hotspot Beacon */}
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
                            New: Export PDF & JSON reports
                        </TooltipContent>
                    </Tooltip>

                    <div className="h-4 w-px bg-zinc-200 mx-1 hidden sm:block" />

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
                                <div className="flex items-center gap-2 mr-2 border-r border-zinc-200 pr-2">
                                    <span className={cn("text-[10px] font-bold uppercase tracking-wider", isVersus ? "text-amber-600" : "text-zinc-400")}>Versus</span>
                                    <Switch
                                        checked={isVersus}
                                        onCheckedChange={setIsVersus}
                                        className="h-4 w-7 data-[state=checked]:bg-amber-500"
                                        thumbClassName="h-3 w-3 data-[state=checked]:translate-x-3"
                                    />
                                </div>

                                <div id="header-date-picker">
                                    <DatePickerWithRange date={dateRange} setDate={setDateRange} />
                                </div>

                                {isVersus && (
                                    <>
                                        <div className="text-[10px] font-bold text-zinc-400">VS</div>
                                        <div id="header-compare-picker">
                                            <DatePickerWithRange
                                                date={compareDateRange}
                                                setDate={setCompareDateRange}
                                                className="border-amber-200 bg-amber-50/50"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="text-xs">
                            {isVersus ? "Compare two time periods" : "Select Date Range"}
                        </TooltipContent>
                    </Tooltip>

                    {!loading && properties.length > 0 && (
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className="relative" id="header-property-selector">
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
            </header>
        </TooltipProvider>
    )
}
