"use client"

import { useSession } from "next-auth/react"
import { Sparkles, Loader2, Zap } from "lucide-react"
import { Typewriter } from "@/components/ui/typewriter-effect"
import { useAI } from "@/components/linear/ai-context"
import { cn } from "@/lib/utils"

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
    const mainInsight = insights.find(i => i.type === "Insight")
    const quickHits = insights.filter(i => i.type !== "Insight").slice(0, 3)

    return (
        <div className="mb-8">
            <div className="space-y-1 mb-6">
                <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
                    {greeting}, {firstName}
                </h1>
                <p className="text-zinc-500 text-sm">
                    Here's what's happening with your projects today.
                </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                {/* Main Highlight Card */}
                <div className="lg:col-span-2 rounded-xl border border-zinc-200 bg-white p-5 shadow-sm transition-all hover:border-zinc-300">
                    <div className="flex items-start gap-4">
                        <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 shadow-sm shrink-0">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin text-amber-500" /> : <Sparkles className="h-4 w-4" />}
                        </div>
                        <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest px-2 py-0.5 bg-amber-50 rounded">Core Insight</span>
                                {!loading && <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />}
                            </div>
                            <div className="text-sm text-zinc-700 leading-relaxed min-h-[40px] font-medium">
                                {loading ? (
                                    <div className="space-y-2">
                                        <div className="h-3 w-3/4 bg-zinc-100 rounded animate-pulse" />
                                        <div className="h-3 w-1/2 bg-zinc-100 rounded animate-pulse" />
                                    </div>
                                ) : mainInsight ? (
                                    <Typewriter
                                        text={mainInsight.description}
                                        speed={15}
                                    />
                                ) : (
                                    <span className="text-zinc-400">No significant updates for this period.</span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Hits Desktop Grid */}
                <div className="hidden lg:flex flex-col gap-3">
                    {loading ? (
                        [...Array(2)].map((_, i) => (
                            <div key={i} className="h-[74px] rounded-xl border border-zinc-100 bg-zinc-50/50 animate-pulse" />
                        ))
                    ) : quickHits.length > 0 ? (
                        quickHits.map((hit, i) => (
                            <div key={i} className="group rounded-xl border border-zinc-200 bg-white p-3 shadow-sm flex flex-col gap-0.5 transition-all hover:border-amber-500/30 hover:shadow-md cursor-default animate-in fade-in slide-in-from-right-4 duration-500" style={{ animationDelay: `${i * 150}ms` }}>
                                <div className="flex items-center gap-2">
                                    <span className={cn("text-[9px] font-black uppercase tracking-widest",
                                        hit.type === 'Trend' ? 'text-blue-500' :
                                            hit.type === 'Suggestion' ? 'text-amber-500' :
                                                hit.type === 'Alert' ? 'text-rose-500' : 'text-zinc-500'
                                    )}>
                                        {hit.type}
                                    </span>
                                    <Zap className={cn("h-2.5 w-2.5",
                                        hit.type === 'Trend' ? 'text-blue-400' :
                                            hit.type === 'Suggestion' ? 'text-amber-400' :
                                                hit.type === 'Alert' ? 'text-rose-400' : 'text-zinc-400'
                                    )} />
                                </div>
                                <p className="text-xs font-bold text-zinc-900 group-hover:text-amber-600 transition-colors truncate">{hit.title}</p>
                                <p className="text-[10px] text-zinc-500 line-clamp-1 leading-tight">{hit.description}</p>
                            </div>
                        ))
                    ) : (
                        <div className="h-full rounded-xl border border-dashed border-zinc-200 bg-zinc-50/30 flex items-center justify-center p-4">
                            <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">Syncing Insights...</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
