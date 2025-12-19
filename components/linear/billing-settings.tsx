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
    const [isAnnual, setIsAnnual] = useState(false)

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
                    <h3 className="text-lg font-bold text-zinc-900">Subscription Plans</h3>
                    <p className="text-sm text-zinc-500">Upgrade to unlock more properties and features. Save 20% with annual billing.</p>
                </div>
                {/* Billing Toggle */}
                <div className="flex items-center gap-3 bg-zinc-100 p-1 rounded-lg border border-zinc-200">
                    <button
                        onClick={() => setIsAnnual(false)}
                        className={cn(
                            "px-3 py-1 text-xs font-medium rounded-md transition-all",
                            !isAnnual ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                        )}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setIsAnnual(true)}
                        className={cn(
                            "px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5",
                            isAnnual ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
                        )}
                    >
                        Annual
                        <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-1 rounded">-20%</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                {pricingData.map((tier) => {
                    const priceId = isAnnual ? tier.priceIdYearly : tier.priceIdMonthly
                    const price = isAnnual ? tier.priceYearly : tier.priceMonthly
                    const isCurrent = subscription?.stripePriceId === priceId || (subscription?.tier?.toLowerCase() === tier.title.toLowerCase() && !subscription.stripePriceId)

                    return (
                        <div
                            key={tier.title}
                            className={cn(
                                "flex flex-col justify-between rounded-xl border p-6 transition-all",
                                isCurrent
                                    ? "border-amber-500/50 bg-amber-50/50 shadow-sm"
                                    : "border-zinc-200 bg-white hover:border-zinc-300 shadow-sm"
                            )}
                        >
                            <div>
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-zinc-900">{tier.title}</h4>
                                    {isCurrent && (
                                        <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-amber-400">
                                            <Star className="h-3 w-3 fill-current" /> Current
                                        </span>
                                    )}
                                </div>
                                <div className="mt-2 flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-zinc-900">{price}</span>
                                    {!tier.isCustom && <span className="text-sm text-zinc-500">/{isAnnual ? 'yr' : 'mo'}</span>}
                                </div>
                                <ul className="mt-4 space-y-2">
                                    {tier.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-2 text-xs text-zinc-600">
                                            <Check className="h-3.5 w-3.5 shrink-0 text-amber-500" />
                                            {feature}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="mt-6">
                                {isCurrent ? (
                                    <button
                                        disabled
                                        className="w-full rounded-md border border-amber-500/20 bg-amber-500/10 py-2 text-xs font-semibold text-amber-600 cursor-default"
                                    >
                                        Current Plan
                                    </button>
                                ) : (
                                    <ShinyButton
                                        onClick={() => handleSubscribe(priceId, tier.isCustom || false)}
                                        disabled={!!isLoading}
                                        className="w-full py-2 text-xs"
                                    >
                                        {isLoading === priceId ? "Processing..." : tier.isCustom ? "Contact Sales" : "Upgrade"}
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
