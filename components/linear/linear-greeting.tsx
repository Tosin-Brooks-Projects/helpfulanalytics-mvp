"use client"

import { useSession } from "next-auth/react"
import { Sparkles, Loader2 } from "lucide-react"
import { Typewriter } from "@/components/ui/typewriter-effect"
import { useAI } from "@/components/linear/ai-context"

export function LinearGreeting() {
    const { data: session } = useSession()
    const { insights, loading } = useAI()
    const user = session?.user

    // Get time of day
    const hour = new Date().getHours()
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening"

    // Get first name
    const firstName = user?.name?.split(" ")[0] || "there"

    // Find greeting insight
    const insight = insights.find(i => i.type === "Insight")?.description


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
                        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-indigo-400 uppercase tracking-wider">AI Summary</span>
                            {!loading && <span className="h-1 w-1 rounded-full bg-indigo-500 animate-pulse" />}
                        </div>
                        <div className="text-sm text-zinc-300 leading-relaxed max-w-3xl min-h-[20px]">
                            {loading ? (
                                <span className="text-zinc-500">Analyzing your metrics...</span>
                            ) : insight ? (
                                <Typewriter
                                    text={insight}
                                    speed={20}
                                />
                            ) : (
                                <span className="text-zinc-500">No significant updates for this period.</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
