import "server-only"

import admin from "firebase-admin"

const projectId = process.env.FIREBASE_PROJECT_ID
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
const privateKey = process.env.FIREBASE_PRIVATE_KEY

if (!admin.apps.length) {
    if (projectId && clientEmail && privateKey) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey: privateKey.replace(/\\n/g, "\n"),
                }),
            })
        } catch (error) {
            console.error("Firebase Admin initialization failed:", error)
        }
    } else {
        // Only log warning in development or if explicitly debugged, to avoid noise in build logs if expected
        if (process.env.NODE_ENV !== 'production') {
            console.warn("Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY. Skipping Firebase Admin initialization.")
        }
    }
}

// Export lazily or conditionally to avoid build crashes if init failed
export const db = admin.apps.length ? admin.firestore() : ({} as admin.firestore.Firestore)
export const auth = admin.apps.length ? admin.auth() : ({} as admin.auth.Auth)
