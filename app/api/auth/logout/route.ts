import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ success: true })

  // Clear all auth cookies
  response.cookies.delete("access_token")
  response.cookies.delete("refresh_token")
  response.cookies.delete("token_expires_at")
  response.cookies.delete("selected_property")

  return response
}
