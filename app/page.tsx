import { Metadata } from "next"
import { LandingPageContent } from "@/components/marketing/landing-page-content"

export const metadata: Metadata = {
    title: "Helpful Analytics - The Best Google Analytics Dashboard & GA4 Alternative",
    description: "Simple, privacy-friendly Google Analytics alternative. Understand your traffic without the confusion of GA4.",
    openGraph: {
        title: "Helpful Analytics - The Best Google Analytics Dashboard & GA4 Alternative",
        description: "Simple, privacy-friendly Google Analytics alternative. Understand your traffic without the confusion of GA4.",
    }
}

export default function LandingPage() {
    return <LandingPageContent />
}
