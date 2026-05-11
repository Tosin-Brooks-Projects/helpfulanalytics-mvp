import { Metadata } from "next"
import { AboutPageContent } from "@/components/marketing/about-page-content"
import { BreadcrumbJsonLd } from "@/components/seo/json-ld"

export const metadata: Metadata = {
    title: "About — Helpful Analytics",
    description: "Built by a founder who was tired of wrestling with Google Analytics and decided to fix it for everyone. Simple GA4 reporting for marketing agencies.",
    openGraph: {
        title: "About — Helpful Analytics",
        description: "Built by a founder who was tired of wrestling with Google Analytics and decided to fix it for everyone.",
        url: "https://helpfulanalytics.com/about",
    },
    alternates: {
        canonical: "https://helpfulanalytics.com/about",
    },
}

export default function AboutPage() {
    return (
        <>
            <BreadcrumbJsonLd items={[
                { name: "Home", href: "/" },
                { name: "About", href: "/about" },
            ]} />
            <AboutPageContent />
        </>
    )
}
