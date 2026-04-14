import { NextResponse } from "next/server"
import { z } from "zod"
import { Resend } from "resend"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { db } from "@/lib/firebase-admin"
import { logAdminEvent } from "@/lib/admin/audit"

export const dynamic = "force-dynamic"

const schema = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(200),
  html: z.string().min(1).max(20000),
})

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { ok: false as const, res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }

  const requesterDoc = await db.collection("users").doc(session.user.id).get()
  const requesterRole = requesterDoc.exists ? requesterDoc.data()?.role : undefined
  if (requesterRole !== "admin") return { ok: false as const, res: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }

  return { ok: true as const, session }
}

export async function POST(req: Request) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.res

  const key = process.env.RESEND_API_KEY
  if (!key) {
    return NextResponse.json({ error: "RESEND_API_KEY is not configured" }, { status: 500 })
  }

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const parsed = schema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload", issues: parsed.error.issues }, { status: 400 })
  }

  const resend = new Resend(key)
  const settingsDoc = await db.collection("admin_settings").doc("global").get()
  const settings = settingsDoc.exists ? settingsDoc.data() : {}
  const from =
    (settings?.adminFromEmail && String(settings.adminFromEmail)) ||
    process.env.ADMIN_FROM_EMAIL ||
    "Admin <no-reply@helpfulanalytics.com>"
  const replyTo =
    (settings?.adminReplyToEmail && String(settings.adminReplyToEmail)) ||
    process.env.ADMIN_REPLY_TO_EMAIL ||
    undefined

  const result = await resend.emails.send({
    from,
    to: parsed.data.to,
    subject: parsed.data.subject,
    html: parsed.data.html,
    ...(replyTo ? { replyTo } : {}),
  })

  if ((result as any).error) {
    return NextResponse.json({ error: (result as any).error?.message || "Email send failed" }, { status: 400 })
  }

  await logAdminEvent({
    actorId: gate.session.user.id,
    actorEmail: gate.session.user.email || undefined,
    action: "admin.email.send",
    targetType: "email",
    targetId: parsed.data.to,
    meta: { subject: parsed.data.subject },
  })

  return NextResponse.json({ ok: true, id: (result as any).data?.id })
}

