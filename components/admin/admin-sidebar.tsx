"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
    LayoutGrid,
    Users,
    Settings,
    Shield,
    ChevronLeft,
    LogOut,
    Home
} from "lucide-react"
import { signOut } from "next-auth/react"

const menuItems = [
    { title: "Overview", href: "/admin", icon: LayoutGrid },
    { title: "Users", href: "/admin/users", icon: Users },
    { title: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
    const pathname = usePathname()

    return (
        <div className="flex h-full flex-col justify-between p-4 bg-zinc-900 text-zinc-400">
            <div className="space-y-6">
                <div className="flex items-center gap-2 px-2 py-1">
                    <div className="flex h-6 w-6 items-center justify-center rounded bg-amber-500 text-white shrink-0">
                        <Shield className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-semibold tracking-tight text-white font-outfit">Admin Panel</span>
                </div>

                <nav className="space-y-1">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-all duration-200",
                                pathname === item.href
                                    ? "bg-white/10 text-white font-medium shadow-sm"
                                    : "hover:bg-white/5 hover:text-white"
                            )}
                        >
                            <item.icon className="h-4 w-4 shrink-0" />
                            <span className="truncate">{item.title}</span>
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="space-y-1">
                <div className="px-2 py-2 mb-2">
                    <div className="h-px bg-zinc-800 w-full" />
                </div>
                
                <Link
                    href="/dashboard"
                    className="flex items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-white/5 hover:text-white"
                >
                    <Home className="h-4 w-4" />
                    <span>Back to App</span>
                </Link>

                <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-white/5 hover:text-white text-left"
                >
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                </button>
            </div>
        </div>
    )
}
