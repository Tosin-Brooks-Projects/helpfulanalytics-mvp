"use client"

import { ReactNode } from "react"
import { AdminSidebar } from "./admin-sidebar"
import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"

interface AdminShellProps {
    children: ReactNode
}

export function AdminShell({ children }: AdminShellProps) {
    const { data: session, status } = useSession()

    if (status === "loading") {
        return (
            <div className="flex h-screen items-center justify-center bg-zinc-50">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
            </div>
        )
    }

    // Protection logic - in a real app, you'd check session.user.role
    if (!session) {
        redirect("/login")
    }

    return (
        <div className="flex h-screen w-full bg-zinc-50 text-zinc-900 selection:bg-amber-500/30 overflow-hidden">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 z-40 h-full w-64 border-r border-zinc-200 bg-zinc-900 hidden lg:block">
                <AdminSidebar />
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-full lg:pl-64">
                <header className="h-16 border-b border-zinc-200 bg-white flex items-center px-8 shrink-0">
                    <h1 className="text-sm font-semibold text-zinc-800 uppercase tracking-wider">System Administration</h1>
                </header>
                
                <main className="flex-1 overflow-y-auto p-8 lg:p-10 animate-in fade-in duration-500">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
