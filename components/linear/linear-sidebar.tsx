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
    LogOut
} from "lucide-react"
import { signOut } from "next-auth/react"
import { useDashboard } from "./dashboard-context"

const items = [
    { title: "Overview", href: "/dashboard", icon: LayoutGrid },
    { title: "Realtime", href: "/dashboard/realtime", icon: Zap },
    { title: "Reports", href: "/dashboard/reports", icon: BarChart3 },
    { title: "Audience", href: "/dashboard/audience", icon: Users },
    { title: "Sources", href: "/dashboard/sources", icon: Globe },
]

export function LinearSidebar() {
    const pathname = usePathname()
    const { subscription } = useDashboard()

    return (
        <div className="flex h-full flex-col justify-between p-4">
            <div className="space-y-6">
                <div className="flex items-center gap-2 px-2 py-1">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-amber-500/20 text-amber-400">
                        <Layers className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium tracking-tight text-zinc-100">Helpful Analytics</span>
                </div>

                <nav className="space-y-0.5">
                    {items.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors duration-200",
                                pathname === item.href
                                    ? "bg-white/5 text-zinc-100 font-medium"
                                    : "text-zinc-500 hover:bg-white/5 hover:text-zinc-300"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.title}
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="space-y-1">
                {/* Subscription Card */}
                {subscription && (
                    <div className="mb-4 rounded-md border border-white/5 bg-white/5 p-3">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-zinc-300 capitalize">
                                {subscription.tier} Plan
                            </span>
                            <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium ${subscription.status === 'active' || subscription.status === 'trialing'
                                ? 'bg-emerald-500/10 text-emerald-400'
                                : 'bg-yellow-500/10 text-yellow-500'
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
                            className="mt-3 block w-full rounded bg-amber-500/10 py-1.5 text-center text-xs font-medium text-amber-400 hover:bg-amber-500/20"
                        >
                            Upgrade
                        </Link>
                    </div>
                )}

                <Link
                    href="/dashboard/settings"
                    className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300"
                >
                    <Settings className="h-4 w-4" />
                    Settings
                </Link>
                <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-300"
                >
                    <LogOut className="h-4 w-4" />
                    Log out
                </button>
            </div>
        </div>
    )
}
