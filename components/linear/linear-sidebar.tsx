"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import {
    LayoutGrid,
    BarChart3,
    Users,
    Settings,
    Zap,
    Smartphone,
    Globe,
    Layers,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Swords,
    Timer,
    Bird,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { useDashboard } from "./dashboard-context"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

const KeaAvatarIcon = ({ className }: { className?: string }) => (
    <div className={cn("relative shrink-0 flex items-center justify-center", className)}>
        <img src="/kea.svg" alt="Kea AI" className="h-full w-full rounded-full object-cover" />
    </div>
)

const items = [
    { title: "Overview", href: "/dashboard", icon: LayoutGrid },
    { title: "Versus", href: "/dashboard/versus", icon: Swords },
    { title: "Devices", href: "/dashboard/devices", icon: Smartphone },
    { title: "Top Pages", href: "/dashboard/reports", icon: BarChart3 },
    { title: "Audience", href: "/dashboard/audience", icon: Users },
    { title: "Sources", href: "/dashboard/sources", icon: Globe },
    { title: "Kea AI", href: "/dashboard/kea", icon: KeaAvatarIcon },
]

export function LinearSidebar() {
    const pathname = usePathname()
    const { subscription, sidebarCollapsed, setSidebarCollapsed } = useDashboard()

    return (
        <TooltipProvider delayDuration={0}>
            <div id="sidebar-container" className="flex h-full flex-col justify-between p-4 bg-white transition-all duration-300">
                <div className="space-y-6">
                    <div className={cn("flex items-center gap-2 px-2 py-1 transition-all", sidebarCollapsed ? "justify-center" : "")}>
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-amber-500/10 text-amber-500 shrink-0">
                            <Layers className="h-4 w-4" />
                        </div>
                        {!sidebarCollapsed && <span className="text-sm font-semibold tracking-tight text-zinc-900 truncate animate-in fade-in duration-300 font-outfit">Helpful Analytics</span>}
                    </div>

                    <nav className="space-y-1">
                        {items.map((item) => (
                            <Tooltip key={item.href}>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-all duration-200",
                                            pathname === item.href
                                                ? "bg-amber-500/10 text-amber-600 font-medium shadow-sm"
                                                : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900",
                                            sidebarCollapsed ? "justify-center px-0 h-9 w-9 mx-auto" : ""
                                        )}
                                    >
                                        <item.icon className="h-4 w-4 shrink-0" />
                                        {!sidebarCollapsed && <span className="truncate animate-in fade-in duration-300">{item.title}</span>}
                                    </Link>
                                </TooltipTrigger>
                                {sidebarCollapsed && (
                                    <TooltipContent side="right">
                                        {item.title}
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        ))}
                    </nav>
                </div>

                <div className="space-y-1">
                    {/* Subscription Card - Hidden when collapsed */}
                    {subscription && !sidebarCollapsed && (
                        <div className="mb-4 rounded-md border border-zinc-100 bg-zinc-50 p-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-zinc-700 capitalize">
                                    {subscription.tier} Plan
                                </span>
                                <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium ${subscription.status === 'active' || subscription.status === 'trialing'
                                    ? 'bg-emerald-500/10 text-emerald-600'
                                    : 'bg-yellow-500/10 text-yellow-600'
                                    }`}>
                                    {subscription.status === 'trialing' ? 'Trial' : subscription.status}
                                    <PlanCountdown subscription={subscription} />
                                </span>
                            </div>
                            <Link
                                href="/dashboard/settings"
                                className="mt-3 block w-full rounded bg-amber-500 py-1.5 text-center text-xs font-medium text-white hover:bg-amber-600 transition-colors shadow-sm"
                            >
                                Upgrade
                            </Link>
                        </div>
                    )}

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                                className={cn(
                                    "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-50 hover:text-zinc-900 mb-4",
                                    sidebarCollapsed ? "justify-center" : ""
                                )}
                            >
                                {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                                {!sidebarCollapsed && <span>Collapse</span>}
                            </button>
                        </TooltipTrigger>
                        {sidebarCollapsed && (
                            <TooltipContent side="right">
                                Expand
                            </TooltipContent>
                        )}
                    </Tooltip>

                    <nav className="space-y-1">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Link
                                    href="/dashboard/settings"
                                    className={cn(
                                        "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900",
                                        sidebarCollapsed ? "justify-center h-9 w-9 mx-auto" : ""
                                    )}
                                >
                                    <Settings className="h-4 w-4" />
                                    {!sidebarCollapsed && <span className="animate-in fade-in duration-300">Settings</span>}
                                </Link>
                            </TooltipTrigger>
                            {sidebarCollapsed && (
                                <TooltipContent side="right">
                                    Settings
                                </TooltipContent>
                            )}
                        </Tooltip>

                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => signOut({ callbackUrl: "/" })}
                                    className={cn(
                                        "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900 text-left",
                                        sidebarCollapsed ? "justify-center h-9 w-9 mx-auto" : ""
                                    )}
                                >
                                    <LogOut className="h-4 w-4" />
                                    {!sidebarCollapsed && <span className="animate-in fade-in duration-300">Log out</span>}
                                </button>
                            </TooltipTrigger>
                            {sidebarCollapsed && (
                                <TooltipContent side="right">
                                    Log out
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </nav>
                </div>
            </div>
        </TooltipProvider>
    )
}

function PlanCountdown({ subscription }: { subscription: { status: string; trialEndsAt?: string; stripeCurrentPeriodEnd?: string } }) {
    const [now, setNow] = useState(new Date())

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 60000) // update every minute
        return () => clearInterval(interval)
    }, [])

    const endDate = subscription.stripeCurrentPeriodEnd
        ? new Date(subscription.stripeCurrentPeriodEnd)
        : subscription.trialEndsAt
            ? new Date(subscription.trialEndsAt)
            : null

    if (!endDate || isNaN(endDate.getTime()) || endDate <= now) return null

    const diffMs = endDate.getTime() - now.getTime()
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

    const label = days > 0 ? `${days}d ${hours}h` : `${hours}h`

    return (
        <span className="flex items-center gap-0.5 tabular-nums">
            <Timer className="h-2.5 w-2.5" />
            {label}
        </span>
    )
}
