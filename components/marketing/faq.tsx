"use client";

import { motion } from "framer-motion";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
    {
        question: "Do I need to replace my Google Analytics to use this?",
        answer: "Nope. We connect to your existing GA4 account - no migration, no switching, no data loss. Think of us as a companion dashboard that makes GA4 easier to read.",
    },
    {
        question: "Will this work with my current GA4 setup?",
        answer: "Yes. If you have Google Analytics 4 running on your website, our dashboard will work. We pull directly from your GA4 account through Google's official API.",
    },
    {
        question: "How long does it take to set up?",
        answer: "60 seconds. Click \"Connect Google Analytics,\" authorize access, and your dashboard populates automatically. No code to install, no tracking changes needed.",
    },
    {
        question: "What if I still need to use the regular GA4 interface?",
        answer: "Use both! Your GA4 account stays exactly as-is. Use our dashboard for quick insights, use GA4 when you need deeper features. They work together, not against each other.",
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
        answer: "Absolutely. We don't replace any GA4 functionality - we just make it easier to get insights. Your GA4 setup, tracking, and features remain unchanged.",
    },
];

export function FAQ() {
    return (
        <section className="py-24 sm:py-32 bg-secondary/20">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-base font-semibold leading-7 text-primary">
                        Common Questions
                    </h2>
                    <p className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                        Learn how to use Google Analytics
                    </p>
                    <p className="mt-4 text-lg leading-8 text-muted-foreground">
                        Everything you need to know about GA4, setup, and understanding your metrics.
                    </p>
                </div>
                <div className="mx-auto mt-16 max-w-2xl">
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger className="text-left font-medium">
                                    {faq.question}
                                </AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">
                                    {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            </div>
        </section>
    );
}
