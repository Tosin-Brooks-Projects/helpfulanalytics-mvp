"use client";

import { motion } from "framer-motion";

const stats = [
    { value: "60s", label: "Average setup time" },
    { value: "0", label: "Lines of code to add" },
    { value: "30", label: "Days free trial" },
    { value: "100%", label: "Data stays in Google" },
];

export function StatsBar() {
    return (
        <section className="bg-slate-900" aria-label="Key facts">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/5">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 8 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.07 }}
                            className="flex flex-col items-center justify-center py-10 px-6 text-center"
                        >
                            <span className="text-4xl font-bold tracking-tight text-white tabular-nums">
                                {stat.value}
                            </span>
                            <span className="mt-2 text-xs font-medium uppercase tracking-widest text-slate-500">
                                {stat.label}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
