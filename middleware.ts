import { withAuth } from "next-auth/middleware"



// We need to upgrade to "Advanced" middleware usage to handle the redirect
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token
        const isAuth = !!token
        const isOnboarded = token?.isOnboarded
        const isDashboardPage = req.nextUrl.pathname.startsWith("/dashboard")
        const isOnboardingPage = req.nextUrl.pathname.startsWith("/onboarding")

        // 1. If trying to access dashboard and not onboarded -> Redirect to onboarding
        if (isDashboardPage && isAuth && isOnboarded === false) {
            return NextResponse.redirect(new URL("/onboarding", req.url))
        }

        // 2. If trying to access onboarding but ALREADY onboarded -> Redirect to dashboard
        if (isOnboardingPage && isAuth && isOnboarded === true) {
            return NextResponse.redirect(new URL("/dashboard", req.url))
        }

        // 3. Trial Enforcement (30 Days)
        if (isAuth && token?.createdAt) {
            const createdAt = new Date(token.createdAt as string)
            const now = new Date()
            const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000
            const isExpired = now.getTime() > createdAt.getTime() + thirtyDaysInMs

            const status = (token.subscriptionStatus as string) || 'free'
            const isPremium = status === 'active' || status === 'trialing'

            // If expired and not premium, redirect to pricing
            // Allow /pricing, /api (for checkout), /logout, etc.
            if (isExpired && !isPremium) {
                const pathname = req.nextUrl.pathname
                const isExcluded =
                    pathname.startsWith('/pricing') ||
                    pathname.startsWith('/api') ||
                    pathname.startsWith('/_next') ||
                    pathname.startsWith('/static') ||
                    pathname === '/login'

                if (!isExcluded) {
                    const url = new URL("/pricing", req.url)
                    url.searchParams.set("reason", "trial_expired")
                    return NextResponse.redirect(url)
                }
            }
        }

        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token,
        },
    }
)

export const config = {
    matcher: ["/dashboard/:path*", "/onboarding/:path*"],
}
