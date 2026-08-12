import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { db } from "@/lib/firebase-admin"
import { stripe } from "@/lib/stripe"
import { logAdminEvent } from "@/lib/admin/audit"
import { PER_PROPERTY_TIER, LEGACY_TIER_TITLES } from "@/config/subscriptions"

export const dynamic = "force-dynamic"

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { ok: false as const, res: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) }

  const requesterDoc = await db.collection("users").doc(session.user.id).get()
  const requesterRole = requesterDoc.exists ? requesterDoc.data()?.role : undefined
  if (requesterRole !== "admin") return { ok: false as const, res: NextResponse.json({ error: "Forbidden" }, { status: 403 }) }

  return { ok: true as const, session }
}

// Switches a legacy-tier subscriber (Starter/Pro/Agency/Enterprise) onto the
// per-property billing model, at their current property count.
//
// If the account has a real Stripe subscription, the price change takes
// effect at their NEXT renewal (proration_behavior: "none" — no immediate
// charge/credit for the current, already-paid period).
//
// If the account has no Stripe subscription attached (a manually-flagged
// tier with no real billing behind it), this just flips subscription.tier
// in Firestore — no Stripe call, no charge.
export async function POST(_req: Request, ctx: { params: { userId: string } }) {
  const gate = await requireAdmin()
  if (!gate.ok) return gate.res

  const userId = ctx.params.userId
  const userRef = db.collection("users").doc(userId)
  const userDoc = await userRef.get()
  if (!userDoc.exists) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const data = userDoc.data() || {}
  const sub = data.subscription || {}
  const currentTier = String(sub.tier || "").toLowerCase()

  if (currentTier === PER_PROPERTY_TIER) {
    return NextResponse.json({ error: "This account is already on the per-property plan." }, { status: 400 })
  }
  if (!LEGACY_TIER_TITLES.includes(currentTier)) {
    return NextResponse.json({ error: `Unrecognized tier "${sub.tier}" — refusing to switch it.` }, { status: 400 })
  }

  if (!sub.stripeSubscriptionId) {
    // No real billing behind this tier (manually-flagged/comp account) — just flip the Firestore tier.
    await userRef.set({ subscription: { tier: PER_PROPERTY_TIER } }, { merge: true })

    await logAdminEvent({
      actorId: gate.session.user.id,
      actorEmail: gate.session.user.email || undefined,
      action: "admin.user.switchToPerProperty",
      targetType: "user",
      targetId: userId,
      meta: { fromTier: currentTier, mode: "firestore-only" },
    })

    return NextResponse.json({ ok: true, mode: "firestore-only" })
  }

  const propsSnap = await userRef.collection("properties").get()
  const propertyCount = propsSnap.size
  const quantity = Math.max(1, propertyCount)

  const perPropertyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PER_PROPERTY || "price_1U3Mz0AQjADCPHYI78fGzKdq"

  const itemId = sub.stripeSubscriptionItemId
    ?? (await stripe.subscriptions.retrieve(sub.stripeSubscriptionId)).items.data[0].id

  await stripe.subscriptionItems.update(itemId, {
    price: perPropertyPriceId,
    quantity,
    proration_behavior: "none",
  })

  await userRef.set({
    subscription: {
      tier: PER_PROPERTY_TIER,
      stripePriceId: perPropertyPriceId,
      stripeSubscriptionItemId: itemId,
    }
  }, { merge: true })

  await logAdminEvent({
    actorId: gate.session.user.id,
    actorEmail: gate.session.user.email || undefined,
    action: "admin.user.switchToPerProperty",
    targetType: "user",
    targetId: userId,
    meta: { fromTier: currentTier, mode: "stripe", quantity },
  })

  return NextResponse.json({ ok: true, mode: "stripe", quantity })
}
