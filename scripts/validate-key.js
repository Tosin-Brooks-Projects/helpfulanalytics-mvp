const admin = require("firebase-admin");
const fs = require('fs');
const path = require('path');

// Load .env manually to avoid dotenv dependency issues if not installed
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
    } else {
        console.warn("⚠️ No .env file found");
    }
} catch (e) {
    console.error("Error loading .env:", e);
}

const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (!privateKey) {
    console.error("❌ FIREBASE_PRIVATE_KEY is missing from environment variables.");
    process.exit(1);
}

console.log("\n--- Validating Private Key ---");
console.log("Raw Key Length:", privateKey.length);
console.log("First 20 chars:", privateKey.substring(0, 20));
console.log("Last 20 chars:", privateKey.substring(privateKey.length - 20));

try {
    let normalizedKey = privateKey;

    // 1. Handle Vercel's potential double-escaping
    normalizedKey = normalizedKey.replace(/\\n/g, '\n').replace(/\r/g, '');

    // 2. Extract PEM block
    const pemMatch = normalizedKey.match(/-----BEGIN(?: RSA)? PRIVATE KEY-----[\s\S]+?-----END(?: RSA)? PRIVATE KEY-----/);

    if (pemMatch) {
        normalizedKey = pemMatch[0];
        console.log("✅ Regex found valid PEM block.");
    } else {
        console.warn("⚠️ Regex FAILED to find PEM block. Attempting fallback.");
        if (normalizedKey.startsWith('"') && normalizedKey.endsWith('"')) {
            normalizedKey = normalizedKey.slice(1, -1);
        }
    }

    console.log("Normalized Key Length:", normalizedKey.length);
    console.log("Contains newlines:", normalizedKey.includes('\n'));

    // Try to initialize (mocking other creds)
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: "test-project",
            clientEmail: "test@example.com",
            privateKey: normalizedKey,
        }),
    });

    console.log("✅ SUCCESS: Private Key parsed correctly by Firebase Admin!");
} catch (error) {
    console.error("❌ FAILURE: Parsing failed.");
    console.error(error);
    console.log("\n--- Diagnosis ---");
    console.log("The message 'Unparsed DER bytes' means the key content is corrupted.");
    console.log("Recommendation: Regenerate usage private key in Firebase Console and update .env.");
}
