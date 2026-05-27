"use client";

import { motion } from "framer-motion";
import { Link2, LayoutDashboard, Lightbulb } from "lucide-react";

const steps = [
    {
        number: "01",
        icon: Link2,
        title: "Connect your GA4",
        description:
            'Click "Connect Google Analytics" and authorize with Google. No code, no tracking changes. Works with your existing property.',
        detail: "~60 seconds",
    },
    {
        number: "02",
        icon: LayoutDashboard,
        title: "Dashboard populates automatically",
        description:
            "We pull your data via Google's official API. Traffic, sources, bounce rate, top pages — organized and labeled the moment you connect.",
        detail: "No configuration",
    },
    {
        number: "03",
        icon: Lightbulb,
        title: "Check your insights anytime",
        description:
            "Log in and see what's happening in plain English. No segments, no custom reports — just the answers to the questions you actually have.",
        detail: "Useful from day one",
    },
];

export function HowItWorks() {
    return (
        <section className="py-24 sm:py-32 bg-slate-50">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="mx-auto max-w-2xl text-center"
                >
                    <h2 className="text-base font-semibold leading-7 text-primary">
                        Simple by design
                    </h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        Up and running in three steps
                    </p>
                </motion.div>

                {/* Horizontal steps */}
                <div className="mx-auto mt-16 max-w-5xl">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-0 relative">
                        {/* Connector line between steps — desktop only */}
                        <div
                            className="hidden lg:block absolute top-10 left-[calc(33.33%+1.5rem)] right-[calc(33.33%+1.5rem)] h-px bg-gradient-to-r from-primary/30 via-primary/15 to-primary/30"
                            aria-hidden="true"
                        />

                        {steps.map((step, index) => (
                            <motion.div
                                key={step.number}
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.45, delay: index * 0.1 }}
                                className="relative flex flex-col items-center text-center lg:px-6"
                            >
                                {/* Icon circle */}
                                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-200 shadow-sm z-10">
                                    <step.icon className="h-7 w-7 text-primary" aria-hidden="true" />
                                    {/* Step number badge */}
                                    <span className="absolute -top-2.5 -right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
                                        {index + 1}
                                    </span>
                                </div>

                                {/* Content */}
                                <h3 className="mt-6 text-lg font-semibold text-slate-900">
                                    {step.title}
                                </h3>
                                <p className="mt-2.5 text-sm leading-6 text-slate-500 max-w-xs mx-auto">
                                    {step.description}
                                </p>
                                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary/8 px-3 py-1 text-xs font-semibold text-primary">
                                    {step.detail}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
