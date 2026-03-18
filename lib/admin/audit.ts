import { db } from "@/lib/firebase-admin"

export type AdminAuditEvent = {
  actorId: string
  actorEmail?: string
  action: string
  targetType?: string
  targetId?: string
  meta?: Record<string, any>
  createdAt?: Date
}

export async function logAdminEvent(event: AdminAuditEvent) {
  try {
    await db.collection("admin_audit").add({
      actorId: event.actorId,
      actorEmail: event.actorEmail || null,
      action: event.action,
      targetType: event.targetType || null,
      targetId: event.targetId || null,
      meta: event.meta || null,
      createdAt: new Date(),
    })
  } catch (e) {
    // Never break admin flows if audit write fails
    console.error("Admin audit log failed:", e)
  }
}

