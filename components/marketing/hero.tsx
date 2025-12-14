"use client";

import { motion } from "framer-motion";
import { ShinyButton } from "@/components/ui/shiny-button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function Hero() {
    return (
        <div className="relative isolate overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
                <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8 text-center lg:text-left">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mt-24 sm:mt-32 lg:mt-16"
                    >
                        <div className="inline-flex items-center gap-x-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-semibold leading-6 text-primary ring-1 ring-inset ring-primary/20">
                            <span className="flex items-center gap-1">
                                Latest Version v2.0 <ArrowRight className="h-4 w-4" />
                            </span>
                        </div>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mt-10 text-4xl font-bold tracking-tight text-foreground sm:text-6xl"
                    >
                        Analytics that
                        <span className="text-primary"> empower </span>
                        your business
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mt-6 text-lg leading-8 text-muted-foreground"
                    >
                        Gain deep insights into your audience with our state-of-the-art dashboard. Real-time data, predictive modeling, and seamless integration.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="mt-10 flex items-center justify-center lg:justify-start gap-x-6"
                    >
                        <Link href="/login">
                            <ShinyButton className="h-12 px-8">Get Started</ShinyButton>
                        </Link>
                        <Link
                            href="#features"
                            className="text-sm font-semibold leading-6 text-foreground hover:text-primary transition-colors"
                        >
                            Learn more <span aria-hidden="true">→</span>
                        </Link>
                    </motion.div>
                </div>
                <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mt-0 lg:mr-0 lg:max-w-none lg:flex-none xl:ml-32">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none"
                    >
                        <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 dark:bg-gray-100/10 dark:ring-gray-100/20 lg:-m-4 lg:rounded-2xl lg:p-4">
                            <img
                                src="https://tailwindui.com/img/component-images/dark-project-app-screenshot.png"
                                alt="App screenshot"
                                width={2432}
                                height={1442}
                                className="w-[76rem] rounded-md shadow-2xl ring-1 ring-gray-900/10 dark:ring-gray-100/20"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
