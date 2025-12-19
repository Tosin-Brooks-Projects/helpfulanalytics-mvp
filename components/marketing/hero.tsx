"use client";

import { motion } from "framer-motion";
import { ShinyButton } from "@/components/ui/shiny-button";
import Link from "next/link";
import { useSession } from "next-auth/react";

export function Hero() {
    const { data: session } = useSession();

    return (
        <div className="relative isolate overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
                <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:flex-shrink-0 lg:pt-8 text-center lg:text-left">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="mt-24 sm:mt-32 lg:mt-16 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl lg:text-7xl leading-[1.1]"
                    >
                        Stop Wrestling With
                        <br />
                        <motion.span
                            animate={{
                                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                            }}
                            transition={{
                                duration: 5,
                                repeat: Infinity,
                                ease: "linear",
                            }}
                            className="bg-gradient-to-r from-primary via-[#FBBC05] to-primary bg-[length:200%_auto] bg-clip-text text-transparent inline-block pb-2"
                        >
                            Google Analytics
                        </motion.span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="mt-8 text-lg leading-8 text-slate-600 max-w-xl mx-auto lg:mx-0"
                    >
                        Connect your Google Analytics in 60 seconds and get the clear dashboard you've been wishing for. You're stuck with GA4. We get it. We don't replace it - we just make it actually useful.
                    </motion.p>
                    {!session && (
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
                                className="text-sm font-semibold leading-6 text-slate-900 hover:text-primary transition-colors"
                            >
                                Learn more <span aria-hidden="true">→</span>
                            </Link>
                        </motion.div>
                    )}
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
                                src="/dashboard-preview.png"
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
