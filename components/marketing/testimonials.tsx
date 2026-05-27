"use client";

import { motion } from "framer-motion";

const featured = {
    quote: "I've had GA4 connected for two years and never actually understood what I was looking at. Helpful Analytics showed me in five minutes that 70% of my traffic was leaving from my pricing page. Fixed the page, conversions went up.",
    name: "Marcus T.",
    role: "Founder, SaaS startup",
    initial: "M",
};

const secondary = [
    {
        quote: "I was paying an agency $500/month partly to interpret my analytics for me. Cancelled that retainer after the first week. The dashboard just... makes sense.",
        name: "Priya S.",
        role: "E-commerce store owner",
        initial: "P",
    },
    {
        quote: "Setup really was 60 seconds. I kept waiting for the catch. There wasn't one. My data was just there, organized, with actual labels I could read.",
        name: "James O.",
        role: "Freelance consultant",
        initial: "J",
    },
];

export function Testimonials() {
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
                        What people are saying
                    </h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                        From people who used to hate GA4
                    </p>
                </motion.div>

                <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-6 lg:grid-cols-[3fr_2fr] lg:gap-8">

                    {/* Featured testimonial — large */}
                    <motion.figure
                        initial={{ opacity: 0, y: 12 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.05 }}
                        className="relative flex flex-col justify-between rounded-2xl bg-slate-900 p-8 lg:p-10"
                    >
                        {/* Large decorative quote mark */}
                        <span
                            className="absolute top-6 right-8 text-8xl leading-none text-white/5 font-serif select-none pointer-events-none"
                            aria-hidden="true"
                        >
                            &ldquo;
                        </span>
                        <blockquote className="text-base leading-8 text-slate-300 relative z-10">
                            <p>&ldquo;{featured.quote}&rdquo;</p>
                        </blockquote>
                        <figcaption className="mt-8 flex items-center gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-white text-sm font-bold">
                                {featured.initial}
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-white">{featured.name}</div>
                                <div className="text-xs text-slate-500">{featured.role}</div>
                            </div>
                        </figcaption>
                    </motion.figure>

                    {/* Two smaller testimonials */}
                    <div className="flex flex-col gap-6">
                        {secondary.map((t, index) => (
                            <motion.figure
                                key={t.name}
                                initial={{ opacity: 0, y: 12 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.45, delay: 0.1 + index * 0.08 }}
                                className="flex flex-col justify-between rounded-2xl bg-white ring-1 ring-slate-200/80 p-6 shadow-sm"
                            >
                                <blockquote className="text-sm leading-6 text-slate-600">
                                    <p>&ldquo;{t.quote}&rdquo;</p>
                                </blockquote>
                                <figcaption className="mt-5 flex items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
                                        {t.initial}
                                    </div>
                                    <div>
                                        <div className="text-xs font-semibold text-slate-900">{t.name}</div>
                                        <div className="text-xs text-slate-400">{t.role}</div>
                                    </div>
                                </figcaption>
                            </motion.figure>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
