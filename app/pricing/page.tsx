"use client"

import { Pricing } from "@/components/marketing/pricing"
import { Navbar } from "@/components/marketing/navbar"
import { Footer } from "@/components/marketing/footer"

export default function PricingPage() {
    return (
        <main className="bg-white dark:bg-zinc-950 min-h-screen">
            <Navbar />
            <Pricing />
            <Footer />
        </main>
    )
}
