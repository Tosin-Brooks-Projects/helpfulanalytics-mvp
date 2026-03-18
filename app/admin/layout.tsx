import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { db } from "@/lib/firebase-admin"

export const dynamic = "force-dynamic"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/login")
  }

  const doc = await db.collection("users").doc(session.user.id).get()
  const role = doc.exists ? doc.data()?.role : undefined

  if (role !== "admin") {
    redirect("/dashboard")
  }

  return children
}

