const { createGoogleGenerativeAI } = require("@ai-sdk/google");
require('dotenv').config();

async function test() {
    try {
        const google = createGoogleGenerativeAI({
            apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
        });
        
        const model = google("gemini-1.5-flash");
        console.log("Model initialized successfully.");
    } catch(e) {
        console.error("SDK INIT ERROR:", e);
    }
}
test();
