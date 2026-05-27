"use client";

import { motion } from "framer-motion";
import { XCircle, CheckCircle2 } from "lucide-react";

const painPoints = [
    {
        ga4: "Why is my bounce rate showing 0%?",
        ha: "Bounce rate shown clearly, with context on what's normal for your site type.",
    },
    {
        ga4: "What's the difference between sessions and engaged sessions?",
        ha: "One number — your real visits — explained in plain language.",
    },
    {
        ga4: "My traffic looks different across every report I open.",
        ha: "One source of truth. The same numbers, every time, consistently labeled.",
    },
    {
        ga4: "I can't find where my traffic is actually coming from.",
        ha: "Sources on your home screen. Search, social, direct — at a glance.",
    },
];

export function Pain() {
    return (
        <section className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mx-auto max-w-2xl text-center"
                >
                    <h2 className="text-base font-semibold leading-7 text-primary">
                        Sound familiar?
                    </h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        GA4 was built for data teams. Not you.
                    </p>
                    <p className="mt-4 text-base leading-7 text-slate-500 max-w-lg mx-auto">
                        These are real questions real business owners search every day. None of them should require a tutorial.
                    </p>
                </motion.div>

                <div className="mx-auto mt-16 max-w-5xl lg:grid lg:grid-cols-2 lg:gap-x-12">
                    {/* Left — GA4 confusion */}
                    <motion.div
                        initial={{ opacity: 0, x: -12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.05 }}
                        className="rounded-2xl bg-slate-900 p-8 mb-6 lg:mb-0"
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <div className="h-2.5 w-2.5 rounded-full bg-red-500" aria-hidden="true" />
                            <div className="h-2.5 w-2.5 rounded-full bg-yellow-400" aria-hidden="true" />
                            <div className="h-2.5 w-2.5 rounded-full bg-slate-600" aria-hidden="true" />
                            <span className="ml-2 text-xs text-slate-500 font-medium">Google Analytics 4</span>
                        </div>
                        <ul className="space-y-4">
                            {painPoints.map((point, index) => (
                                <motion.li
                                    key={index}
                                    initial={{ opacity: 0, y: 6 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.35, delay: 0.1 + index * 0.07 }}
                                    className="flex items-start gap-3"
                                >
                                    <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                                    <p className="text-sm leading-6 text-slate-300 italic">
                                        &ldquo;{point.ga4}&rdquo;
                                    </p>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Right — HA answers */}
                    <motion.div
                        initial={{ opacity: 0, x: 12 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="rounded-2xl bg-primary/5 ring-1 ring-primary/15 p-8"
                    >
                        <div className="flex items-center gap-2 mb-6">
                            <div className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true" />
                            <span className="text-xs text-primary font-medium">Helpful Analytics</span>
                        </div>
                        <ul className="space-y-4">
                            {painPoints.map((point, index) => (
                                <motion.li
                                    key={index}
                                    initial={{ opacity: 0, y: 6 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.35, delay: 0.15 + index * 0.07 }}
                                    className="flex items-start gap-3"
                                >
                                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                                    <p className="text-sm leading-6 text-slate-700">
                                        {point.ha}
                                    </p>
                                </motion.li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
