import { NextResponse } from "next/server"
import { z } from "zod"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { db } from "@/lib/firebase-admin"
import { logAdminEvent } from "@/lib/admin/audit"

export const dynamic = "force-dynamic"

const settingsSchema = z.object({
  maintenanceMode: z.boolean().optional(),
  maintenanceMessage: z.string().max(500).optional(),
  supportEmail: z.string().email().optional(),
  reportFromEmail: z.string().min(1).optional(),
  adminFromEmail: z.string().min(1).optional(),
  adminReplyToEmail: z.string().email().optional(),
  blockNewUsers: z.boolean().optional(),
  signupAllowlist: z.array(z.string().email()).max(500).optional(),
  allowAdminBootstrap: z.boolean().optional(),
})

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { ok: false as const, res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }

  const requesterDoc = await db.collection("users").doc(session.user.id).get()
  const requesterRole = requesterDoc.exists ? requesterDoc.data()?.role : undefined
  if (requesterRole !== "admin") return { ok: false as const, res: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }

  return { ok: true as const, session }
}

const SETTINGS_DOC = db.collection("admin_settings").doc("global")

export async function GET() {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.res

  const doc = await SETTINGS_DOC.get()
  const data = doc.exists ? doc.data() : {}

  return NextResponse.json({
    settings: {
      maintenanceMode: !!data?.maintenanceMode,
      maintenanceMessage: data?.maintenanceMessage || "",
      supportEmail: data?.supportEmail || "",
      reportFromEmail: data?.reportFromEmail || "Analytics Report <onboarding@resend.dev>",
      adminFromEmail: data?.adminFromEmail || "",
      adminReplyToEmail: data?.adminReplyToEmail || "",
      blockNewUsers: !!data?.blockNewUsers,
      signupAllowlist: Array.isArray(data?.signupAllowlist) ? data.signupAllowlist : [],
      allowAdminBootstrap: !!data?.allowAdminBootstrap,
      updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data?.updatedAt,
    },
  })
}

export async function PATCH(req: Request) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.res

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = settingsSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 })
  }

  const updates: Record<string, any> = { ...parsed.data, updatedAt: new Date() }
  await SETTINGS_DOC.set(updates, { merge: true })

  await logAdminEvent({
    actorId: gate.session.user.id,
    actorEmail: gate.session.user.email || undefined,
    action: "admin.settings.patch",
    targetType: "admin_settings",
    targetId: "global",
    meta: { keys: Object.keys(parsed.data) },
  })

  // Optional: keep env-gated route aligned with DB toggle.
  // (Route still requires ENABLE_ADMIN_BOOTSTRAP=true + secret.)
  if (parsed.data.allowAdminBootstrap !== undefined) {
    // no-op here; UI toggle is informational unless you wire it into env management
  }

  return NextResponse.json({ ok: true })
}

