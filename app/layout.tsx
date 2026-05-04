import type React from "react"
import type { Metadata } from "next"
import { Inter, Outfit, Cormorant_Garamond } from "next/font/google"
import { ErrorBoundary } from "@/components/error-boundary"
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" })
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://helpfulanalytics.com"),
  title: {
    default: "Helpful Analytics - Simple GA4 Reporting for Marketing Agencies",
    template: "%s | Helpful Analytics",
  },
  description: "The GA4 dashboard built for marketing agencies. Simple client reporting, multi-account management, and white-label dashboards — without the GA4 complexity.",
  keywords: [
    "GA4 for marketing agencies",
    "google analytics dashboard for agencies",
    "GA4 client reporting",
    "agency analytics reporting tool",
    "GA4 too complicated",
    "simple google analytics for agencies",
    "manage multiple GA4 accounts",
    "white label analytics reporting",
    "GA4 alternative for agencies",
    "automate client reporting GA4",
    "dashthis alternative",
    "agencyanalytics alternative",
    "whatagraph alternative",
    "GA4 problems agencies",
    "client analytics dashboard"
  ],
  authors: [{ name: "Brooks Conkle", url: "https://x.com/brooksconkle" }],
  creator: "Brooks Conkle",
  publisher: "Helphul Analytics",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://helpfulanalytics.com",
    title: "Helpful Analytics - The Best Google Analytics Dashboard for GA4",
    description: "Simple, privacy-friendly Google Analytics metrics with our easy to use dashboard. Understand your traffic without the confusion of GA4.",
    siteName: "Helpful Analytics",
    images: [
      {
        url: "/landingpage.png",
        width: 1200,
        height: 630,
        alt: "Helpful Analytics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Helpful Analytics - The Best Google Analytics Dashboard for GA4",
    description: "Simple, privacy-friendly Google Analytics metrics with our easy to use dashboard. Understand your traffic without the confusion of GA4.",
    creator: "@brooksconkle",
    images: ["/landingpage.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable} ${cormorant.variable}`}>
      <body className={inter.className}>
        <SessionProviderWrapper>
          <ErrorBoundary>{children}</ErrorBoundary>
          <Toaster />
        </SessionProviderWrapper>
      </body>
    </html>
  )
}
