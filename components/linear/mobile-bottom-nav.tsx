"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutGrid,
    BarChart3,
    Users,
    Globe,
    Smartphone,
    Swords,
    Settings,
    LogOut,
    Ellipsis,
    Timer,
    Search,
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { signOut } from "next-auth/react"
import { useDashboard } from "./dashboard-context"
import { useState, useEffect } from "react"
import { ExportDialog } from "@/components/dashboard/export-dialog"

const navItems = [
    { title: "Overview", href: "/dashboard", icon: LayoutGrid },
    { title: "Versus", href: "/dashboard/versus", icon: Swords },
    { title: "Pages", href: "/dashboard/reports", icon: BarChart3 },
    { title: "Audience", href: "/dashboard/audience", icon: Users },
    { title: "Sources", href: "/dashboard/sources", icon: Globe },
]

export function MobileBottomNav() {
    const pathname = usePathname()
    const { subscription } = useDashboard()
    const [sheetOpen, setSheetOpen] = useState(false)

    // "More" sheet is active if on devices, settings, or profile
    const moreActive = ["/dashboard/devices", "/dashboard/settings", "/dashboard/profile"].some(p => pathname.startsWith(p))

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-zinc-200 bg-white/95 backdrop-blur-lg safe-area-bottom">
            <div className="flex items-center justify-around h-14 px-1">
                {navItems.map((item) => {
                    const active = item.href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname.startsWith(item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-lg transition-colors",
                                active
                                    ? "text-amber-600"
                                    : "text-zinc-400 active:text-zinc-600"
                            )}
                        >
                            <item.icon className={cn("h-5 w-5", active && "text-amber-500")} />
                            <span className={cn("text-[10px] font-medium", active ? "text-amber-600" : "text-zinc-500")}>{item.title}</span>
                        </Link>
                    )
                })}

                {/* More Sheet */}
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetTrigger asChild>
                        <button
                            className={cn(
                                "flex flex-col items-center justify-center gap-0.5 flex-1 py-1 rounded-lg transition-colors",
                                moreActive
                                    ? "text-amber-600"
                                    : "text-zinc-400 active:text-zinc-600"
                            )}
                        >
                            <Ellipsis className={cn("h-5 w-5", moreActive && "text-amber-500")} />
                            <span className={cn("text-[10px] font-medium", moreActive ? "text-amber-600" : "text-zinc-500")}>More</span>
                        </button>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="rounded-t-2xl border-t border-zinc-200 bg-white p-0 h-auto max-h-[60vh]">
                        <div className="p-4 pt-6">
                            <div className="w-10 h-1 rounded-full bg-zinc-200 mx-auto mb-6" />
                            <nav className="space-y-1">
                                <SheetNavLink
                                    href="/dashboard/devices"
                                    icon={Smartphone}
                                    label="Devices & Tech"
                                    active={pathname.startsWith("/dashboard/devices")}
                                    onClick={() => setSheetOpen(false)}
                                />
                                <SheetNavLink
                                    href="/dashboard/settings"
                                    icon={Settings}
                                    label="Settings"
                                    active={pathname.startsWith("/dashboard/settings")}
                                    onClick={() => setSheetOpen(false)}
                                />

                                <div className="border-t border-zinc-100 pt-2 mt-2 space-y-1">
                                    <button
                                        onClick={() => {
                                            setSheetOpen(false)
                                            setTimeout(() => {
                                                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
                                            }, 100)
                                        }}
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
                                    >
                                        <Search className="h-4 w-4 text-zinc-400" />
                                        <span>Search</span>
                                        <span className="ml-auto text-[10px] text-zinc-400 font-mono">Cmd+K</span>
                                    </button>
                                    <ExportDialog />
                                </div>

                                {subscription && (
                                    <div className="mx-1 my-3 rounded-lg border border-zinc-100 bg-zinc-50 p-3">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-zinc-700 capitalize">
                                                {subscription.tier} Plan
                                            </span>
                                            <span className={cn(
                                                "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                                                subscription.status === 'active' || subscription.status === 'trialing'
                                                    ? 'bg-emerald-500/10 text-emerald-600'
                                                    : 'bg-yellow-500/10 text-yellow-600'
                                            )}>
                                                {subscription.status === 'trialing' ? 'Trial' : subscription.status}
                                                <MobileCountdown subscription={subscription} />
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="border-t border-zinc-100 pt-2 mt-2">
                                    <button
                                        onClick={() => { setSheetOpen(false); signOut({ callbackUrl: "/" }) }}
                                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Log out</span>
                                    </button>
                                </div>
                            </nav>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </nav>
    )
}

function SheetNavLink({ href, icon: Icon, label, active, onClick }: {
    href: string
    icon: any
    label: string
    active: boolean
    onClick: () => void
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                    ? "bg-amber-50 text-amber-600 font-medium"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
            )}
        >
            <Icon className={cn("h-4 w-4", active ? "text-amber-500" : "text-zinc-400")} />
            <span>{label}</span>
        </Link>
    )
}

function MobileCountdown({ subscription }: { subscription: { status: string; trialEndsAt?: string; stripeCurrentPeriodEnd?: string } }) {
    const [now, setNow] = useState(new Date())

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 60000)
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
