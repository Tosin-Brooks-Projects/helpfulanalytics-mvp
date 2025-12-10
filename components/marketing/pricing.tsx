"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { TextReveal } from "@/components/ui/text-reveal"

export function Pricing() {
    const ref = useRef(null)
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    })

    // Parallax for cards
    const y1 = useTransform(scrollYProgress, [0, 1], [100, -100])
    const y2 = useTransform(scrollYProgress, [0, 1], [0, 0]) // Middle card stays relative
    const y3 = useTransform(scrollYProgress, [0, 1], [100, -100])

    return (
        <section id="pricing" className="bg-[#f0f4f8] py-24 overflow-hidden" ref={ref}>
            <div className="container">
                <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-16">
                    <TextReveal
                        text="Simple Pricing"
                        className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl text-slate-800 justify-center"
                    />
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="max-w-[85%] leading-normal text-slate-600 sm:text-lg sm:leading-7"
                    >
                        Start for free, upgrade as you grow.
                    </motion.p>
                </div>

                <div className="grid w-full items-start gap-8 rounded-3xl bg-[#f0f4f8] p-10 md:grid-cols-[1fr_200px] lg:grid-cols-3 xl:grid-cols-3 shadow-[inset_10px_10px_20px_#d1d9e6,inset_-10px_-10px_20px_#ffffff] border border-white/50">
                    <div className="grid gap-6">
                        <h3 className="text-2xl font-bold text-slate-800">
                            What&apos;s included in the PRO plan
                        </h3>
                        <ul className="grid gap-4 text-sm text-slate-600 sm:grid-cols-2">
                            {[
                                "Unlimited Websites",
                                "100% Data Ownership",
                                "Email Reports",
                                "Custom Events",
                                "API Access",
                                "Priority Support"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center">
                                    <div className="mr-3 flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                                        <Check className="h-4 w-4" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex flex-col gap-6 text-center lg:col-span-2">
                        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                            {/* Hobby */}
                            <motion.div
                                style={{ y: y1 }}
                                className="rounded-3xl bg-[#f0f4f8] p-8 shadow-[10px_10px_20px_#d1d9e6,-10px_-10px_20px_#ffffff] border border-white/50"
                            >
                                <div className="space-y-2">
                                    <h3 className="font-bold text-slate-800">Hobby</h3>
                                    <p className="text-4xl font-bold text-slate-900">$0<span className="text-sm font-normal text-slate-500">/mo</span></p>
                                    <p className="text-xs text-slate-500">Up to 5k pageviews</p>
                                </div>
                                <Button className="w-full mt-6 rounded-xl bg-white text-slate-700 shadow-[5px_5px_10px_#d1d9e6,-5px_-5px_10px_#ffffff] hover:shadow-[inset_5px_5px_10px_#d1d9e6,inset_-5px_-5px_10px_#ffffff] border-none" variant="outline" asChild>
                                    <Link href="/login">Get Started</Link>
                                </Button>
                            </motion.div>

                            {/* Pro */}
                            <motion.div
                                style={{ y: y2 }}
                                className="relative rounded-3xl bg-indigo-600 p-8 shadow-[10px_10px_20px_rgba(79,70,229,0.3),-10px_-10px_20px_#ffffff] text-white z-10"
                            >
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-indigo-600 px-4 py-1 rounded-full text-xs font-bold shadow-md">
                                    POPULAR
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-bold text-indigo-100">Pro</h3>
                                    <p className="text-4xl font-bold">$9<span className="text-sm font-normal text-indigo-200">/mo</span></p>
                                    <p className="text-xs text-indigo-200">Up to 100k pageviews</p>
                                </div>
                                <Button className="w-full mt-6 rounded-xl bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg border-none" asChild>
                                    <Link href="/login">Start Trial</Link>
                                </Button>
                            </motion.div>

                            {/* Business */}
                            <motion.div
                                style={{ y: y3 }}
                                className="rounded-3xl bg-[#f0f4f8] p-8 shadow-[10px_10px_20px_#d1d9e6,-10px_-10px_20px_#ffffff] border border-white/50"
                            >
                                <div className="space-y-2">
                                    <h3 className="font-bold text-slate-800">Business</h3>
                                    <p className="text-4xl font-bold text-slate-900">$49<span className="text-sm font-normal text-slate-500">/mo</span></p>
                                    <p className="text-xs text-slate-500">Up to 1M pageviews</p>
                                </div>
                                <Button className="w-full mt-6 rounded-xl bg-white text-slate-700 shadow-[5px_5px_10px_#d1d9e6,-5px_-5px_10px_#ffffff] hover:shadow-[inset_5px_5px_10px_#d1d9e6,inset_-5px_-5px_10px_#ffffff] border-none" variant="outline" asChild>
                                    <Link href="/login">Contact Us</Link>
                                </Button>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
