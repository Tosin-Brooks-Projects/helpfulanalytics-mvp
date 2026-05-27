"use client";

import { motion } from "framer-motion";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { Mail } from "lucide-react";

const faqs = [
    {
        question: "Do I need to replace my Google Analytics to use this?",
        answer: "Nope. We connect to your existing GA4 account — no migration, no switching, no data loss. Think of us as a companion dashboard that makes GA4 easier to read.",
    },
    {
        question: "Will this work with my current GA4 setup?",
        answer: "Yes. If you have Google Analytics 4 running on your website, our dashboard will work. We pull directly from your GA4 account through Google's official API.",
    },
    {
        question: "How long does it take to set up?",
        answer: '60 seconds. Click "Connect Google Analytics," authorize access, and your dashboard populates automatically. No code to install, no tracking changes needed.',
    },
    {
        question: "What if I still need to use the regular GA4 interface?",
        answer: "Use both. Your GA4 account stays exactly as-is. Use our dashboard for quick insights, use GA4 when you need deeper features. They work together, not against each other.",
    },
    {
        question: "Is my data secure?",
        answer: "Your analytics data never leaves Google. We read it through Google's official API to display in our dashboard. We don't store, copy, or move your data. You can revoke access anytime.",
    },
    {
        question: "What happens if I disconnect my account?",
        answer: "Your Google Analytics account continues working exactly as before. We just won't be able to show you the dashboard anymore. No data is lost, nothing changes in GA4.",
    },
    {
        question: "Can I still use GA4 for everything I use it for now?",
        answer: "Absolutely. We don't replace any GA4 functionality — we just make it easier to get insights. Your GA4 setup, tracking, and features remain unchanged.",
    },
];

export function FAQ() {
    return (
        <section className="py-24 sm:py-32 bg-slate-50">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl lg:max-w-none">
                    <div className="lg:grid lg:grid-cols-[2fr_3fr] lg:gap-16">

                        {/* Left — header + contact block */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <h2 className="text-base font-semibold leading-7 text-primary">
                                Common questions
                            </h2>
                            <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                                Everything you need to know
                            </p>
                            <p className="mt-4 text-base leading-7 text-slate-500">
                                About setup, your data, and how we work with GA4.
                            </p>

                            {/* Contact block */}
                            <div className="mt-10 rounded-2xl bg-white ring-1 ring-slate-200 p-6 shadow-sm">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                                    <Mail className="h-5 w-5 text-primary" aria-hidden="true" />
                                </div>
                                <h3 className="mt-4 text-sm font-semibold text-slate-900">
                                    Still have questions?
                                </h3>
                                <p className="mt-1.5 text-sm text-slate-500">
                                    Can&apos;t find what you&apos;re looking for? Send us a message and we&apos;ll get back to you.
                                </p>
                                <Link
                                    href="mailto:support@helpfulanalytics.com"
                                    className="mt-4 inline-flex items-center text-sm font-semibold text-primary hover:text-primary/80 transition-colors duration-150"
                                >
                                    Contact support <span aria-hidden="true" className="ml-1">→</span>
                                </Link>
                            </div>
                        </motion.div>

                        {/* Right — accordion */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.08 }}
                            className="mt-10 lg:mt-0"
                        >
                            <Accordion type="single" collapsible className="w-full">
                                {faqs.map((faq, index) => (
                                    <AccordionItem key={index} value={`item-${index}`}>
                                        <AccordionTrigger className="text-left text-sm font-medium text-slate-900 hover:text-primary transition-colors duration-150">
                                            {faq.question}
                                        </AccordionTrigger>
                                        <AccordionContent className="text-sm leading-7 text-slate-500">
                                            {faq.answer}
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
