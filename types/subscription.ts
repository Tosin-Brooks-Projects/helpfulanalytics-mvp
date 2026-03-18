export interface SubscriptionTier {
    title: string
    priceMonthly: string
    priceYearly: string
    description: string
    features: string[]
    highlight: boolean
    priceIdMonthly: string
    priceIdYearly: string
    maxProperties: number
    trialDays?: number
    isCustom?: boolean
}

export interface UserSubscription {
    tier: string
    // Stripe statuses + app-level "free" for users not on a paid plan yet.
    status: "free" | "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "trialing" | "unpaid"
    stripeCustomerId?: string
    stripeSubscriptionId?: string
    stripePriceId?: string
    stripeCurrentPeriodEnd?: Date
}
