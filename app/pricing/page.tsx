import { Metadata } from "next"
import { PricingPageContent } from "@/components/marketing/pricing-page-content"
import { BreadcrumbJsonLd } from "@/components/seo/json-ld"

export const metadata: Metadata = {
    title: "Pricing — Helpful Analytics",
    description: "Simple, transparent pricing for GA4 reporting. Free 30-day trial. Plans for solo marketers and agencies managing multiple clients.",
    openGraph: {
        title: "Pricing — Helpful Analytics",
        description: "Simple, transparent pricing for GA4 reporting. Free 30-day trial. Plans for solo marketers and agencies managing multiple clients.",
        url: "https://helpfulanalytics.com/pricing",
    },
    alternates: {
        canonical: "https://helpfulanalytics.com/pricing",
    },
}

export default function PricingPage() {
    return (
        <>
            <BreadcrumbJsonLd items={[
                { name: "Home", href: "/" },
                { name: "Pricing", href: "/pricing" },
            ]} />
            <PricingPageContent />
        </>
    )
}
