import { NextResponse } from "next/server"
import { db } from "@/lib/firebase-admin"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  // Extra hardening: this route should be explicitly enabled.
  // Keep it off in production unless you intentionally turn it on.
  const enabled = (process.env.ENABLE_ADMIN_BOOTSTRAP || "").toLowerCase() === "true"
  if (!enabled) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 })
  }

  const secret = req.headers.get("x-admin-bootstrap-secret") || ""
  const expected = process.env.ADMIN_BOOTSTRAP_SECRET || ""

  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  let body: { email?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const email = (body.email || "").trim().toLowerCase()
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  const snap = await db.collection("users").where("email", "==", email).limit(5).get()

  if (snap.empty) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const updates = snap.docs.map((doc) => doc.ref.set({ role: "admin" }, { merge: true }))
  await Promise.all(updates)

  return NextResponse.json({
    ok: true,
    updatedUserIds: snap.docs.map((d) => d.id),
  })
}

