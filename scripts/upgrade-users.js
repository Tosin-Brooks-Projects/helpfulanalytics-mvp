const admin = require("firebase-admin");
const fs = require('fs');
const path = require('path');

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

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
let privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!projectId || !clientEmail || !privateKey) {
    console.error("❌ Missing Firebase credentials in .env");
    process.exit(1);
}

privateKey = privateKey.replace(/\\n/g, '\n');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    });
}

const db = admin.firestore();

const EMAILS_TO_UPGRADE = [
    "support@konetiq.com",
];

const TARGET_TIER = "pro";
const TARGET_STATUS = "active";
// Set period end 1 year from now
const PERIOD_END = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

async function upgradeUsers() {
    console.log(`\n🚀 Upgrading ${EMAILS_TO_UPGRADE.length} users to ${TARGET_TIER.toUpperCase()}...\n`);

    for (const email of EMAILS_TO_UPGRADE) {
        const snap = await db.collection("users").where("email", "==", email).get();

        if (snap.empty) {
            console.log(`⚠️  No user found with email: ${email}`);
            continue;
        }

        const doc = snap.docs[0];
        const existing = doc.data().subscription || {};

        console.log(`📧 ${email} (uid: ${doc.id})`);
        console.log(`   Before: tier=${existing.tier || 'n/a'}, status=${existing.status || 'n/a'}`);

        await doc.ref.set({
            subscription: {
                tier: TARGET_TIER,
                status: TARGET_STATUS,
                stripeCurrentPeriodEnd: PERIOD_END,
            }
        }, { merge: true });

        console.log(`   After:  tier=${TARGET_TIER}, status=${TARGET_STATUS}, periodEnd=${PERIOD_END.toISOString()}`);
        console.log(`   ✅ Done\n`);
    }

    console.log("--- Upgrade complete ---\n");
}

upgradeUsers().catch(err => {
    console.error("❌ Script failed:", err);
    process.exit(1);
});
