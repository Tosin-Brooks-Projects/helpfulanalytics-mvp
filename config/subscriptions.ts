import { type SubscriptionTier } from "@/types/subscription"

// Tier title (lowercased) for the self-serve per-property plan.
export const PER_PROPERTY_TIER = "per-property"
// Flat self-serve cap for per-property accounts, unless overridden per-account by an admin.
export const PER_PROPERTY_DEFAULT_CAP = 30
// Property cap while a per-property account is still on its free trial (not yet paying).
export const TRIAL_PROPERTY_CAP = 5
// Legacy tiers kept only for existing (grandfathered) subscribers.
export const LEGACY_TIER_TITLES = ["starter", "pro", "agency", "enterprise"]

/** Human-readable tier label (e.g. "per-property" -> "Per-Property"), sourced from pricingData. */
export function getTierDisplayName(tier: string | undefined): string {
    if (!tier) return "Starter"
    const match = pricingData.find(t => t.title.toLowerCase() === tier.toLowerCase())
    return match?.title ?? tier
}

export const pricingData: SubscriptionTier[] = [
    {
        title: "Per-Property",
        priceMonthly: "$12",
        priceYearly: "$115", // 20% off ($9.58/mo)
        description: "Pay only for the properties you connect",
        features: [
            "$12 / property / month",
            "No long-term commitment",
            "14 day free trial",
        ],
        highlight: true,
        priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PER_PROPERTY || "price_1U3Mz0AQjADCPHYI78fGzKdq",
        priceIdYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PER_PROPERTY_YEARLY || "price_1U5PvaAQjADCPHYIN4vNYdyj",
        maxProperties: PER_PROPERTY_DEFAULT_CAP,
        trialDays: 14,
    },
    {
        title: "Starter",
        priceMonthly: "$19",
        priceYearly: "$182", // ~20% off ($15.2/mo)
        description: "Perfect for getting started",
        features: [
            "1 GA4 property",
            "14 day free trial",
            "Basic Analytics",
        ],
        highlight: false,
        priceIdMonthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER || "price_1SeZSPGuYUi194RaHzbFW6Nd",
        priceIdYearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER_YEARLY || "",
        maxProperties: 1,
        trialDays: 14,
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
            "Priority Support",
        ],
        highlight: false,
        priceIdMonthly: "",
        priceIdYearly: "",
        maxProperties: Infinity,
        isCustom: true,
    },
]
