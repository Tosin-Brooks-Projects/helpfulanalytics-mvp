"use client";

import { motion } from "framer-motion";
import { BarChart3, Globe2, Zap, Shield, Users, ArrowUpRight } from "lucide-react";

const features = [
    {
        name: "Real-time Analytics",
        description: "Watch your data flow in as it happens. No delays, no caching.",
        icon: Zap,
        className: "col-span-1 md:col-span-2 lg:col-span-2",
        color: "text-[#F9AB00]", // Yellow
        bg: "bg-[#F9AB00]/10",
    },
    {
        name: "Global Coverage",
        description: "Track users from every corner of the world with precision.",
        icon: Globe2,
        className: "col-span-1 md:col-span-1 lg:col-span-1",
        color: "text-[#4285F4]", // Blue
        bg: "bg-[#4285F4]/10",
    },
    {
        name: "Advanced Security",
        description: "Enterprise-grade encryption keeps your data safe and sound.",
        icon: Shield,
        className: "col-span-1 md:col-span-1 lg:col-span-1",
        color: "text-[#34A853]", // Green
        bg: "bg-[#34A853]/10",
    },
    {
        name: "Team Collaboration",
        description: "Share insights with your team instantly. Built-in comments and roles.",
        icon: Users,
        className: "col-span-1 md:col-span-2 lg:col-span-2",
        color: "text-[#EA4335]", // Red
        bg: "bg-[#EA4335]/10",
    },
];

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
                        Everything you need
                    </h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Powerful features for modern teams
                    </p>
                </motion.div>
                <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-6 sm:mt-20 md:grid-cols-3 lg:max-w-none lg:gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.name}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            whileHover={{ y: -5 }}
                            className={`relative overflow-hidden rounded-3xl bg-secondary/50 p-8 ring-1 ring-inset ring-foreground/10 hover:bg-secondary/80 transition-colors ${feature.className}`}
                        >
                            <div className="flex items-center justify-between gap-x-4">
                                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${feature.bg}`}>
                                    <feature.icon className={`h-6 w-6 ${feature.color}`} aria-hidden="true" />
                                </div>
                                <ArrowUpRight className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="group relative">
                                <h3 className={`mt-4 text-lg font-semibold leading-6 text-foreground group-hover:${feature.color} transition-colors`}>
                                    {feature.name}
                                </h3>
                                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                    {feature.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
