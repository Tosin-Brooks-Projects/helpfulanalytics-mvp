import { withAuth } from "next-auth/middleware"

export default withAuth({
    callbacks: {
        authorized: ({ req, token }) => {
            const path = req.nextUrl.pathname
            // Protect dashboard routes
            if (path.startsWith("/dashboard")) {
                return !!token
            }
            return true
        },
    },
})

export const config = {
    matcher: ["/dashboard/:path*"],
}
