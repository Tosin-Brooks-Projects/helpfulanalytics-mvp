// Shared core logic for moving one legacy-tier account onto per-property
// billing. Used by both switch-to-per-property.js (single account) and
// migrate-all-legacy-to-per-property.js (bulk).

const PER_PROPERTY_TIER = "per-property";
const LEGACY_TIER_TITLES = ["starter", "pro", "agency", "enterprise"];

// Reads current state and returns a plan describing what would happen.
// Does not write anything.
async function planSwitch(db, stripe, doc) {
    const userId = doc.id;
    const data = doc.data();
    const sub = data.subscription || {};
    const tier = String(sub.tier || "").toLowerCase();

    if (tier === PER_PROPERTY_TIER) {
        return { userId, email: data.email, skip: "already on per-property" };
    }
    if (!LEGACY_TIER_TITLES.includes(tier)) {
        return { userId, email: data.email, skip: `unrecognized tier "${sub.tier}"` };
    }

    const propsSnap = await db.collection("users").doc(userId).collection("properties").get();
    const propertyCount = propsSnap.size;
    const quantity = Math.max(1, propertyCount);

    if (!sub.stripeSubscriptionId) {
        return { userId, email: data.email, mode: "firestore-only", fromTier: tier, propertyCount };
    }

    const itemId = sub.stripeSubscriptionItemId
        ?? (await stripe.subscriptions.retrieve(sub.stripeSubscriptionId)).items.data[0].id;

    return { userId, email: data.email, mode: "stripe", fromTier: tier, propertyCount, quantity, itemId };
}

// Executes a plan produced by planSwitch. Throws on failure.
async function executeSwitch(db, stripe, plan, perPropertyPriceId) {
    const userRef = db.collection("users").doc(plan.userId);

    if (plan.mode === "firestore-only") {
        await userRef.set({ subscription: { tier: PER_PROPERTY_TIER } }, { merge: true });
        return;
    }

    await stripe.subscriptionItems.update(plan.itemId, {
        price: perPropertyPriceId,
        quantity: plan.quantity,
        proration_behavior: "none",
    });

    await userRef.set({
        subscription: {
            tier: PER_PROPERTY_TIER,
            stripePriceId: perPropertyPriceId,
            stripeSubscriptionItemId: plan.itemId,
        }
    }, { merge: true });
}

module.exports = { PER_PROPERTY_TIER, LEGACY_TIER_TITLES, planSwitch, executeSwitch };
