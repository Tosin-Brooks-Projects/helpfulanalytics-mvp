// Migrates EVERY legacy-tier subscriber (Starter/Pro/Agency/Enterprise) onto
// the per-property billing model, at each account's current property count.
//
// This changes real customers' bills. Some will pay less, some more,
// depending on their property count. Always run without --confirm first
// and read the full report before re-running with --confirm.
//
// Accounts with a real Stripe subscription: price swapped on the existing
// subscription item, effective at their NEXT renewal (proration_behavior:
// "none" — no immediate charge/credit).
//
// Accounts with no Stripe subscription (manually-flagged/comp accounts):
// just flips subscription.tier in Firestore, no billing touched.
//
// Usage:
//   node scripts/migrate-all-legacy-to-per-property.js            (dry run — prints the full plan, changes nothing)
//   node scripts/migrate-all-legacy-to-per-property.js --confirm  (actually executes, one account at a time)

const admin = require("firebase-admin");
const Stripe = require("stripe");
const fs = require('fs');
const path = require('path');
const { LEGACY_TIER_TITLES, planSwitch, executeSwitch } = require("./lib/switch-account");

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

const CONFIRM = process.argv.includes('--confirm');

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
        console.log("⚠️  LIVE Stripe mode — this will affect real subscriptions.\n");
    }

    const snap = await db.collection("users")
        .where("subscription.tier", "in", LEGACY_TIER_TITLES)
        .get();

    if (snap.empty) {
        console.log("No legacy-tier accounts found. Nothing to do.");
        return;
    }

    console.log(`Found ${snap.size} legacy-tier account(s).\n`);

    const plans = [];
    for (const doc of snap.docs) {
        try {
            const plan = await planSwitch(db, stripe, doc);
            plans.push(plan);
        } catch (err) {
            plans.push({ userId: doc.id, email: doc.data().email, error: err.message });
        }
    }

    const toSwitch = plans.filter(p => !p.skip && !p.error);
    const skipped = plans.filter(p => p.skip);
    const errored = plans.filter(p => p.error);

    for (const p of toSwitch) {
        if (p.mode === "firestore-only") {
            console.log(`📧 ${p.email} (${p.userId}) — "${p.fromTier}" -> per-property, Firestore-only (no Stripe subscription, no charge)`);
        } else {
            console.log(`📧 ${p.email} (${p.userId}) — "${p.fromTier}" -> per-property, qty ${p.quantity} (${p.propertyCount} propert${p.propertyCount === 1 ? 'y' : 'ies'}), effective next renewal`);
        }
    }
    for (const p of skipped) {
        console.log(`⏭  ${p.email} (${p.userId}) — skipped: ${p.skip}`);
    }
    for (const p of errored) {
        console.log(`⚠️  ${p.email || p.userId} — could not plan: ${p.error}`);
    }

    console.log(`\nSummary: ${toSwitch.length} to switch, ${skipped.length} skipped, ${errored.length} errored while planning.`);

    if (!CONFIRM) {
        console.log("\n🔎 Dry run only — nothing changed. Re-run with --confirm to execute.");
        return;
    }

    console.log("\nExecuting...\n");
    let succeeded = 0;
    let failed = 0;
    for (const p of toSwitch) {
        try {
            await executeSwitch(db, stripe, p, PER_PROPERTY_PRICE_ID);
            console.log(`✅ ${p.email} (${p.userId}) switched.`);
            succeeded++;
        } catch (err) {
            console.log(`❌ ${p.email} (${p.userId}) failed: ${err.message}`);
            failed++;
        }
    }

    console.log(`\nDone. ${succeeded} switched, ${failed} failed, ${skipped.length} skipped.`);
}

run().catch(err => {
    console.error("❌ Script failed:", err);
    process.exit(1);
});
