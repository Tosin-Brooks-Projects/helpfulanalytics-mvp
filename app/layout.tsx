import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { ErrorBoundary } from "@/components/error-boundary"
import { SessionProviderWrapper } from "@/components/SessionProviderWrapper"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Helpful Analytics - The Best Google Analytics Dashboard & GA4 Alternative",
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
