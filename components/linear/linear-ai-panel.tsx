"use client"
// Force resolution

import { Sparkles, Bot } from "lucide-react"
import { Typewriter } from "@/components/ui/typewriter-effect"

export function LinearAIPanel() {
    return (
        <div className="h-full rounded-lg border border-white/5 bg-black/40 p-5 backdrop-blur-sm flex flex-col">
            <div className="flex items-center gap-3 pb-4 border-b border-white/5 mb-4">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                    <Bot className="h-4 w-4 text-white" />
                </div>
                <div>
                    <h3 className="text-sm font-medium text-zinc-100">
                        Analytics Companion
                    </h3>
                    <p className="text-xs text-zinc-500">Always watching your metrics</p>
                </div>
            </div>

            <div className="flex-1 space-y-4">
                <div className="flex gap-3">
                    <div className="space-y-1.5 w-full">
                        <div className="rounded-2xl rounded-tl-none bg-white/5 p-4 text-sm text-zinc-300 leading-relaxed border border-white/5">
                            <span className="block text-xs text-indigo-400 mb-2 font-medium flex items-center gap-1">
                                <Sparkles className="h-3 w-3" /> Insight
                            </span>
                            <Typewriter text="Hey! 👋 I noticed a nice spike in organic traffic today (+12%). It looks like your latest blog post is picking up steam!" speed={15} />
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <div className="space-y-1.5 w-full">
                        <div className="rounded-2xl rounded-tl-none bg-white/5 p-4 text-sm text-zinc-300 leading-relaxed border border-white/5">
                            <span className="block text-xs text-purple-400 mb-2 font-medium flex items-center gap-1">
                                <Bot className="h-3 w-3" /> Suggestion
                            </span>
                            <Typewriter text="Also, Twitter visitors are loving the site. Maybe tweet about it?" speed={20} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-3 border-t border-white/5">
                <div className="flex items-center gap-2 text-xs text-zinc-600 animate-pulse">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                    <span>AI is analyzing real-time data...</span>
                </div>
            </div>
        </div>
    )
}
