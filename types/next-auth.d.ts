import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
    /**
     * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
     */
    interface Session {
        accessToken?: string
        error?: string
        user: {
            id: string
            isOnboarded?: boolean
            createdAt?: string
            subscriptionStatus?: string
        } & DefaultSession["user"]
    }

    interface Profile {
        email_verified?: boolean
        picture?: string
    }
}

declare module "next-auth/jwt" {
    /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
    interface JWT {
        accessToken?: string
        refreshToken?: string
        accessTokenExpires?: number
        error?: string
        userId?: string
        isOnboarded?: boolean
        createdAt?: string
        subscriptionStatus?: string
    }
}
