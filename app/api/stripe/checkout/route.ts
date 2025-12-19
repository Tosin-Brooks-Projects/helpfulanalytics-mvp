import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { stripe } from "@/lib/stripe"
import { pricingData } from "@/config/subscriptions"

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

        // Simple checkout session creation
        // In production, you might want to check if the user already has a stripeCustomerId
        // and re-use it. For simplicity here, we let Stripe handle it or use email to match if possible (though creating new customer is safer for now unless we store ID)

        // Check if we have trial days
        const subscription_data = tier.trialDays
            ? { trial_period_days: tier.trialDays }
            : undefined

        const settingsUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

        const stripeSession = await stripe.checkout.sessions.create({
            success_url: `${settingsUrl}/dashboard?success=true`,
            cancel_url: `${settingsUrl}/#pricing?canceled=true`,
            payment_method_types: ["card"],
            mode: "subscription",
            billing_address_collection: "auto",
            customer_email: userEmail || undefined,
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
