"use client"
import { useState } from "react"
import { Sparkles, Bot, Loader2 } from "lucide-react"
import { Typewriter } from "@/components/ui/typewriter-effect"
import { useAI } from "@/components/linear/ai-context"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

export function LinearAIPanel() {
    const { insights, loading, error } = useAI()
    const [selectedInsight, setSelectedInsight] = useState<any | null>(null)

    const insightItem = insights.find(i => i.type === "Insight")
    const suggestionItem = insights.find(i => i.type === "Suggestion")

    return (
        <>
            <div className="h-full rounded-lg border border-zinc-200 bg-white p-5 shadow-sm flex flex-col">
                <div className="flex items-center gap-3 pb-4 border-b border-zinc-100 mb-4">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-md">
                        <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-zinc-900">
                            Analytics Companion
                        </h3>
                        <p className="text-xs text-zinc-500">Always watching your metrics</p>
                    </div>
                </div>

                <div className="flex-1 space-y-4">
                    {loading ? (
                        <div className="flex flex-col gap-4">
                            <div className="rounded-2xl bg-zinc-50 p-4 h-24 flex items-center justify-center">
                                <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
                            </div>
                            <div className="rounded-2xl bg-zinc-50 p-4 h-24 flex items-center justify-center">
                                <Loader2 className="h-5 w-5 animate-spin text-orange-500" />
                            </div>
                        </div>
                    ) : error ? (
                        <div className="rounded-2xl bg-red-50 border border-red-100 p-4 text-sm text-red-600">
                            {error === "API Key Missing" ? "Please configure GEMINI_API_KEY" : "Could not generate insights"}
                        </div>
                    ) : (
                        <>
                            {/* Insight Block */}
                            {insightItem && (
                                <div
                                    className="flex gap-3 group cursor-pointer"
                                    onClick={() => setSelectedInsight(insightItem)}
                                >
                                    <div className="space-y-1.5 w-full">
                                        <div className="rounded-2xl rounded-tl-none bg-zinc-50 p-4 text-sm text-zinc-700 leading-relaxed border border-zinc-100 transition-colors group-hover:bg-zinc-100 group-hover:border-zinc-200">
                                            <span className="block text-xs text-amber-600 mb-2 font-semibold flex items-center gap-1">
                                                <Sparkles className="h-3 w-3" /> Insight
                                            </span>
                                            <Typewriter
                                                text={insightItem.description || "Analyzing your data patterns..."}
                                                speed={15}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Suggestion Block */}
                            {suggestionItem && (
                                <div
                                    className="flex gap-3 group cursor-pointer"
                                    onClick={() => setSelectedInsight(suggestionItem)}
                                >
                                    <div className="space-y-1.5 w-full">
                                        <div className="rounded-2xl rounded-tl-none bg-zinc-50 p-4 text-sm text-zinc-700 leading-relaxed border border-zinc-100 transition-colors group-hover:bg-zinc-100 group-hover:border-zinc-200">
                                            <span className="block text-xs text-orange-600 mb-2 font-semibold flex items-center gap-1">
                                                <Bot className="h-3 w-3" /> Suggestion
                                            </span>
                                            <Typewriter
                                                text={suggestionItem.description || "Formulating recommendations..."}
                                                speed={20}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-100">
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <div className={`h-1.5 w-1.5 rounded-full ${loading ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
                        <span>{loading ? "AI is analyzing real-time data..." : "Analysis complete"}</span>
                    </div>
                </div>
            </div>

            <Dialog open={!!selectedInsight} onOpenChange={(open) => !open && setSelectedInsight(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {selectedInsight?.type === "Insight" ? <Sparkles className="h-4 w-4 text-amber-500" /> : <Bot className="h-4 w-4 text-orange-500" />}
                            {selectedInsight?.title || selectedInsight?.type}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedInsight?.description}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 text-sm text-zinc-700 leading-relaxed">
                        {selectedInsight?.content || "No detailed content available."}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
