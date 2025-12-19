"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutGrid,
    BarChart3,
    Users,
    Settings,
    Zap,
    Globe,
    Layers,
    LogOut,
    ChevronLeft,
    ChevronRight
} from "lucide-react"
import { signOut } from "next-auth/react"
import { useDashboard } from "./dashboard-context"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

const items = [
    { title: "Overview", href: "/dashboard", icon: LayoutGrid },
    { title: "Realtime", href: "/dashboard/realtime", icon: Zap },
    { title: "Reports", href: "/dashboard/reports", icon: BarChart3 },
    { title: "Audience", href: "/dashboard/audience", icon: Users },
    { title: "Sources", href: "/dashboard/sources", icon: Globe },
]

export function LinearSidebar() {
    const pathname = usePathname()
    const { subscription, sidebarCollapsed, setSidebarCollapsed } = useDashboard()

    return (
        <TooltipProvider delayDuration={0}>
            <div className="flex h-full flex-col justify-between p-4 bg-white transition-all duration-300">
                <div className="space-y-6">
                    <div className={cn("flex items-center gap-2 px-2 py-1 transition-all", sidebarCollapsed ? "justify-center" : "")}>
                        <div className="flex h-6 w-6 items-center justify-center rounded bg-amber-500/10 text-amber-500 shrink-0">
                            <Layers className="h-4 w-4" />
                        </div>
                        {!sidebarCollapsed && <span className="text-sm font-medium tracking-tight text-zinc-900 truncate animate-in fade-in duration-300">Helpful Analytics</span>}
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
                                <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${subscription.status === 'active' || subscription.status === 'trialing'
                                    ? 'bg-emerald-500/10 text-emerald-600'
                                    : 'bg-yellow-500/10 text-yellow-600'
                                    }`}>
                                    {subscription.status === 'trialing' ? 'Trial' : subscription.status}
                                </span>
                            </div>
                            {subscription.trialEndsAt && new Date(subscription.trialEndsAt) > new Date() && (
                                <div className="mt-2 text-[10px] text-zinc-500">
                                    Trial ends in {Math.ceil((new Date(subscription.trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
                                </div>
                            )}
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
