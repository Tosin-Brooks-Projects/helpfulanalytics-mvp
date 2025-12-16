import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import Stripe from "stripe"
import { db } from "@/lib/firebase-admin"
import { pricingData } from "@/config/subscriptions"

// This is required for raw body access in Next.js App Router for webhooks if we were using a different method, 
// but simply reading text() is often enough if we don't have middleware interference.
// However, the standard way is to read the text.

export async function POST(req: Request) {
    const body = await req.text()
    const signature = headers().get("Stripe-Signature") as string

    let event: Stripe.Event

    try {
        if (!process.env.STRIPE_WEBHOOK_SECRET) {
            throw new Error("STRIPE_WEBHOOK_SECRET is missing")
        }
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        )
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
    }

    // Handle Checkout Session Completion
    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        )

        const userId = session.metadata?.userId
        console.log("[WEBHOOK] userId:", userId)

        if (userId) {
            const priceId = subscription.items.data[0].price.id
            console.log("[WEBHOOK] Received Price ID:", priceId)

            // Log known tiers for debugging
            console.log("[WEBHOOK] Configured Tiers:", pricingData.map(t => ({ title: t.title, priceId: t.priceId })))

            const tier = pricingData.find(t => t.priceId === priceId)
            console.log("[WEBHOOK] Matched Tier:", tier?.title)

            await db.collection("users").doc(userId).set({
                subscription: {
                    tier: tier ? tier.title.toLowerCase() : "custom",
                    status: subscription.status,
                    stripeCustomerId: subscription.customer as string,
                    stripeSubscriptionId: subscription.id,
                    stripePriceId: priceId,
                    stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000)
                }
            }, { merge: true })
            console.log("[WEBHOOK] DB Updated")
        }
    }

    // Handle Payment Succeeded (Invoice) - primarily for renewals
    if (event.type === "invoice.payment_succeeded") {
        const invoice = event.data.object as Stripe.Invoice

        // Ensure we have a subscription ID
        if (invoice.subscription) {
            const subscription = await stripe.subscriptions.retrieve(
                invoice.subscription as string
            )

            // We need to find the user. Invoices might not have the metadata directly on them in all cases,
            // so we look up by stripeSubscriptionId which we saved earlier.

            const snap = await db.collection("users").where("subscription.stripeSubscriptionId", "==", subscription.id).get()

            if (!snap.empty) {
                const doc = snap.docs[0]
                await doc.ref.set({
                    subscription: {
                        status: subscription.status,
                        stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000)
                    }
                }, { merge: true })
                console.log("[WEBHOOK] Renewal Updated for User", doc.id)
            }
        }
    }

    // Handle Deletions/Updates
    if (event.type === "customer.subscription.deleted" || event.type === "customer.subscription.updated") {
        const subscription = event.data.object as Stripe.Subscription

        const snap = await db.collection("users").where("subscription.stripeSubscriptionId", "==", subscription.id).get()

        if (!snap.empty) {
            const doc = snap.docs[0]

            // Validate timestamp before write
            const periodEnd = new Date(subscription.current_period_end * 1000)
            if (isNaN(periodEnd.getTime())) {
                console.error("[WEBHOOK] Invalid timestamp for subscription end")
                return new NextResponse("Invalid Timestamp", { status: 400 })
            }

            await doc.ref.set({
                subscription: {
                    status: subscription.status,
                    stripeCurrentPeriodEnd: periodEnd
                }
            }, { merge: true })
            console.log("[WEBHOOK] Subscription Status Updated")
        }
    }

    return new NextResponse(null, { status: 200 })
}
