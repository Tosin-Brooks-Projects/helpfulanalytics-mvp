"use client"

import { useSession } from "next-auth/react"
import { Sparkles } from "lucide-react"
import { Typewriter } from "@/components/ui/typewriter-effect"

export function LinearGreeting() {
    const { data: session } = useSession()
    const user = session?.user

    // Get time of day
    const hour = new Date().getHours()
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

    // Get first name
    const firstName = user?.name?.split(" ")[0] || "there"

    return (
        <div className="flex flex-col gap-4 mb-8">
            <div className="space-y-1">
                <h1 className="text-3xl font-medium tracking-tight text-zinc-100">
                    {greeting}, {firstName}
                </h1>
                <p className="text-zinc-400">
                    Here's what's happening with your projects today.
                </p>
            </div>

            <div className="rounded-lg border border-white/5 bg-white/[0.02] p-4 backdrop-blur-sm">
                <div className="flex items-start gap-3">
                    <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                        <Sparkles className="h-3.5 w-3.5" />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">AI Summary</span>
                            <span className="h-1 w-1 rounded-full bg-indigo-500 animate-pulse" />
                        </div>
                        <div className="text-sm text-zinc-300 leading-relaxed max-w-3xl">
                            <Typewriter
                                text="Traffic is trending upward (+12% vs last week). Your 'Getting Started' guide is performing exceptionally well, driving 25% of new signups today. Consider promoting it on social channels to maintain momentum."
                                speed={20}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
