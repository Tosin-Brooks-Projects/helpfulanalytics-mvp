"use client"

import { Navbar } from "@/components/marketing/navbar"
import { Hero } from "@/components/marketing/hero"
import { StatsBar } from "@/components/marketing/stats-bar"
import { Pain } from "@/components/marketing/pain"
import { HowItWorks } from "@/components/marketing/how-it-works"
import { Features } from "@/components/marketing/features"
import { Comparison } from "@/components/marketing/comparison"
import { Testimonials } from "@/components/marketing/testimonials"
import { Pricing } from "@/components/marketing/pricing"
import { CTA } from "@/components/marketing/cta"
import { FAQ } from "@/components/marketing/faq"
import { Footer } from "@/components/marketing/footer"
import { SmoothScroll } from "@/components/ui/smooth-scroll"

export function LandingPageContent() {
    return (
        <SmoothScroll>
            <div className="min-h-screen bg-[#f0f4f8]">
                <Navbar />
                <main>
                    <Hero />
                    <StatsBar />
                    <Pain />
                    <HowItWorks />
                    <Features />
                    <Comparison />
                    <Testimonials />
                    <Pricing />
                    <FAQ />
                    <CTA />
                </main>
                <Footer />
            </div>
        </SmoothScroll>
    )
}
