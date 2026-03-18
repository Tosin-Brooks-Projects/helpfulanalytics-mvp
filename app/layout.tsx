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
    default: "Helpful Analytics - The Best Google Analytics Dashboard for GA4",
    template: "%s | Helpful Analytics",
  },
  description: "Simple, privacy-friendly Google Analytics metrics with our easy to use dashboard. Understand your traffic without the confusion of GA4.",
  keywords: [
    "google analytics dashboard",
    "ga4 setup",
    "google analytics alternative",
    "how to use google analytics",
    "ga4 basics",
    "google analytics for small business",
    "how to read google analytics",
    "universal analytics vs google analytics 4",
    "google analytics metrics",
    "ga4 walkthrough"
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
