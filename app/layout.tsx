import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ErrorBoundary } from "@/components/error-boundary"
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL("https://helpfulanalytics.com"),
  title: {
    default: "Helpful Analytics - The Best Google Analytics Dashboard & GA4 Alternative",
    template: "%s | Helpful Analytics",
  },
  description: "Learn how to use Google Analytics 4 (GA4) with our easy-to-use dashboard. The perfect Google Analytics alternative for small businesses, research, and setting up tracking. Understand your data without the confusion.",
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
    title: "Helpful Analytics - The Best Google Analytics Dashboard",
    description: "Understand your data without the confusion. The perfect Google Analytics alternative for small businesses.",
    siteName: "Helpful Analytics",
  },
  twitter: {
    card: "summary_large_image",
    title: "Helpful Analytics - The Best Google Analytics Dashboard",
    description: "Understand your data without the confusion. The perfect Google Analytics alternative for small businesses.",
    creator: "@brooksconkle",
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
    <html lang="en">
      <body className={inter.className}>
        <SessionProviderWrapper>
          <ErrorBoundary>{children}</ErrorBoundary>
        </SessionProviderWrapper>
      </body>
    </html>
  )
}
