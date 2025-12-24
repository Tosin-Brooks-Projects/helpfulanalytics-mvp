import { useState, useEffect } from "react";
import { Check, AlertCircle } from "lucide-react";
import { ShinyButton } from "@/components/ui/shiny-button";
import { pricingData } from "@/config/subscriptions";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";


export function Pricing() {
    const { data: session } = useSession()
    const [isLoading, setIsLoading] = useState<string | null>(null)
    const [isAnnual, setIsAnnual] = useState(false)
    const searchParams = useSearchParams()
    const router = useRouter()

    const reason = searchParams?.get("reason")

    useEffect(() => {
        const planId = searchParams?.get("plan")
        if (session && planId) {
            handleSubscribe(planId, false)
            // Clean up URL
            router.replace("/#pricing")
        }
    }, [session, searchParams, router])

    const handleSubscribe = async (priceId: string, isCustom: boolean) => {
        if (isCustom) {
            window.location.href = "mailto:sales@example.com?subject=Enterprise%20Inquiry"
            return
        }

        if (!session) {
            // Pass the priceId so we can resume after login
            window.location.href = `/login?callbackUrl=/pricing?plan=${priceId}`
            return
        }

        if (!priceId) {
            console.error("Price ID is missing")
            return
        }

        try {
            setIsLoading(priceId)
            const response = await fetch("/api/stripe/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    priceId,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Something went wrong")
            }

            if (data.url) {
                window.location.href = data.url
            }
        } catch (error) {
            console.error("Subscription error:", error)
        } finally {
            setIsLoading(null)
        }
    }

    return (
        <div className="py-24 sm:py-32" id="pricing">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {reason === "trial_expired" && (
                    <div className="mx-auto max-w-4xl mb-12 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start sm:items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="p-2 bg-red-100 rounded-full shrink-0">
                            <AlertCircle className="text-red-600 h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-red-900 font-bold text-lg">Your Free Trial Has Expired</h3>
                            <p className="text-red-700 text-sm mt-1">You've enjoyed your 30 days of complimentary access. Please upgrade to a paid plan below to continue using the dashboard.</p>
                        </div>
                    </div>
                )}

                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-base font-semibold leading-7 text-primary">Pricing</h2>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                        Pricing plans for teams of&nbsp;all&nbsp;sizes
                    </p>
                    <p className="mt-6 text-lg leading-8 text-muted-foreground">
                        Choose the plan that's right for you. Save 20% with annual billing.
                    </p>
                </div>

                {/* Billing Toggle */}
                <div className="mt-12 flex justify-center items-center gap-4">
                    <span className={`text-sm ${!isAnnual ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>Monthly</span>
                    <button
                        onClick={() => setIsAnnual(!isAnnual)}
                        className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-zinc-200 dark:bg-zinc-800"
                        role="switch"
                        aria-checked={isAnnual}
                    >
                        <span
                            aria-hidden="true"
                            className={`${isAnnual ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-primary shadow ring-0 transition duration-200 ease-in-out`}
                        />
                    </button>
                    <span className={`text-sm ${isAnnual ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>
                        Annual <span className="text-primary font-bold">(Save 20%)</span>
                    </span>
                </div>

                <div className="isolate mx-auto mt-12 grid max-w-md grid-cols-1 gap-y-8 sm:mt-16 lg:mx-0 lg:max-w-none lg:grid-cols-4 lg:gap-x-8">
                    {pricingData.map((tier) => {
                        const priceId = isAnnual ? tier.priceIdYearly : tier.priceIdMonthly
                        const price = isAnnual ? tier.priceYearly : tier.priceMonthly

                        return (
                            <div
                                key={tier.title}
                                className={`flex flex-col justify-between rounded-3xl p-8 ring-1 ring-inset ${tier.highlight
                                    ? "bg-secondary/50 ring-primary/50 lg:z-10 lg:scale-105"
                                    : "bg-background ring-foreground/10"
                                    }`}
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-x-4">
                                        <h3
                                            className={`text-lg font-semibold leading-8 ${tier.highlight ? "text-primary" : "text-foreground"
                                                }`}
                                        >
                                            {tier.title}
                                        </h3>
                                    </div>
                                    <p className="mt-4 text-sm leading-6 text-muted-foreground">{tier.description}</p>
                                    <p className="mt-6 flex items-baseline gap-x-1">
                                        <span className="text-4xl font-bold tracking-tight text-foreground">{price}</span>
                                        {tier.title === "Starter" && !isAnnual && (
                                            <span className="text-lg font-bold text-muted-foreground line-through decoration-amber-500/50 decoration-2 ml-1">$29</span>
                                        )}
                                        {!tier.isCustom && <span className="text-sm font-semibold leading-6 text-muted-foreground">/{isAnnual ? 'year' : 'month'}</span>}
                                    </p>
                                    <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-muted-foreground">
                                        {tier.features.map((feature) => (
                                            <li key={feature} className="flex gap-x-3">
                                                <Check className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <ShinyButton
                                    className="mt-8 block w-full"
                                    onClick={() => handleSubscribe(priceId, tier.isCustom || false)}
                                    disabled={!!isLoading}
                                >
                                    {isLoading === priceId ? "Processing..." : tier.isCustom ? "Contact Sales" : "Subscribe"}
                                </ShinyButton>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
}
