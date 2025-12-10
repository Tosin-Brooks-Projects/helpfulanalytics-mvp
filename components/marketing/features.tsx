"use client"

import { BarChart3, Lock, Zap, MousePointer2 } from "lucide-react"
import { motion, useScroll, useTransform, useVelocity, useSpring } from "framer-motion"
import { useRef } from "react"
import { TextReveal } from "@/components/ui/text-reveal"

const features = [
    {
        title: "Privacy First",
        description: "No IP tracking, no cookies, no fingerprinting. Compliant with GDPR, CCPA, and PECR.",
        icon: Lock,
        color: "text-blue-500",
        bg: "bg-blue-50",
        delay: 0.1
    },
    {
        title: "Real-time Events",
        description: "See who is on your site right now. Watch visitors navigate in real-time.",
        icon: Zap,
        color: "text-yellow-500",
        bg: "bg-yellow-50",
        delay: 0.2
    },
    {
        title: "Simple Reports",
        description: "Top pages, referrers, and devices. All the metrics you care about in one view.",
        icon: BarChart3,
        color: "text-purple-500",
        bg: "bg-purple-50",
        delay: 0.3
    }
]

export function Features() {
    const containerRef = useRef(null)
    const { scrollY } = useScroll()
    const scrollVelocity = useVelocity(scrollY)
    const smoothVelocity = useSpring(scrollVelocity, {
        damping: 50,
        stiffness: 400
    })

    // Skew based on velocity
    const skewX = useTransform(smoothVelocity, [-1000, 1000], [-2, 2])
    const skewY = useTransform(smoothVelocity, [-1000, 1000], [-1, 1])

    return (
        <section id="features" className="bg-[#f0f4f8] py-24 relative overflow-hidden">
            <div className="container relative z-10" ref={containerRef}>
                <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center mb-16">
                    <TextReveal
                        text="Features that matter"
                        className="font-bold text-3xl leading-[1.1] sm:text-3xl md:text-5xl text-slate-800 justify-center"
                    />
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="max-w-[85%] leading-normal text-slate-600 sm:text-lg sm:leading-7"
                    >
                        Everything you need to understand your traffic, without the bloat.
                    </motion.p>
                </div>

                <motion.div
                    style={{ skewX, skewY }}
                    className="mx-auto grid justify-center gap-8 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3 origin-center"
                >
                    {features.map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: feature.delay, duration: 0.5 }}
                            whileHover={{ y: -10, scale: 1.02 }}
                            className="relative overflow-hidden rounded-3xl bg-[#f0f4f8] p-8 shadow-[10px_10px_20px_#d1d9e6,-10px_-10px_20px_#ffffff] border border-white/50"
                        >
                            <div className="flex flex-col justify-between h-full">
                                <div className={`mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl ${feature.bg} shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_#ffffff]`}>
                                    <feature.icon className={`h-7 w-7 ${feature.color}`} />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="font-bold text-xl text-slate-800">{feature.title}</h3>
                                    <p className="text-sm text-slate-600 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4 }}
                        className="relative overflow-hidden rounded-3xl bg-[#f0f4f8] p-8 shadow-[10px_10px_20px_#d1d9e6,-10px_-10px_20px_#ffffff] border border-white/50 sm:col-span-2 md:col-span-3"
                    >
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="flex-1 space-y-4">
                                <h3 className="text-2xl font-bold text-slate-800">Lightweight Script</h3>
                                <p className="text-slate-600 leading-relaxed">
                                    Our script is less than 1kb. It won't slow down your site or affect your Core Web Vitals.
                                    Just copy and paste one line of code.
                                </p>
                            </div>
                            <div className="flex-1 w-full">
                                <div className="rounded-2xl bg-slate-800 p-6 shadow-inner font-mono text-sm overflow-x-auto text-slate-300">
                                    <span className="text-blue-400">&lt;script</span> <span className="text-purple-400">defer</span> <span className="text-purple-400">data-domain</span>=<span className="text-green-400">"yourdomain.com"</span> <span className="text-purple-400">src</span>=<span className="text-green-400">"https://helpfulanalytics.com/script.js"</span><span className="text-blue-400">&gt;&lt;/script&gt;</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}
