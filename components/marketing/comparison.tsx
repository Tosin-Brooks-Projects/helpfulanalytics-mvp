"use client";

import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

const rows = [
    { label: "Setup time", ga4: "Hours of configuration", ha: "60 seconds" },
    { label: "Reading your data", ga4: "Requires training or an analyst", ha: "Plain English, no experience needed" },
    { label: "Traffic sources", ga4: "Buried in Acquisition reports", ha: "On your home screen" },
    { label: "Bounce rate", ga4: "Shows 0% after the GA4 update", ha: "Accurate and explained clearly" },
    { label: "Keep using GA4", ga4: "Not applicable", ha: "Yes — works alongside it, not instead" },
    { label: "Data ownership", ga4: "Stored in Google", ha: "Stays in Google — we only read it" },
];

export function Comparison() {
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
                        Side by side
                    </h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        GA4 vs Helpful Analytics
                    </p>
                    <p className="mt-4 text-base leading-7 text-slate-500">
                        We don&apos;t replace GA4 — we make it usable.
                    </p>
                </motion.div>

                {/* ── Desktop table (md+) ── */}
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="mx-auto mt-16 max-w-3xl overflow-hidden rounded-2xl ring-1 ring-slate-200 shadow-sm hidden md:block"
                >
                    {/* Header */}
                    <div className="grid grid-cols-[1fr_1fr_1fr]">
                        <div className="bg-slate-50 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                            Feature
                        </div>
                        <div className="bg-slate-50 px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400 border-l border-slate-200">
                            GA4 alone
                        </div>
                        <div className="bg-primary px-6 py-4 text-xs font-semibold uppercase tracking-wider text-white border-l border-primary">
                            Helpful Analytics
                        </div>
                    </div>
                    {rows.map((row, index) => (
                        <div
                            key={row.label}
                            className={`grid grid-cols-[1fr_1fr_1fr] border-t border-slate-100 ${index % 2 === 0 ? "bg-white" : "bg-slate-50/50"}`}
                        >
                            <div className="px-6 py-4 text-sm font-medium text-slate-900">
                                {row.label}
                            </div>
                            <div className="px-6 py-4 text-sm text-slate-400 border-l border-slate-100 flex items-start gap-2">
                                <X className="h-4 w-4 text-slate-300 shrink-0 mt-0.5" aria-hidden="true" />
                                <span>{row.ga4}</span>
                            </div>
                            <div className="px-6 py-4 text-sm text-slate-700 border-l border-slate-100 flex items-start gap-2 bg-primary/[0.03]">
                                <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                                <span className="font-medium">{row.ha}</span>
                            </div>
                        </div>
                    ))}
                </motion.div>

                {/* ── Mobile cards (< md) ── */}
                <div className="mt-12 space-y-3 md:hidden">
                    {/* Column labels */}
                    <div className="grid grid-cols-2 gap-3 mb-1 px-1">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 text-center">
                            GA4 alone
                        </p>
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary text-center">
                            Helpful Analytics
                        </p>
                    </div>

                    {rows.map((row, index) => (
                        <motion.div
                            key={row.label}
                            initial={{ opacity: 0, y: 8 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.35, delay: index * 0.05 }}
                            className="rounded-2xl overflow-hidden ring-1 ring-slate-200 bg-white shadow-sm"
                        >
                            {/* Feature label */}
                            <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    {row.label}
                                </p>
                            </div>

                            {/* Two-col values */}
                            <div className="grid grid-cols-2 divide-x divide-slate-100">
                                <div className="flex items-start gap-2 px-4 py-4">
                                    <X className="h-4 w-4 text-slate-300 shrink-0 mt-0.5" aria-hidden="true" />
                                    <p className="text-sm text-slate-400 leading-5">{row.ga4}</p>
                                </div>
                                <div className="flex items-start gap-2 px-4 py-4 bg-primary/[0.03]">
                                    <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden="true" />
                                    <p className="text-sm text-slate-700 font-medium leading-5">{row.ha}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
