
// dotenv loaded via node --env-file

const admin = require('firebase-admin');

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

console.log("Checking Env Vars:");
console.log("ProjectId:", projectId);
console.log("ClientEmail:", clientEmail);
console.log("PrivateKey Length:", privateKey ? privateKey.length : 0);

try {
    if (!admin.apps.length) {
        if (projectId && clientEmail && privateKey) {
            console.log("Initializing Firebase Admin...");
            admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey: privateKey.replace(/\\n/g, "\n"),
                }),
            });
            console.log("Firebase Admin initialized successfully.");
        } else {
            console.log("Missing env vars.");
        }
    }

    const db = admin.firestore();
    console.log("Firestore instance created.");

    // Try a simple read
    db.listCollections().then(cols => console.log("Collections:", cols.map(c => c.id))).catch(e => console.error("Read failed:", e));

} catch (error) {
    console.error("Firebase initialization failed:", error);
}
