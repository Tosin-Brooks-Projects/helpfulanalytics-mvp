"use client";

import { ShinyButton } from "@/components/ui/shiny-button";
import Link from "next/link";

export function CTA() {
    return (
        <section className="relative overflow-hidden py-24 sm:py-32">
            {/* Subtle reduced gradient */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_40%_at_50%_60%,hsl(var(--primary)/5%)_0%,transparent_100%)]" />
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Your GA4 Doesn't Have to Suck
                    </h2>
                    <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
                        Let’s make analytics fun again.
                        <br />
                        Connect your Google Analytics and get the clear, simple dashboard Google should have built.
                        <br />
                        See your first insights in under 60 seconds.
                    </p>
                    <div className="mt-10 flex items-center justify-center gap-x-6">
                        <Link href="/login">
                            <ShinyButton>Get Started</ShinyButton>
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
