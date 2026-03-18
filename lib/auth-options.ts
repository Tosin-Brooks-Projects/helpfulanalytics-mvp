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

                    // Optional: lock down new signups at the door
                    if (!doc.exists) {
                        const settingsDoc = await db.collection("admin_settings").doc("global").get()
                        const settings = settingsDoc.exists ? settingsDoc.data() : {}
                        const blockNewUsers = settings?.blockNewUsers === true
                        if (blockNewUsers) {
                            const email = (user.email || "").toLowerCase().trim()
                            const allowlist: string[] = Array.isArray(settings?.signupAllowlist) ? settings.signupAllowlist : []
                            const allowed = email && allowlist.map((e) => String(e).toLowerCase().trim()).includes(email)
                            if (!allowed) {
                                return false
                            }
                        }
                    }

                    if (!doc.exists) {
                        // New user
                        await userRef.set(
                            {
                                email: user.email,
                                name: user.name,
                                image: user.image,
                                lastSeen: new Date(),
                                createdAt: new Date(), // Start 30-day trial
                                subscriptionStatus: 'free',
                                role: "user",
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
                        const data = doc.data()
                        const updates: any = {
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
                        }

                        // Backfill trial start for existing users
                        if (!data?.createdAt) {
                            updates.createdAt = new Date()
                        }
                        if (!data?.role) {
                            updates.role = "user"
                        }

                        await userRef.set(updates, { merge: true })
                    }

                    // Block sign-in for disabled accounts
                    const freshDoc = await userRef.get()
                    const freshData = freshDoc.exists ? freshDoc.data() : undefined
                    if (freshData?.disabled === true) {
                        return false
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

                // Fetch onboarding status and trial info from DB
                let isOnboarded = false
                let subscriptionStatus = 'free'
                let createdAt = new Date().toISOString()
                let role: "admin" | "user" = "user"
                let disabled = false
                let maintenanceMode = false
                let maintenanceMessage = ""

                try {
                    const { db } = await import("@/lib/firebase-admin")
                    const { getSubscriptionStatus } = await import("@/lib/subscription")
                    const doc = await db.collection("users").doc(user.id).get()
                    if (doc.exists) {
                        const data = doc.data()
                        isOnboarded = data?.isOnboarded ?? false
                        role = data?.role === "admin" ? "admin" : "user"
                        disabled = data?.disabled === true
                        
                        const subInfo = getSubscriptionStatus(data)
                        subscriptionStatus = subInfo.status
                        createdAt = (data?.createdAt?.toDate ? data.createdAt.toDate() : new Date(data?.createdAt || Date.now())).toISOString()
                    }

                    const settingsDoc = await db.collection("admin_settings").doc("global").get()
                    maintenanceMode = settingsDoc.exists ? settingsDoc.data()?.maintenanceMode === true : false
                    maintenanceMessage = settingsDoc.exists ? (settingsDoc.data()?.maintenanceMessage || "") : ""
                } catch (e) {
                    console.error("Failed to fetch user metadata", e)
                }

                return {
                    ...token,
                    accessToken: account.access_token,
                    accessTokenExpires: account.expires_at! * 1000,
                    refreshToken: account.refresh_token,
                    userId: user.id,
                    isOnboarded,
                    subscriptionStatus,
                    createdAt,
                    role,
                    disabled,
                    maintenanceMode,
                    maintenanceMessage,
                }
            }

            // Handle session update (manual trigger from client)
            if (trigger === "update" && (session?.isOnboarded !== undefined || session?.subscriptionStatus !== undefined)) {
                console.log("DEBUG: Auth JWT Callback - Update Triggered", session)
                return {
                    ...token,
                    ...(session.isOnboarded !== undefined && { isOnboarded: session.isOnboarded }),
                    ...(session.subscriptionStatus !== undefined && { subscriptionStatus: session.subscriptionStatus })
                }
            }

            // Ensure role is present for already-signed-in users (older tokens won't have it).
            if ((!token.role || token.disabled === undefined || token.maintenanceMode === undefined || token.maintenanceMessage === undefined) && (token.userId || token.sub)) {
                try {
                    const { db } = await import("@/lib/firebase-admin")
                    const userId = (token.userId as string) || (token.sub as string)
                    const doc = await db.collection("users").doc(userId).get()
                    if (doc.exists) {
                        const data = doc.data()
                        token.role = data?.role === "admin" ? "admin" : "user"
                        if (token.disabled === undefined) token.disabled = data?.disabled === true
                    } else {
                        token.role = "user"
                        if (token.disabled === undefined) token.disabled = false
                    }

                    if (token.maintenanceMode === undefined || token.maintenanceMessage === undefined) {
                        const settingsDoc = await db.collection("admin_settings").doc("global").get()
                        token.maintenanceMode = settingsDoc.exists ? settingsDoc.data()?.maintenanceMode === true : false
                        token.maintenanceMessage = settingsDoc.exists ? (settingsDoc.data()?.maintenanceMessage || "") : ""
                    }
                } catch (e) {
                    // Default to non-admin if we can't verify.
                    token.role = "user"
                    if (token.disabled === undefined) token.disabled = false
                    if (token.maintenanceMode === undefined) token.maintenanceMode = false
                    if (token.maintenanceMessage === undefined) token.maintenanceMessage = ""
                }
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
                session.user.createdAt = token.createdAt as string
                session.user.subscriptionStatus = token.subscriptionStatus as string
                // @ts-ignore
                session.user.role = token.role as any
                session.user.disabled = token.disabled as boolean
                session.user.maintenanceMode = token.maintenanceMode as boolean
                session.user.maintenanceMessage = token.maintenanceMessage as any
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
