
const fs = require('fs');

const privateKey = process.env.FIREBASE_PRIVATE_KEY || "";

const envContent = `FIREBASE_CLIENT_EMAIL="firebase-adminsdk-fbsvc@gen-lang-client-0785730442.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="${privateKey}"
FIREBASE_PROJECT_ID="gen-lang-client-0785730442"
GOOGLE_CLIENT_ID="550909108668-rbalvso0ede9joib8j52oeqndj45u4pl.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="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"
GOOGLE_REDIRECT_URI="http://localhost:3000/api/auth/callback/google"
NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyC6ZBWnHdJ-py_io5eaZm2PuvE45WW4OqE"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="ga4dashboard-491d6.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="ga4dashboard-491d6"
NEXTAUTH_SECRET="secret"
NEXTAUTH_URL="http://localhost:3000"


STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
GEMINI_API_KEY=AIzaSy...
RESEND_API_KEY=re_...

`;

fs.writeFileSync('.env', envContent);
console.log('Successfully wrote .env with correct escaping');
