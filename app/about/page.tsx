"use client";

import { Navbar } from "@/components/marketing/navbar"
import { Footer } from "@/components/marketing/footer"
import { motion } from "framer-motion"
import { CheckCircle2, MessageSquare, Sparkles, TrendingUp } from "lucide-react"

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
    initial: {},
    whileInView: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

export default function AboutPage() {
    return (
        <div className="flex min-h-screen flex-col bg-white">
            <Navbar />
            <main className="flex-1 pt-32 pb-24">
                <div className="mx-auto max-w-4xl px-6 lg:px-8">
                    {/* Hero Section */}
                    <div className="text-center mb-20">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20 mb-6">
                                Our Story
                            </span>
                            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl mb-6">
                                About Helpful Analytics
                            </h1>
                            <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                                Built by a founder who was tired of wrestling with Google Analytics and decided to fix it for everyone.
                            </p>
                        </motion.div>
                    </div>

                    <div className="space-y-24">
                        {/* Intro Section */}
                        <motion.section {...fadeInUp} className="relative">
                            <div className="prose prose-lg prose-slate max-w-none">
                                <h2 className="text-3xl font-bold text-slate-900">Hi, I'm Brooks</h2>
                                <p>
                                    I'm a solopreneur who's been building businesses for over 17 years. I run everything from local newsletters to content sites, manage a YouTube channel, and juggle about 18 different projects at any given time. It's chaos, but it's the good kind.
                                </p>
                            </div>
                        </motion.section>

                        {/* The Problem Section */}
                        <motion.section {...fadeInUp} className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                            <div className="prose prose-lg prose-slate">
                                <h2 className="text-3xl font-bold text-slate-900">The Problem That Was Eating My Time</h2>
                                <p>
                                    When you're managing 18+ properties, you don't have time to click through each one individually in GA4. I was spending hours just trying to figure out what was working.
                                </p>
                                <p>
                                    The GA4 dashboard felt like it required a PhD to navigate. I'd click around trying to read data, but I still couldn't answer simple questions like "What's working?" and "What should I do next?"
                                </p>
                            </div>
                            <div className="relative">
                                <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-2xl" />
                                <div className="relative bg-white rounded-2xl border border-slate-100 shadow-xl p-8">
                                    <div className="flex gap-4 mb-6">
                                        <div className="h-3 w-3 rounded-full bg-red-400" />
                                        <div className="h-3 w-3 rounded-full bg-yellow-400" />
                                        <div className="h-3 w-3 rounded-full bg-green-400" />
                                    </div>
                                    <div className="space-y-4">
                                        <div className="h-4 bg-slate-100 rounded w-3/4 animate-pulse" />
                                        <div className="h-20 bg-slate-50 rounded animate-pulse" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="h-12 bg-slate-100 rounded animate-pulse" />
                                            <div className="h-12 bg-slate-100 rounded animate-pulse" />
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-6 text-center italic font-medium">Standard GA4 complexity...</p>
                                </div>
                            </div>
                        </motion.section>

                        {/* Agency realization */}
                        <motion.section {...fadeInUp} className="bg-slate-900 rounded-[2.5rem] p-12 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-primary/20 blur-[80px]" />
                            <div className="relative z-10 max-w-2xl">
                                <h2 className="text-3xl font-bold mb-6 text-white">Then I Realized: Agencies Have It Even Worse</h2>
                                <p className="text-slate-300 text-lg leading-relaxed mb-6">
                                    If managing 18 properties was driving me crazy, imagine what marketing agencies managing 20+ client accounts were going through. Hours spent each week just trying to explain Google Analytics metrics to clients who don't speak "analytics."
                                </p>
                                <div className="flex items-center gap-4 text-primary font-medium">
                                    <MessageSquare className="w-5 h-5 text-primary" />
                                    <span>"Why is our traffic down?" - Every client, every Monday.</span>
                                </div>
                            </div>
                        </motion.section>

                        {/* The Solution */}
                        <motion.section {...fadeInUp} className="space-y-12">
                            <div className="prose prose-lg prose-slate max-w-none text-center">
                                <h2 className="text-3xl font-bold text-slate-900">So I Built Something That Actually Works</h2>
                                <p className="max-w-3xl mx-auto">
                                    I built a Google Analytics alternative that didn't require me to abandon years of historical data. Something that worked <strong>with</strong> GA4, not against it.
                                </p>
                            </div>

                            <motion.div
                                variants={staggerContainer}
                                initial="initial"
                                whileInView="whileInView"
                                viewport={{ once: true }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                            >
                                {[
                                    { icon: TrendingUp, title: "Centralized View", desc: "All properties in one place" },
                                    { icon: Sparkles, title: "AI Insights", desc: "Plain English suggestions" },
                                    { icon: CheckCircle2, title: "PDF Reports", desc: "Client-ready in seconds" },
                                    { icon: Sparkles, title: "Time Saved", desc: "10+ hours per week" }
                                ].map((item, i) => (
                                    <motion.div
                                        key={i}
                                        variants={fadeInUp}
                                        className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <item.icon className="w-8 h-8 text-primary mb-4" />
                                        <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                                        <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                                    </motion.div>
                                ))}
                            </motion.div>
                        </motion.section>

                        {/* Final Signature */}
                        <motion.section {...fadeInUp} className="text-center pt-12 border-t border-slate-100">
                            <div className="prose prose-lg prose-slate max-w-none mb-12">
                                <h2 className="text-3xl font-bold text-slate-900">Let's Stay Connected</h2>
                                <p>
                                    I'm building this in public and sharing the journey. You can find me on Twitter/X at <a href="https://x.com/brooksconkle" className="text-primary hover:underline font-bold tracking-tight">@brooksconkle</a>.
                                </p>
                            </div>

                            <div className="inline-flex flex-col items-center">
                                <div className="h-1 bg-primary w-12 mb-6 rounded-full" />
                                <p className="text-xl font-bold text-slate-900 mb-1 tracking-tight">Brooks Conkle</p>
                                <p className="text-slate-500 uppercase tracking-widest text-[0.65rem] font-bold">Founder, Kea Marketing LLC</p>
                                <p className="text-slate-400 text-xs mt-1">Mobile, Alabama</p>
                            </div>
                        </motion.section>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}
