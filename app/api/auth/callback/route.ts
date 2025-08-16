import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error) {
    return NextResponse.redirect(new URL("/login?error=access_denied", request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=no_code", request.url))
  }

  const cookieStore = await cookies()
  const codeVerifier = cookieStore.get("code_verifier")?.value

  if (!codeVerifier) {
    return NextResponse.redirect(new URL("/login?error=no_verifier", request.url))
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        code,
        code_verifier: codeVerifier,
        grant_type: "authorization_code",
        redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      }),
    })

    const tokens = await tokenResponse.json()

    if (!tokenResponse.ok) {
      throw new Error(tokens.error_description || "Token exchange failed")
    }

    const response = NextResponse.redirect(new URL("/", request.url))

    // Store tokens in httpOnly cookies
    const expiresAt = Date.now() + tokens.expires_in * 1000

    response.cookies.set("access_token", tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: tokens.expires_in,
      sameSite: "lax",
    })

    if (tokens.refresh_token) {
      response.cookies.set("refresh_token", tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: "lax",
      })
    }

    response.cookies.set("token_expires_at", expiresAt.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: tokens.expires_in,
      sameSite: "lax",
    })

    // Clear code verifier
    response.cookies.delete("code_verifier")

    return response
  } catch (error) {
    console.error("Auth callback error:", error)
    return NextResponse.redirect(new URL("/login?error=token_exchange", request.url))
  }
}
