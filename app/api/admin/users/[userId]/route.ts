import { NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { db } from "@/lib/firebase-admin"
import { logAdminEvent } from "@/lib/admin/audit"

export const dynamic = "force-dynamic"

const patchSchema = z.object({
  role: z.enum(["admin", "user"]).optional(),
  isOnboarded: z.boolean().optional(),
  disabled: z.boolean().optional(),
  // Keep subscription editing explicit and limited.
  subscription: z
    .object({
      tier: z.string().min(1).optional(),
      status: z.enum(["free", "trialing", "active", "canceled", "incomplete", "incomplete_expired", "past_due", "unpaid"]).optional(),
    })
    .optional(),
  // Admin convenience: restart trial window by resetting createdAt.
  resetTrialStart: z.boolean().optional(),
})

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { ok: false as const, res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }

  const requesterDoc = await db.collection("users").doc(session.user.id).get()
  const requesterRole = requesterDoc.exists ? requesterDoc.data()?.role : undefined
  if (requesterRole !== "admin") return { ok: false as const, res: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }

  return { ok: true as const, session }
}

export async function GET(_req: Request, ctx: { params: { userId: string } }) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.res

  const userId = ctx.params.userId
  const doc = await db.collection("users").doc(userId).get()
  if (!doc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const data = doc.data() || {}
  const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
  const lastSeen = data.lastSeen?.toDate ? data.lastSeen.toDate().toISOString() : data.lastSeen

  return NextResponse.json({
    user: {
      id: doc.id,
      email: data.email,
      name: data.name,
      image: data.image,
      role: data.role || "user",
      disabled: data.disabled === true,
      isOnboarded: data.isOnboarded ?? false,
      createdAt,
      lastSeen,
      subscription: data.subscription || null,
      subscriptionStatus: data.subscriptionStatus,
    },
  })
}

export async function PATCH(req: Request, ctx: { params: { userId: string } }) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.res

  const userId = ctx.params.userId

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = patchSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 })
  }

  // Safety: prevent self-demotion (locking yourself out).
  if (gate.session.user.id === userId && parsed.data.role && parsed.data.role !== "admin") {
    return NextResponse.json({ error: "You cannot remove your own admin role." }, { status: 400 })
  }

  const updates: Record<string, any> = {}

  if (parsed.data.role) updates.role = parsed.data.role
  if (parsed.data.isOnboarded !== undefined) updates.isOnboarded = parsed.data.isOnboarded
  if (parsed.data.disabled !== undefined) updates.disabled = parsed.data.disabled

  if (parsed.data.subscription) {
    // Merge into nested subscription object.
    updates.subscription = {
      ...(parsed.data.subscription.tier ? { tier: parsed.data.subscription.tier } : {}),
      ...(parsed.data.subscription.status ? { status: parsed.data.subscription.status } : {}),
    }
    // Keep legacy flat field aligned if status is supplied.
    if (parsed.data.subscription.status) updates.subscriptionStatus = parsed.data.subscription.status
  }

  if (parsed.data.resetTrialStart) {
    updates.createdAt = new Date()
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ ok: true, updated: false })
  }

  await db.collection("users").doc(userId).set(updates, { merge: true })

  await logAdminEvent({
    actorId: gate.session.user.id,
    actorEmail: gate.session.user.email || undefined,
    action: "admin.user.patch",
    targetType: "user",
    targetId: userId,
    meta: { keys: Object.keys(updates) },
  })

  return NextResponse.json({ ok: true, updated: true })
}

