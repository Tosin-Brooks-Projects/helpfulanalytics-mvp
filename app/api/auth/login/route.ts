import { NextResponse } from "next/server"
import { generateCodeVerifier, generateCodeChallenge } from "@/lib/auth"

export async function GET() {
  try {
    const codeVerifier = generateCodeVerifier()
    const codeChallenge = await generateCodeChallenge(codeVerifier)

    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI!,
      scope: [
        // Core Analytics scopes
        "https://www.googleapis.com/auth/analytics.readonly",
        "https://www.googleapis.com/auth/analytics.manage.users.readonly",

        // Admin API scopes (needed for properties)
        "https://www.googleapis.com/auth/analytics.edit",
        "https://www.googleapis.com/auth/analytics.manage.users",

        // Additional scopes that might help
        "https://www.googleapis.com/auth/analytics.provision",

        // Basic profile info
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile",
      ].join(" "),
      response_type: "code",
      code_challenge: codeChallenge,
      code_challenge_method: "S256",
      access_type: "offline",
      prompt: "consent", // Force consent to ensure we get all permissions
      include_granted_scopes: "true", // Include previously granted scopes
    })

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`

    const response = NextResponse.redirect(authUrl)

    // Store code verifier in httpOnly cookie
    response.cookies.set("code_verifier", codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 600, // 10 minutes
      sameSite: "lax",
    })

    return response
  } catch (error) {
    console.error("Auth login error:", error)
    return NextResponse.json({ error: "Failed to generate auth URL" }, { status: 500 })
  }
}
