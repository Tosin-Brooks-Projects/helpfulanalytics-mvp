import { Metadata } from "next"
import { LandingPageContent } from "@/components/marketing/landing-page-content"
import { WebsiteJsonLd, SoftwareAppJsonLd } from "@/components/seo/json-ld"

export const metadata: Metadata = {
    title: "Helpful Analytics — Simple GA4 Reporting for Marketing Agencies",
    description: "The GA4 dashboard built for marketing agencies. Simple client reporting, multi-property management, and white-label dashboards — without the GA4 complexity.",
    openGraph: {
        title: "Helpful Analytics — Simple GA4 Reporting for Marketing Agencies",
        description: "The GA4 dashboard built for marketing agencies. Simple client reporting, multi-property management, and white-label dashboards — without the GA4 complexity.",
        url: "https://helpfulanalytics.com",
        type: "website",
    },
    alternates: {
        canonical: "https://helpfulanalytics.com",
    },
}

export default function LandingPage() {
    return (
        <>
            <WebsiteJsonLd />
            <SoftwareAppJsonLd />
            <LandingPageContent />
        </>
    )
}
