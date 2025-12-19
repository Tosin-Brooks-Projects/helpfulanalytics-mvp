import { type SubscriptionTier } from "@/types/subscription"

export const pricingData: SubscriptionTier[] = [
    {
        title: "Starter",
        priceMonthly: "$19",
        priceYearly: "$182", // ~20% off ($15.2/mo)
        description: "Perfect for getting started",
        features: [
            "1 GA4 property",
            "30 day free trial",
            "Basic Analytics",
        ],
        highlight: false,
        priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER || "price_1SeZSPGuYUi194RaHzbFW6Nd",
        priceIdYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_YEARLY || "",
        maxProperties: 1,
        trialDays: 30,
    },
    {
        title: "Pro",
        priceMonthly: "$99",
        priceYearly: "$950", // ~20% off ($79.2/mo)
        description: "For growing businesses",
        features: [
            "Up to 7 GA4 properties",
            "Advanced Analytics",
            "Priority Email Support",
        ],
        highlight: true,
        priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || "price_1SeZUWGuYUi194RawLZzNd7L",
        priceIdYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO_YEARLY || "",
        maxProperties: 7,
    },
    {
        title: "Agency",
        priceMonthly: "$299",
        priceYearly: "$2,870", // ~20% off ($239.2/mo)
        description: "For agencies and large teams",
        features: [
            "Up to 30 GA4 properties",
            "Custom Reporting",
            "Dedicated Support",
        ],
        highlight: false,
        priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_AGENCY || "price_1SeZVRGuYUi194RaRfV6Npu8",
        priceIdYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_AGENCY_YEARLY || "",
        maxProperties: 30,
    },
    {
        title: "Enterprise",
        priceMonthly: "Custom",
        priceYearly: "Custom",
        description: "For large scale organizations",
        features: [
            "30+ GA4 properties",
            "Custom Onboarding",
            "Priority Phone Support",
        ],
        highlight: false,
        priceIdMonthly: "",
        priceIdYearly: "",
        maxProperties: Infinity,
        isCustom: true,
    },
]
