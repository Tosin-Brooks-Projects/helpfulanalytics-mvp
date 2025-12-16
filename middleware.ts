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
