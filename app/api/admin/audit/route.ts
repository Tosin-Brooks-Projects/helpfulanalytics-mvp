import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { db } from "@/lib/firebase-admin"

export const dynamic = "force-dynamic"

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { ok: false as const, res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }

  const requesterDoc = await db.collection("users").doc(session.user.id).get()
  const requesterRole = requesterDoc.exists ? requesterDoc.data()?.role : undefined
  if (requesterRole !== "admin") return { ok: false as const, res: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }

  return { ok: true as const }
}

export async function GET() {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.res

  const snap = await db.collection("admin_audit").orderBy("createdAt", "desc").limit(100).get()

  const events = snap.docs.map((d) => {
    const data = d.data() || {}
    return {
      id: d.id,
      actorId: data.actorId,
      actorEmail: data.actorEmail,
      action: data.action,
      targetType: data.targetType,
      targetId: data.targetId,
      meta: data.meta || null,
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
    }
  })

  return NextResponse.json({ events })
}

