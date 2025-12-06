"use client"

import { Sidebar } from "@/components/layout/sidebar"
import { cn } from "@/lib/utils"
import { BackgroundPattern } from "@/components/ui/background-pattern"

interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> { }

export function DashboardShell({ children, className, ...props }: DashboardShellProps) {
    return (
        <div className="flex min-h-screen overflow-hidden bg-background">
            <BackgroundPattern />
            <aside className="hidden md:flex">
                <Sidebar />
            </aside>
            <main className={cn("flex-1 overflow-y-auto", className)} {...props}>
                {children}
            </main>
        </div>
    )
}
