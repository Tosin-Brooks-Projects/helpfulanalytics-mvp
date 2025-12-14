"use client";

import { Check } from "lucide-react";
import { ShinyButton } from "@/components/ui/shiny-button";

const tiers = [
    {
        name: "Starter",
        id: "tier-starter",
        href: "#",
        priceMonthly: "$29",
        description: "All the basics for starting a new business.",
        features: ["5 products", "Up to 1,000 subscribers", "Basic analytics", "48-hour support response time"],
    },
    {
        name: "Pro",
        id: "tier-pro",
        href: "#",
        priceMonthly: "$59",
        description: "Everything you need for a growing business.",
        features: [
            "25 products",
            "Up to 10,000 subscribers",
            "Advanced analytics",
            "24-hour support response time",
            "Marketing automations",
        ],
    },
    {
        name: "Enterprise",
        id: "tier-enterprise",
        href: "#",
        priceMonthly: "$149",
        description: "Advanced features for scaling your business.",
        features: [
            "Unlimited products",
            "Unlimited subscribers",
            "Custom analytics",
            "1-hour, dedicated support response time",
            "Marketing automations",
        ],
    },
];

export function Pricing() {
    return (
        <div className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <h2 className="text-base font-semibold leading-7 text-primary">Pricing</h2>
                    <p className="mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                        Pricing plans for teams of&nbsp;all&nbsp;sizes
                    </p>
                </div>
                <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3 lg:gap-x-8">
                    {tiers.map((tier, tierIdx) => (
                        <div
                            key={tier.id}
                            className={`flex flex-col justify-between rounded-3xl p-8 ring-1 ring-inset ${tierIdx === 1
                                    ? "bg-secondary/50 ring-primary/50 lg:z-10 lg:scale-105"
                                    : "bg-background ring-foreground/10"
                                }`}
                        >
                            <div>
                                <div className="flex items-center justify-between gap-x-4">
                                    <h3
                                        id={tier.id}
                                        className={`text-lg font-semibold leading-8 ${tierIdx === 1 ? "text-primary" : "text-foreground"
                                            }`}
                                    >
                                        {tier.name}
                                    </h3>
                                </div>
                                <p className="mt-4 text-sm leading-6 text-muted-foreground">{tier.description}</p>
                                <p className="mt-6 flex items-baseline gap-x-1">
                                    <span className="text-4xl font-bold tracking-tight text-foreground">{tier.priceMonthly}</span>
                                    <span className="text-sm font-semibold leading-6 text-muted-foreground">/month</span>
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
                            <ShinyButton className="mt-8 block w-full">Buy plan</ShinyButton>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
