import { Metadata } from "next";
import { AboutPageContent } from "@/components/marketing/about-page-content";

export const metadata: Metadata = {
    title: "About Us - Helpful Analytics",
    description: "Built by a founder who was tired of wrestling with Google Analytics and decided to fix it for everyone.",
    openGraph: {
        title: "About Us - Helpful Analytics",
        description: "Built by a founder who was tired of wrestling with Google Analytics and decided to fix it for everyone.",
    }
};

export default function AboutPage() {
    return <AboutPageContent />;
}
