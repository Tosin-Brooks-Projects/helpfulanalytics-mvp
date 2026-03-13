import { UserSubscription } from "@/types/subscription";

export const TRIAL_DAYS = 30;

export function getSubscriptionStatus(userData: any): { 
    tier: string; 
    status: UserSubscription['status'];
    isPremium: boolean;
    isTrialing: boolean;
    trialEndsAt?: Date;
    stripeCurrentPeriodEnd?: Date;
} {
    const rawSub = userData?.subscription;
    const createdAt = userData?.createdAt ? (typeof userData.createdAt.toDate === 'function' ? userData.createdAt.toDate() : new Date(userData.createdAt)) : new Date();
    
    // Default values
    let tier = rawSub?.tier || "starter";
    let status = rawSub?.status || "free";
    let stripeCurrentPeriodEnd = rawSub?.stripeCurrentPeriodEnd ? (typeof rawSub.stripeCurrentPeriodEnd.toDate === 'function' ? rawSub.stripeCurrentPeriodEnd.toDate() : new Date(rawSub.stripeCurrentPeriodEnd)) : undefined;

    // A user is "Premium" if they have an active or trialing Stripe subscription
    let isPremium = status === "active" || status === "trialing";

    // Trial enforcement logic (30 days from createdAt)
    const now = new Date();
    const trialDurationMs = TRIAL_DAYS * 24 * 60 * 60 * 1000;
    const trialEndsAt = new Date(createdAt.getTime() + trialDurationMs);
    const isTrialing = now < trialEndsAt;

    // If NOT premium from Stripe, but still trialing, mark as trialing
    if (!isPremium && isTrialing) {
        status = "trialing";
        isPremium = true;
    }

    return {
        tier,
        status,
        isPremium,
        isTrialing,
        trialEndsAt,
        stripeCurrentPeriodEnd
    };
}
