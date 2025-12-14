import "server-only"

import admin from "firebase-admin"

if (!admin.apps.length) {
    if (process.env.FIREBASE_PROJECT_ID) {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
            }),
        })
    } else {
        console.warn("Missing FIREBASE_PROJECT_ID, skipping Firebase Admin initialization.")
    }
}

// Export lazily or conditionally to avoid build crashes if init failed
export const db = admin.apps.length ? admin.firestore() : ({} as admin.firestore.Firestore)
export const auth = admin.apps.length ? admin.auth() : ({} as admin.auth.Auth)
