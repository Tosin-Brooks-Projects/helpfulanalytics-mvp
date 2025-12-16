export interface SubscriptionTier {
    title: string
    price: string
    description: string
    features: string[]
    highlight: boolean
    priceId: string
    maxProperties: number
    trialDays?: number
    isCustom?: boolean
}

export interface UserSubscription {
    tier: string
    status: "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "trialing" | "unpaid"
    stripeCustomerId?: string
    stripeSubscriptionId?: string
    stripePriceId?: string
    stripeCurrentPeriodEnd?: Date
}
