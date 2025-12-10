"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Activity, PieChart } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { TextReveal } from "@/components/ui/text-reveal"

export function Hero() {
    return (
        <section className="relative overflow-hidden bg-[#f0f4f8] pt-32 pb-16 md:pt-48 md:pb-32 min-h-[120vh]">
            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-200/40 blur-3xl mix-blend-multiply animate-blob" />
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-200/40 blur-3xl mix-blend-multiply animate-blob animation-delay-2000" />
                <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] rounded-full bg-pink-200/40 blur-3xl mix-blend-multiply animate-blob animation-delay-4000" />
            </div>

            <div className="container relative z-10 flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Link
                        href="https://twitter.com/helpfulanalytics"
                        className="inline-flex items-center rounded-full bg-white px-4 py-1.5 text-sm font-medium text-slate-600 shadow-[5px_5px_10px_#d1d9e6,-5px_-5px_10px_#ffffff] hover:shadow-[inset_5px_5px_10px_#d1d9e6,inset_-5px_-5px_10px_#ffffff] transition-all"
                        target="_blank"
                    >
                        <span className="mr-2 h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                        Follow along on Twitter
                    </Link>
                </motion.div>

                <div className="mt-8 max-w-4xl flex flex-col items-center">
                    <TextReveal
                        text="Analytics that feels like magic."
                        className="text-5xl font-bold tracking-tight text-slate-800 sm:text-6xl md:text-7xl lg:text-8xl justify-center"
                    />
                </div>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="mt-6 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl"
                >
                    Stop wrestling with complex dashboards. Get the insights you need in a beautiful, privacy-friendly interface that just works.
                </motion.p>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="mt-10 flex items-center gap-x-6"
                >
                    <Button asChild size="lg" className="rounded-full bg-indigo-600 px-8 py-6 text-lg font-semibold text-white shadow-[0_10px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_15px_25px_rgba(79,70,229,0.4)] hover:-translate-y-1 transition-all duration-300">
                        <Link href="/login">
                            Get Started <ArrowRight className="ml-2 h-5 w-5" />
                        </Link>
                    </Button>
                    <Button asChild variant="ghost" size="lg" className="rounded-full text-lg font-semibold text-slate-600 hover:bg-white/50 hover:text-indigo-600">
                        <Link href="#features">
                            Live Demo
                        </Link>
                    </Button>
                </motion.div>

                {/* Floating Hero Image */}
                <div className="relative mt-20 w-full max-w-5xl perspective-1000">
                    <motion.div
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 1, delay: 0.4, type: "spring" }}
                        className="relative mx-auto rounded-3xl bg-[#f0f4f8] p-4 shadow-[20px_20px_60px_#d1d9e6,-20px_-20px_60px_#ffffff] border border-white/50"
                    >
                        <div className="rounded-2xl overflow-hidden border border-slate-100 bg-white">
                            <img
                                src="/hero-rally.png"
                                alt="Helpful Analytics Rally"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    </motion.div>

                    {/* Floating Elements */}
                    <div className="absolute -top-12 -left-12 hidden lg:block rounded-2xl bg-white p-4 shadow-[10px_10px_20px_#d1d9e6,-10px_-10px_20px_#ffffff]">
                        <Activity className="h-8 w-8 text-indigo-500" />
                    </div>
                    <div className="absolute -bottom-12 -right-12 hidden lg:block rounded-2xl bg-white p-4 shadow-[10px_10px_20px_#d1d9e6,-10px_-10px_20px_#ffffff]">
                        <PieChart className="h-8 w-8 text-purple-500" />
                    </div>
                </div>
            </div>
        </section>
    )
}
