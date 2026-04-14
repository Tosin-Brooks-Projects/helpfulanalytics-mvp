"use client"

import { LinearDashboardProvider } from "@/components/linear/dashboard-context"
import { AIProvider } from "@/components/linear/ai-context"
import { KeaChatProvider } from "@/components/linear/kea-chat-context"
import { Suspense } from "react"

export function DashboardShell({ children }: { children: React.ReactNode }) {
    return (
        <LinearDashboardProvider>
            <KeaChatProvider>
                <AIProvider>
                    <div className="min-h-screen bg-zinc-50/50 relative">
                        {/* Dot Grid Background */}
                        <div
                            className="fixed inset-0 z-0 pointer-events-none opacity-[0.35]"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='24' height='24' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='12' cy='12' r='1' fill='%23a1a1aa'/%3E%3C/svg%3E")`,
                                backgroundSize: "24px 24px",
                            }}
                        />
                        <div className="relative z-10">
                            <Suspense fallback={<div className="h-screen flex items-center justify-center animate-pulse text-zinc-400">Loading Dashboard...</div>}>
                                {children}
                            </Suspense>
                        </div>
                    </div>
                </AIProvider>
            </KeaChatProvider>
        </LinearDashboardProvider>
    )
}
