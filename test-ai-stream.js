const { createGoogleGenerativeAI } = require("@ai-sdk/google");
require('dotenv').config({ path: '.env.local' });
require('dotenv').config({ path: '.env' });
const { streamText } = require("ai");

async function test() {
    try {
        const google = createGoogleGenerativeAI({
            apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
        });
        
        const model = google("gemini-2.5-flash");
        
        const result = streamText({
            model: model,
            system: "Test",
            messages: [{ role: "user", content: "hello" }]
        });
        console.log("Stream init success");
        
        const stream = result.toUIMessageStreamResponse();
        console.log("Stream converted successfully");
    } catch(e) {
        console.error("SDK INIT ERROR:", e);
    }
}
test();
