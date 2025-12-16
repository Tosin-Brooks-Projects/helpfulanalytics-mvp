"use client"

import { useState } from "react"
import { Check, Star } from "lucide-react"
import { ShinyButton } from "@/components/ui/shiny-button"
import { pricingData } from "@/config/subscriptions"
import { useDashboard } from "./dashboard-context"
import { cn } from "@/lib/utils"

export function BillingSettings() {
    const { subscription } = useDashboard()
    const [isLoading, setIsLoading] = useState<string | null>(null)

    const handleSubscribe = async (priceId: string, isCustom: boolean) => {
        if (isCustom) {
            window.location.href = "mailto:sales@example.com?subject=Enterprise%20Inquiry"
            return
        }

        if (!priceId) return

        try {
            setIsLoading(priceId)
            const response = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ priceId }),
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error)
            if (data.url) window.location.href = data.url
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(null)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-zinc-100">Subscription Plans</h3>
                    <p className="text-sm text-zinc-400">Upgrade to unlock more properties and features.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {pricingData.map((tier) => {
                    const isCurrent = subscription?.tier?.toLowerCase() === tier.title.toLowerCase()

                    return (
                        <div
                            key={tier.title}
                            className={cn(
                                "flex flex-col justify-between rounded-xl border p-6 transition-all",
                                isCurrent
                                    ? "border-indigo-500/50 bg-indigo-500/5 shadow-[0_0_20px_-12px_rgba(99,102,241,0.5)]"
                                    : "border-white/5 bg-white/5 hover:border-white/10"
                            )}
                        >
                            <div>
                                <div className="flex items-center justify-between">
                                    <h4 className="font-medium text-zinc-100">{tier.title}</h4>
                                    {isCurrent && (
                                        <span className="flex items-center gap-1 rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-medium text-indigo-400">
                                            <Star className="h-3 w-3 fill-current" /> Current
                                        </span>
                                    )}
                                </div>
                                <div className="mt-2 flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-zinc-100">{tier.price}</span>
                                    {!tier.isCustom && <span className="text-sm text-zinc-500">/mo</span>}
                                </div>
                                <ul className="mt-4 space-y-2">
                                    {tier.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-2 text-xs text-zinc-400">
                                            <Check className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-6">
                                {isCurrent ? (
                                    <button
                                        disabled
                                        className="w-full rounded-md border border-indigo-500/30 bg-indigo-500/10 py-2 text-xs font-medium text-indigo-400 cursor-default"
                                    >
                                        Current Plan
                                    </button>
                                ) : (
                                    <ShinyButton
                                        onClick={() => handleSubscribe(tier.priceId, tier.isCustom || false)}
                                        disabled={!!isLoading}
                                        className="w-full py-2 text-xs"
                                    >
                                        {isLoading === tier.priceId ? "Processing..." : tier.isCustom ? "Contact Sales" : "Upgrade"}
                                    </ShinyButton>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
