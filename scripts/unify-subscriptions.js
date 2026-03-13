const admin = require("firebase-admin");
const fs = require('fs');
const path = require('path');

// 1. Setup Environment
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

// 2. Initialize Firebase
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
        credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
        }),
    });
}

const db = admin.firestore();

async function unifySubscriptions() {
    console.log("🚀 Starting subscription unification...");
    
    const usersSnap = await db.collection("users").get();
    console.log(`Found ${usersSnap.size} users.`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const doc of usersSnap.docs) {
        const data = doc.data();
        const sub = data.subscription;

        // Condition: Status is "active" but there is NO Stripe subscription ID
        // This means it was one of the hardcoded defaults we are now removing.
        if (sub && sub.status === "active" && !sub.stripeSubscriptionId) {
            console.log(`Updating user ${doc.id} (${data.email || 'no email'}): resetting status to "free"`);
            
            await doc.ref.set({
                subscription: {
                    status: "free"
                }
            }, { merge: true });
            
            updatedCount++;
        } else {
            skippedCount++;
        }
    }

    console.log("\n--- Unification Complete ---");
    console.log(`Total Users Processed: ${usersSnap.size}`);
    console.log(`Users Reset to Free: ${updatedCount}`);
    console.log(`Users Skipped (Correct State): ${skippedCount}`);
    console.log("----------------------------\n");
}

unifySubscriptions().catch(err => {
    console.error("❌ Script failed:", err);
    process.exit(1);
});
