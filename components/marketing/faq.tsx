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
        question: "What is GA4 (Google Analytics 4)?",
        answer: "GA4 is the latest version of Google Analytics, designed to track user data across websites and apps. Unlike Universal Analytics, it uses an event-based model to provide better insights into user lifecycle and engagement.",
    },
    {
        question: "How do I set up Google Analytics for my website?",
        answer: "Setting up GA4 involves creating a property in your Google Analytics account, installing the tracking tag (G-ID) on your site, and configuring your data stream. Helpful Analytics makes this process easier by visualizing your data instantly once connected.",
    },
    {
        question: "Is there a good Google Analytics alternative?",
        answer: "Yes! While GA4 is powerful, many find it complex. Helpful Analytics serves as a perfect companion or alternative dashboard that simplifies your GA4 data, making it easier to read and understand without losing the depth of Google's tracking.",
    },
    {
        question: "How do I read Google Analytics reports?",
        answer: "Reading GA4 reports can be tricky. You need to understand metrics like 'Engagement Rate', 'Events', and 'User Acquisition'. Our dashboard translates these complex metrics into simple, actionable insights so you don't have to be a data scientist to understand your traffic.",
    },
    {
        question: "What is the difference between Universal Analytics and GA4?",
        answer: "The main difference is the data model. Universal Analytics was session-based, while Google Analytics 4 (GA4) is event-based. GA4 also offers better cross-platform tracking and more focus on user privacy.",
    },
    {
        question: "Can I use Google Analytics for small business?",
        answer: "Absolutely. Google Analytics is essential for small businesses to understand customer behavior. However, the default interface can be overwhelming. Helpful Analytics is specifically designed to help small business owners view their key metrics at a glance.",
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
