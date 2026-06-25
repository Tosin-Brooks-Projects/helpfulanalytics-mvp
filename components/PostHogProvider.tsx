"use client"

import { useEffect, Suspense } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import posthog from "posthog-js"
import { PostHogProvider as PHProvider, usePostHog } from "posthog-js/react"
import { useSession } from "next-auth/react"

function PostHogPageview() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const posthogClient = usePostHog()

  useEffect(() => {
    if (!pathname || !posthogClient) return

    let url = window.origin + pathname
    if (searchParams?.toString()) {
      url += `?${searchParams.toString()}`
    }
    posthogClient.capture("$pageview", { $current_url: url })
  }, [pathname, searchParams, posthogClient])

  return null
}

function PostHogIdentify() {
  const { data: session, status } = useSession()
  const posthogClient = usePostHog()

  useEffect(() => {
    if (!posthogClient) return

    if (status === "authenticated" && session?.user) {
      const userId = (session as any).userId || session.user.id
      if (userId) {
        posthogClient.identify(userId, {
          email: session.user.email ?? undefined,
          name: session.user.name ?? undefined,
          subscription_status: (session.user as any).subscriptionStatus,
        })
      }
    } else if (status === "unauthenticated") {
      posthogClient.reset()
    }
  }, [status, session, posthogClient])

  return null
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return

    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: "/ingest",
      person_profiles: "identified_only",
      capture_pageview: false,
      capture_exceptions: true,
      debug: process.env.NODE_ENV === "development",
    })
  }, [])

  return (
    <PHProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageview />
        <PostHogIdentify />
      </Suspense>
      {children}
    </PHProvider>
  )
}
