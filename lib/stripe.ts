import Stripe from "stripe"

// Prevent build errors if key is missing (e.g. during CI build)
const stripeKey = process.env.STRIPE_SECRET_KEY || "dummy_key_for_build"

export const stripe = new Stripe(stripeKey, {
    apiVersion: "2024-12-18.acacia", // Use latest or matching version
    typescript: true,
})
