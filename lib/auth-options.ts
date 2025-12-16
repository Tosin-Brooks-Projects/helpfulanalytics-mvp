import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import type { JWT } from "next-auth/jwt"

async function refreshAccessToken(token: JWT) {
    try {
        const url =
            "https://oauth2.googleapis.com/token?" +
            new URLSearchParams({
                client_id: process.env.GOOGLE_CLIENT_ID!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                grant_type: "refresh_token",
                refresh_token: token.refreshToken as string,
            })

        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            method: "POST",
        })

        const refreshedTokens = await response.json()

        if (!response.ok) {
            throw refreshedTokens
        }

        return {
            ...token,
            accessToken: refreshedTokens.access_token,
            accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
            refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
        }
    } catch (error) {
        console.error("RefreshAccessTokenError", error)

        return {
            ...token,
            error: "RefreshAccessTokenError",
        }
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            authorization: {
                params: {
                    scope: "openid email profile https://www.googleapis.com/auth/analytics.readonly",
                    prompt: "consent",
                    access_type: "offline",
                    response_type: "code",
                },
            },
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === "google") {
                try {
                    const { db } = await import("@/lib/firebase-admin")
                    const userRef = db.collection("users").doc(user.id)
                    const doc = await userRef.get()

                    if (!doc.exists) {
                        // New user
                        await userRef.set(
                            {
                                email: user.email,
                                name: user.name,
                                image: user.image,
                                lastSeen: new Date(),
                                isOnboarded: false, // Flag as new
                                tokens: {
                                    google: {
                                        accessToken: account.access_token,
                                        refreshToken: account.refresh_token,
                                        expiresAt: account.expires_at,
                                    }
                                }
                            }
                        )
                    } else {
                        // Existing user - update tokens/meta
                        await userRef.set({
                            lastSeen: new Date(),
                            name: user.name,
                            image: user.image,
                            tokens: {
                                google: {
                                    accessToken: account.access_token,
                                    refreshToken: account.refresh_token,
                                    expiresAt: account.expires_at,
                                }
                            }
                        }, { merge: true })
                    }
                } catch (error) {
                    console.error("Error saving user to Firestore", error)
                }
            }
            return true
        },
        async jwt({ token, account, user, trigger, session }) {
            // Initial sign in
            if (account && user) {
                console.log("DEBUG: Auth JWT Callback - Sign In", { userId: user.id })

                // Fetch onboarding status from DB to be sure
                let isOnboarded = false
                try {
                    const { db } = await import("@/lib/firebase-admin")
                    const doc = await db.collection("users").doc(user.id).get()
                    if (doc.exists) {
                        isOnboarded = doc.data()?.isOnboarded ?? false
                    }
                } catch (e) {
                    console.error("Failed to fetch onboarding status", e)
                }

                return {
                    ...token,
                    accessToken: account.access_token,
                    accessTokenExpires: account.expires_at! * 1000,
                    refreshToken: account.refresh_token,
                    userId: user.id,
                    isOnboarded
                }
            }

            // Handle session update (manual trigger from client)
            if (trigger === "update" && session?.isOnboarded !== undefined) {
                console.log("DEBUG: Auth JWT Callback - Update Triggered", session)
                return { ...token, isOnboarded: session.isOnboarded }
            }

            // Return previous token if the access token has not expired yet
            // @ts-ignore
            if (Date.now() < token.accessTokenExpires) {
                return token
            }

            // Access token has expired, try to update it
            return refreshAccessToken(token)
        },
        async session({ session, token }) {
            // @ts-ignore
            session.accessToken = token.accessToken
            // @ts-ignore
            session.error = token.error
            if (session.user) {
                session.user.id = (token.userId as string) || (token.sub as string)
                session.user.isOnboarded = token.isOnboarded as boolean
            }
            // @ts-ignore
            session.userId = token.userId || token.sub

            console.log("DEBUG: Auth Session Callback - Session UserId:", session.user.id)
            return session
        },
    },
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
        error: "/login", // Also redirect errors to the login page
    },
    secret: process.env.NEXTAUTH_SECRET || "secret", // Fallback for dev
}
