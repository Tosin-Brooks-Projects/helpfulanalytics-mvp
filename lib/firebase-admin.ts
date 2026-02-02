import "server-only"

import admin from "firebase-admin"

const projectId = process.env.FIREBASE_PROJECT_ID
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
const privateKey = process.env.FIREBASE_PRIVATE_KEY

if (!admin.apps.length) {
    if (projectId && clientEmail && privateKey) {
        try {
            // Robust private key parsing
            let normalizedKey = privateKey;

            // 1. Handle Vercel's potential double-escaping of newlines and carriage returns
            normalizedKey = normalizedKey.replace(/\\n/g, '\n').replace(/\r/g, '');

            // 2. Extract PEM block with permissive regex (handles RSA or generic header)
            const pemMatch = normalizedKey.match(/-----BEGIN(?: RSA)? PRIVATE KEY-----[\s\S]+?-----END(?: RSA)? PRIVATE KEY-----/);

            if (pemMatch) {
                normalizedKey = pemMatch[0];
            } else {
                console.warn("⚠️ Regex failed to match PEM block. Attempting fallback cleanup.");
                if (normalizedKey.startsWith('"') && normalizedKey.endsWith('"')) {
                    normalizedKey = normalizedKey.slice(1, -1);
                }
            }

            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey: normalizedKey,
                }),
            })
            console.log("✅ Firebase Admin initialized successfully.")
        } catch (error) {
            console.error("❌ Firebase Admin initialization failed:", error)
            // Log key format details for debugging (masked)
            if (privateKey) {
                console.error("Debug - Private Key Length:", privateKey.length);
                console.error("Debug - Starts with check:", privateKey.startsWith("-----BEGIN PRIVATE KEY-----"));
                console.error("Debug - Ends with check:", privateKey.endsWith("-----END PRIVATE KEY-----"));
                console.error("Debug - Contains \\n literal:", privateKey.includes("\\n"));
            }
        }
    } else {
        // Only log warning in development or if explicitly debugged, to avoid noise in build logs if expected
        if (process.env.NODE_ENV !== 'production') {
            console.warn("Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY. Skipping Firebase Admin initialization.")
        }
    }
}

// Export lazily or conditionally to avoid build crashes if init failed
export const db = admin.apps.length ? admin.firestore() : new Proxy({} as admin.firestore.Firestore, {
    get: (_target, prop) => {
        if (prop === 'then') return undefined; // Make it not a Promise
        throw new Error("Firebase Admin not initialized. Check server logs for failed initialization.");
    }
});
export const auth = admin.apps.length ? admin.auth() : ({} as admin.auth.Auth)
