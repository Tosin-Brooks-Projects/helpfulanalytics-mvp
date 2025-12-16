import { type SubscriptionTier } from "@/types/subscription"

export const pricingData: SubscriptionTier[] = [
    {
        title: "Starter",
        price: "$19", // Display price
        description: "Perfect for getting started",
        features: [
            "1 GA4 property",
            "30 day free trial",
            "Basic Analytics",
        ],
        highlight: false,
        // TODO: Update these with your real Stripe Price IDs in .env
        priceId: process.env.STRIPE_PRICE_ID_STARTER || "price_1SeZSPGuYUi194RaHzbFW6Nd",
        maxProperties: 1,
        trialDays: 30,
    },
    {
        title: "Pro",
        price: "$99",
        description: "For growing businesses",
        features: [
            "Up to 7 GA4 properties",
            "Advanced Analytics",
            "Priority Email Support",
        ],
        highlight: true,
        priceId: process.env.STRIPE_PRICE_ID_PRO || "price_1SeZUWGuYUi194RawLZzNd7L",
        maxProperties: 7,
    },
    {
        title: "Agency",
        price: "$299",
        description: "For agencies and large teams",
        features: [
            "Up to 30 GA4 properties",
            "Custom Reporting",
            "Dedicated Support",
        ],
        highlight: false,
        priceId: process.env.STRIPE_PRICE_ID_AGENCY || "price_1SeZVRGuYUi194RaRfV6Npu8",
        maxProperties: 30,
    },
    {
        title: "Enterprise",
        price: "Custom",
        description: "For large scale organizations",
        features: [
            "30+ GA4 properties",
            "Custom Onboarding",
            "Priority Phone Support",
        ],
        highlight: false,
        priceId: "", // Contact sales
        maxProperties: Infinity,
        isCustom: true,
    },
]
