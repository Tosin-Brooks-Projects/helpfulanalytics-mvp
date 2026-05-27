"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { ArrowRight } from "lucide-react";

const VIDEO_URL =
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";

export function Hero() {
    const { data: session } = useSession();

    return (
        <section className="relative min-h-dvh overflow-hidden flex flex-col">

            {/* ── Video background ── */}
            <video
                autoPlay
                loop
                muted
                playsInline
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover z-0"
            >
                <source src={VIDEO_URL} type="video/mp4" />
            </video>

            {/* ── Scrim — just enough to read text ── */}
            <div
                className="absolute inset-0 z-[1]"
                aria-hidden="true"
                style={{
                    background:
                        "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.55) 100%)",
                }}
            />

            {/* ── Content ── */}
            <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center px-6 pt-28 pb-20 sm:pt-32 sm:pb-28">

                {/* Overline badge */}
                <div className="animate-fade-rise liquid-glass inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium text-white/80 mb-8">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" aria-hidden="true" />
                    30-day free trial · no credit card required
                </div>

                {/* Headline */}
                <h1
                    className="animate-fade-rise-delay max-w-5xl font-normal text-white leading-[1.0] tracking-[-1.5px] text-5xl sm:text-6xl md:text-7xl lg:text-8xl"
                    style={{ fontFamily: "var(--font-instrument), 'Georgia', serif" }}
                >
                    Stop wrestling with{" "}
                    <em
                        className="not-italic"
                        style={{ color: "hsl(36 100% 70%)" }}
                    >
                        Google Analytics.
                    </em>
                </h1>

                {/* Subtext */}
                <p className="animate-fade-rise-delay-2 mt-7 max-w-xl text-base sm:text-lg leading-relaxed text-white/60">
                    Connect your GA4 in 60 seconds and get the clear dashboard you&apos;ve been
                    wishing for. We don&apos;t replace it — we just make it actually useful.
                </p>

                {/* CTAs */}
                {!session && (
                    <div className="animate-fade-rise-delay-3 mt-10 flex flex-col items-center gap-4">
                        <div className="flex flex-wrap items-center justify-center gap-4">
                            <Link
                                href="/login"
                                className="group liquid-glass inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.03] active:scale-[0.98]"
                            >
                                Start free trial
                                <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
                            </Link>
                            <Link
                                href="/#features"
                                onClick={(e) => {
                                    e.preventDefault();
                                    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                                }}
                                className="text-sm font-medium text-white/50 hover:text-white/80 transition-colors duration-150"
                            >
                                See how it works <span aria-hidden="true">→</span>
                            </Link>
                        </div>

                        {/* Trust line */}
                        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-xs text-white/35">
                            <span>No credit card required</span>
                            <span className="h-3 w-px bg-white/20" aria-hidden="true" />
                            <span>30-day free trial</span>
                            <span className="h-3 w-px bg-white/20" aria-hidden="true" />
                            <span>Cancel anytime</span>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Bottom fade into stats bar ── */}
            <div
                className="absolute bottom-0 inset-x-0 h-32 z-[2] pointer-events-none"
                aria-hidden="true"
                style={{
                    background: "linear-gradient(to bottom, transparent, rgb(15 23 42))",
                }}
            />
        </section>
    );
}
