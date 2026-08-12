// Switches one legacy-tier subscriber (Starter/Pro/Agency) onto the new
// per-property Stripe billing model, at their current property count.
//
// If the account has a real Stripe subscription, the price change takes
// effect at their NEXT renewal (proration_behavior: "none" — no immediate
// charge/credit for the current, already-paid period).
//
// If the account has no Stripe subscription attached (a manually-flagged
// tier, e.g. a comp/test account with no real billing behind it), this
// just flips subscription.tier in Firestore — no Stripe call, no charge.
//
// Usage:
//   node scripts/switch-to-per-property.js user@example.com            (dry run — prints the plan, changes nothing)
//   node scripts/switch-to-per-property.js user@example.com --confirm  (actually executes)

const admin = require("firebase-admin");
const Stripe = require("stripe");
const fs = require('fs');
const path = require('path');
const { planSwitch, executeSwitch } = require("./lib/switch-account");

// Load .env
try {
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, 'utf8');
        envConfig.split('\n').forEach(line => {
            const match = line.match(/^([^=]+)=(.*)$/);
            if (match) {
                const key = match[1].trim();
                const value = match[2].trim().replace(/^["'](.*)["']$/, '$1');
                process.env[key] = value;
            }
        });
        console.log("✅ Loaded .env file");
    }
} catch (e) {
    console.error("Error loading .env:", e);
}

const email = process.argv[2];
const CONFIRM = process.argv.includes('--confirm');

if (!email) {
    console.error("❌ Usage: node scripts/switch-to-per-property.js user@example.com [--confirm]");
    process.exit(1);
}

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!projectId || !clientEmail || !privateKey) {
    console.error("❌ Missing Firebase credentials in .env");
    process.exit(1);
}
if (!stripeSecretKey) {
    console.error("❌ Missing STRIPE_SECRET_KEY in .env");
    process.exit(1);
}

privateKey = privateKey.replace(/\\n/g, '\n');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
}

const db = admin.firestore();
const stripe = new Stripe(stripeSecretKey, { apiVersion: "2024-12-18.acacia" });

const PER_PROPERTY_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PER_PROPERTY || "price_1U3Mz0AQjADCPHYI78fGzKdq";

async function run() {
    if (stripeSecretKey.startsWith("sk_live_")) {
        console.log("⚠️  LIVE Stripe mode — this will affect a real subscription.\n");
    }

    const snap = await db.collection("users").where("email", "==", email).get();
    if (snap.empty) {
        console.error(`❌ No user found with email: ${email}`);
        process.exit(1);
    }

    const doc = snap.docs[0];
    const data = doc.data();
    const sub = data.subscription || {};

    console.log(`📧 ${email} (uid: ${doc.id})`);
    console.log(`   Current tier: ${sub.tier || 'n/a'}, status: ${sub.status || 'n/a'}`);

    const plan = await planSwitch(db, stripe, doc);

    if (plan.skip) {
        console.error(`❌ ${plan.skip}`);
        process.exit(1);
    }

    if (plan.mode === "firestore-only") {
        console.log(`\n   Plan: no Stripe subscription attached — this is a manually-flagged tier, not real billing.`);
        console.log(`   Firestore: subscription.tier "${plan.fromTier}" -> "per-property" (no Stripe call, no charge)\n`);
    } else {
        console.log(`\n   Plan: switch subscription item ${plan.itemId} to price ${PER_PROPERTY_PRICE_ID}, quantity ${plan.quantity} (${plan.propertyCount} propert${plan.propertyCount === 1 ? 'y' : 'ies'})`);
        console.log(`   Billing: takes effect at next renewal — no immediate charge/credit (proration_behavior: "none")`);
        console.log(`   Firestore: subscription.tier "${plan.fromTier}" -> "per-property"\n`);
    }

    if (!CONFIRM) {
        console.log("🔎 Dry run only — nothing changed. Re-run with --confirm to execute.");
        process.exit(0);
    }

    await executeSwitch(db, stripe, plan, PER_PROPERTY_PRICE_ID);

    console.log(plan.mode === "firestore-only"
        ? "✅ Done — Firestore tier flipped to per-property. No billing was touched."
        : "✅ Done — switched to per-property billing, effective next renewal.");
}

run().catch(err => {
    console.error("❌ Script failed:", err);
    process.exit(1);
});
