"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BarChart3, Zap, Users, ArrowUpRight, Clock } from "lucide-react";

export function Features() {
    return (
        <section id="features" className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mx-auto max-w-2xl text-center"
                >
                    <h2 className="text-base font-semibold leading-7 text-primary">
                        What you get
                    </h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        GA4 data you can actually use
                    </p>
                    <p className="mt-4 text-base leading-7 text-muted-foreground max-w-xl mx-auto">
                        No migration, no new tracking code, no learning curve. Just connect and go.
                    </p>
                </motion.div>

                {/* Asymmetric feature grid */}
                <div className="mx-auto mt-16 sm:mt-20 lg:max-w-none">
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_3fr] lg:gap-8">

                        {/* Left column — two stacked cards */}
                        <div className="flex flex-col gap-6">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: 0.05 }}
                            >
                                <Link href="/login" className="block h-full">
                                    <div className="group relative overflow-hidden rounded-2xl bg-secondary/50 p-8 ring-1 ring-inset ring-foreground/10 hover:bg-secondary/70 transition-colors duration-200 h-full">
                                        <div className="flex items-start justify-between gap-x-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10 shrink-0">
                                                <Zap className="h-5 w-5 text-amber-500" aria-hidden="true" />
                                            </div>
                                            <ArrowUpRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors duration-200 shrink-0" />
                                        </div>
                                        <h3 className="mt-5 text-lg font-semibold leading-6 text-foreground group-hover:text-primary transition-colors duration-200">
                                            Zero migration
                                        </h3>
                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                            Connect your existing GA4 in 60 seconds. No tracking code changes, no data loss.
                                        </p>
                                        <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground/70">
                                            <Clock className="h-3.5 w-3.5" />
                                            <span>60-second setup</span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: 0.1 }}
                            >
                                <Link href="/login" className="block h-full">
                                    <div className="group relative overflow-hidden rounded-2xl bg-secondary/50 p-8 ring-1 ring-inset ring-foreground/10 hover:bg-secondary/70 transition-colors duration-200 h-full">
                                        <div className="flex items-start justify-between gap-x-4">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 shrink-0">
                                                <BarChart3 className="h-5 w-5 text-blue-500" aria-hidden="true" />
                                            </div>
                                            <ArrowUpRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors duration-200 shrink-0" />
                                        </div>
                                        <h3 className="mt-5 text-lg font-semibold leading-6 text-foreground group-hover:text-primary transition-colors duration-200">
                                            Plain English insights
                                        </h3>
                                        <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                            Bounce rate, sessions, sources — explained so you can act on them, not just stare at them.
                                        </p>
                                    </div>
                                </Link>
                            </motion.div>
                        </div>

                        {/* Right column — tall highlight card */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: 0.15 }}
                            className="lg:row-span-2"
                        >
                            <Link href="/login" className="block h-full">
                                <div className="group relative overflow-hidden rounded-2xl bg-primary/5 p-8 ring-1 ring-inset ring-primary/15 hover:bg-primary/8 transition-colors duration-200 h-full min-h-[320px] lg:min-h-0">
                                    <div className="flex items-start justify-between gap-x-4">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                                            <Users className="h-5 w-5 text-primary" aria-hidden="true" />
                                        </div>
                                        <ArrowUpRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors duration-200 shrink-0" />
                                    </div>
                                    <h3 className="mt-5 text-xl font-semibold leading-7 text-foreground group-hover:text-primary transition-colors duration-200">
                                        Built for business owners, not analysts
                                    </h3>
                                    <p className="mt-3 text-sm leading-7 text-muted-foreground">
                                        GA4 was designed for data teams. We built Helpful Analytics for the person running the business — the founder, the marketer, the solo operator who just needs to know what&apos;s working.
                                    </p>
                                    <p className="mt-4 text-sm leading-7 text-muted-foreground">
                                        No custom reports. No segment builders. Just the answers to the questions you actually have: Where is my traffic coming from? What pages are people leaving? Is this week better than last week?
                                    </p>
                                    <div className="mt-8 space-y-2">
                                        {["No jargon or technical terms", "Works alongside GA4, not instead of it", "Cancel anytime — your GA4 data stays yours"].map((point) => (
                                            <div key={point} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                                {point}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
