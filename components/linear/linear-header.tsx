"use client"

import { Bell } from "lucide-react"
import Link from "next/link"
import { useDashboard } from "@/components/linear/dashboard-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function LinearHeader() {
    const { properties, selectedProperty, setSelectedProperty, loading } = useDashboard()

    return (
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/5 bg-[#09090b]/80 px-4 pl-14 lg:px-10 backdrop-blur-xl">
            <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center text-sm text-zinc-500">
                    <span className="text-zinc-300">Dashboard</span>
                    <span className="mx-2">/</span>
                    <span>Overview</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {!loading && properties.length > 0 && (
                    <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                        <SelectTrigger className="h-8 w-[140px] md:w-[180px] border-white/10 bg-white/5 text-xs text-zinc-300 focus:ring-0">
                            <SelectValue placeholder="Select Property" />
                        </SelectTrigger>
                        <SelectContent className="border-white/10 bg-[#09090b] text-zinc-300">
                            {properties.map((prop) => (
                                <SelectItem key={prop.propertyId} value={prop.propertyId} className="text-xs focus:bg-white/10 focus:text-zinc-100">
                                    {prop.displayName}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}

                <Link href="/dashboard/notifications" className="text-zinc-500 hover:text-zinc-300 transition-colors">
                    <Bell className="h-4 w-4" />
                </Link>
                <Link href="/dashboard/profile">
                    <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 ring-2 ring-[#09090b] cursor-pointer hover:ring-indigo-500/50 transition-all" />
                </Link>
            </div>
        </header>
    )
}
