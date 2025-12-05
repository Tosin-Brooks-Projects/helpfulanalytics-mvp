import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

export async function getValidAccessToken(): Promise<string | null> {
  const session = await getServerSession(authOptions)

  // @ts-ignore
  if (session?.accessToken) {
    // @ts-ignore
    return session.accessToken
  }

  return null
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getValidAccessToken()
  return token !== null
}
