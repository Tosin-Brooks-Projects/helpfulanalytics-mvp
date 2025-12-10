"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { ReactNode } from "react"
import { MobileNav } from "@/components/layout/mobile-nav"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"

interface DashboardShellProps {
    children: ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
    return (
        <div className="flex min-h-screen flex-col bg-background lg:flex-row">
            {/* Desktop Sidebar */}
            <aside className="hidden w-64 border-r bg-muted/10 lg:block">
                <div className="flex h-14 items-center border-b px-6 font-semibold tracking-tight">
                    Analytics
                </div>
                <div className="py-4">
                    <Sidebar />
                </div>
            </aside>

            {/* Mobile Nav (Drawer) */}
            <div className="lg:hidden">
                <MobileNav />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                <DashboardHeader />
                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    <div className="mx-auto max-w-6xl space-y-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
