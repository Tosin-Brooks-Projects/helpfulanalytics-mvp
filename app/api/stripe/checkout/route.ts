import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { stripe } from "@/lib/stripe"
import { pricingData } from "@/config/subscriptions"
import { db } from "@/lib/firebase-admin"
import { TRIAL_DAYS } from "@/lib/subscription"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        // @ts-ignore
        if (!session?.userId) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { priceId } = await req.json()
        const tier = pricingData.find(
            (t) => t.priceIdMonthly === priceId || t.priceIdYearly === priceId
        )

        if (!tier) {
            return new NextResponse("Invalid price ID", { status: 400 })
        }

        // @ts-ignore
        const userId = session.userId
        // @ts-ignore
        const userEmail = session.user.email

        // The app grants a 30-day trial automatically from signup
        // (see lib/subscription.ts). Only grant Stripe's trial_period_days
        // for users who (a) have never subscribed before, and (b) still have
        // time left on their signup trial. Otherwise they'd get a second free
        // trial at checkout instead of being charged.
        let signupTrialRemainingDays = 0
        let existingStripeCustomerId: string | undefined
        let hasSubscribedBefore = false
        try {
            const userDoc = await db.collection("users").doc(userId).get()
            const data = userDoc.data()
            existingStripeCustomerId = data?.subscription?.stripeCustomerId
            hasSubscribedBefore = Boolean(
                existingStripeCustomerId || data?.subscription?.stripeSubscriptionId
            )

            if (tier.trialDays && !hasSubscribedBefore) {
                const createdAtRaw = data?.createdAt
                const createdAt = createdAtRaw
                    ? (typeof createdAtRaw.toDate === "function"
                        ? createdAtRaw.toDate()
                        : new Date(createdAtRaw))
                    : null
                if (createdAt) {
                    const msPerDay = 24 * 60 * 60 * 1000
                    const elapsedDays = Math.floor((Date.now() - createdAt.getTime()) / msPerDay)
                    signupTrialRemainingDays = Math.max(0, TRIAL_DAYS - elapsedDays)
                }
            }
        } catch (e) {
            console.error("[STRIPE_CHECKOUT] Failed to read user record", e)
        }

        const subscription_data = signupTrialRemainingDays > 0
            ? { trial_period_days: signupTrialRemainingDays }
            : undefined

        const settingsUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.helpfulanalytics.com"

        const stripeSession = await stripe.checkout.sessions.create({
            success_url: `${settingsUrl}/dashboard?success=true`,
            cancel_url: `${settingsUrl}/pricing?canceled=true`,
            payment_method_types: ["card"],
            mode: "subscription",
            billing_address_collection: "auto",
            ...(existingStripeCustomerId
                ? { customer: existingStripeCustomerId }
                : { customer_email: userEmail || undefined }),
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            metadata: {
                userId: userId,
            },
            subscription_data,
        })

        return NextResponse.json({ url: stripeSession.url })
    } catch (error: any) {
        console.error("[STRIPE_CHECKOUT]", error)
        return new NextResponse(error.message || "Internal Error", { status: error.statusCode || 500 })
    }
}
