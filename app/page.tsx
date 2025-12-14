"use client"

import { Navbar } from "@/components/marketing/navbar"
import { Hero } from "@/components/marketing/hero"
import { Features } from "@/components/marketing/features"
import { Pricing } from "@/components/marketing/pricing"
import { CTA } from "@/components/marketing/cta"
import { FAQ } from "@/components/marketing/faq"
import { Footer } from "@/components/marketing/footer"
import { SmoothScroll } from "@/components/ui/smooth-scroll"

export default function LandingPage() {
    return (
        <SmoothScroll>
            <div className="min-h-screen bg-[#f0f4f8]">
                <Navbar />
                <main>
                    <Hero />
                    <Features />
                    <Pricing />
                    <FAQ />
                    <CTA />
                </main>
                <Footer />
            </div>
        </SmoothScroll>
    )
}
