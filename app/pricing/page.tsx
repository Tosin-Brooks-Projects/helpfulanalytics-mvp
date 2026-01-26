import { Metadata } from "next"
import { PricingPageContent } from "@/components/marketing/pricing-page-content"

export const metadata: Metadata = {
    title: "Pricing - Helpful Analytics",
    description: "Simple pricing for analytics that just works. Start for free.",
    openGraph: {
        title: "Pricing - Helpful Analytics",
        description: "Simple pricing for analytics that just works. Start for free.",
    }
}

export default function PricingPage() {
    return <PricingPageContent />
}
