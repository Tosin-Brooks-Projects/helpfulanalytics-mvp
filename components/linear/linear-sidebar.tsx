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

const items = [
    { title: "Overview", href: "/dashboard", icon: LayoutGrid },
    { title: "Realtime", href: "/dashboard/realtime", icon: Zap },
    { title: "Reports", href: "/dashboard/reports", icon: BarChart3 },
    { title: "Audience", href: "/dashboard/audience", icon: Users },
    { title: "Sources", href: "/dashboard/sources", icon: Globe },
]

export function LinearSidebar() {
    const pathname = usePathname()

    return (
        <div className="flex h-full flex-col justify-between p-4">
            <div className="space-y-6">
                <div className="flex items-center gap-2 px-2 py-1">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-indigo-500/20 text-indigo-400">
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
