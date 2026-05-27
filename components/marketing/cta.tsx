"use client";

import { motion } from "framer-motion";
import { Clock, Shield, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

const promises = [
    { icon: Zap, text: "Connected in 60 seconds" },
    { icon: Shield, text: "Your data never leaves Google" },
    { icon: Clock, text: "30-day free trial, cancel anytime" },
];

export function CTA() {
    return (
        <section className="relative overflow-hidden bg-slate-900">
            {/* Ambient glow */}
            <div
                className="absolute inset-0 -z-10 opacity-30"
                aria-hidden="true"
                style={{
                    background:
                        "radial-gradient(ellipse 80% 60% at 50% 100%, hsl(36 100% 50% / 0.25) 0%, transparent 70%)",
                }}
            />
            {/* Subtle grid texture */}
            <div
                className="absolute inset-0 -z-10 opacity-[0.03]"
                aria-hidden="true"
                style={{
                    backgroundImage:
                        "linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)",
                    backgroundSize: "48px 48px",
                }}
            />

            <div className="mx-auto max-w-7xl px-6 lg:px-8 py-24 sm:py-32">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-12">

                    {/* Left — headline */}
                    <motion.div
                        initial={{ opacity: 0, x: -16 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="lg:max-w-xl"
                    >
                        <p className="text-sm font-semibold text-primary uppercase tracking-widest mb-4">
                            Ready to stop guessing?
                        </p>
                        <h2 className="text-4xl font-bold tracking-tight text-white sm:text-5xl leading-[1.1]">
                            Your GA4 doesn&apos;t have{" "}
                            <span className="text-primary">to suck.</span>
                        </h2>
                        <p className="mt-6 text-lg leading-8 text-slate-400 max-w-lg">
                            Connect in 60 seconds and see your analytics in plain English — the dashboard Google should have built.
                        </p>

                        {/* Promise list */}
                        <ul className="mt-8 space-y-3">
                            {promises.map(({ icon: Icon, text }) => (
                                <li key={text} className="flex items-center gap-3 text-sm text-slate-300">
                                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 shrink-0">
                                        <Icon className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
                                    </span>
                                    {text}
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Right — CTA card */}
                    <motion.div
                        initial={{ opacity: 0, x: 16 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="lg:min-w-[320px]"
                    >
                        <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-8 flex flex-col items-center text-center gap-6 backdrop-blur-sm">
                            <div>
                                <p className="text-2xl font-bold text-white">
                                    Start for free
                                </p>
                                <p className="mt-1.5 text-sm text-slate-400">
                                    No credit card required
                                </p>
                            </div>

                            <Link
                                href="/login"
                                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-primary hover:bg-primary/90 active:bg-primary/80 px-6 h-13 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/30 transition-colors duration-150"
                            >
                                Start free trial
                                <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
                            </Link>

                            <div className="w-full border-t border-white/8 pt-5 space-y-2">
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>Trial length</span>
                                    <span className="text-slate-300 font-medium">30 days</span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>Credit card</span>
                                    <span className="text-slate-300 font-medium">Not required</span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>Setup time</span>
                                    <span className="text-slate-300 font-medium">~60 seconds</span>
                                </div>
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>Cancel anytime</span>
                                    <span className="text-slate-300 font-medium">Yes, instantly</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
