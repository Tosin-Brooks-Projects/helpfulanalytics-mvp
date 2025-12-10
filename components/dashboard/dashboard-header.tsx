"use client"

import { usePathname } from "next/navigation"
import { Slash } from "lucide-react"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { UserNav } from "@/components/layout/user-nav" // Assuming this exists or will be created/refactored
import { ThemeToggle } from "@/components/theme-toggle" // Assuming this exists

export function DashboardHeader() {
    const pathname = usePathname()
    const segments = pathname.split("/").filter(Boolean)

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-6">
            <div className="flex flex-1 items-center justify-between">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        {segments.length > 1 && (
                            <>
                                <BreadcrumbSeparator>
                                    <Slash className="h-3 w-3" />
                                </BreadcrumbSeparator>
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="capitalize">
                                        {segments[segments.length - 1]}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </>
                        )}
                    </BreadcrumbList>
                </Breadcrumb>
                <div className="flex items-center gap-2">
                    {/* Add ThemeToggle here if available */}
                    {/* <ThemeToggle /> */}
                    {/* Placeholder for UserNav if it doesn't exist yet, or import it */}
                    <div className="h-8 w-8 rounded-full bg-muted/50" />
                </div>
            </div>
        </header>
    )
}
