import { cookies } from "next/headers"
import type { NextRequest } from "next/server"

export function generateCodeVerifier(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")
}

export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const hash = await crypto.subtle.digest("SHA-256", data)
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "")
}

export async function getValidAccessToken(request?: NextRequest): Promise<string | null> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get("access_token")?.value
  const refreshToken = cookieStore.get("refresh_token")?.value
  const expiresAt = cookieStore.get("token_expires_at")?.value

  if (!accessToken) return null

  // Check if token is still valid (with 5 minute buffer)
  if (expiresAt && Number.parseInt(expiresAt) - Date.now() > 5 * 60 * 1000) {
    return accessToken
  }

  // Try to refresh token
  if (refreshToken) {
    try {
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          refresh_token: refreshToken,
          grant_type: "refresh_token",
        }),
      })

      const tokens = await response.json()

      if (response.ok) {
        // Update cookies with new token
        const newExpiresAt = Date.now() + tokens.expires_in * 1000

        cookieStore.set("access_token", tokens.access_token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: tokens.expires_in,
          sameSite: "lax",
        })

        cookieStore.set("token_expires_at", newExpiresAt.toString(), {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: tokens.expires_in,
          sameSite: "lax",
        })

        return tokens.access_token
      }
    } catch (error) {
      console.error("Token refresh failed:", error)
    }
  }

  return null
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getValidAccessToken()
  return token !== null
}
