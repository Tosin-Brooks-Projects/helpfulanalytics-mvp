const { createGoogleGenerativeAI } = require("@ai-sdk/google");
const { streamText } = require("ai");

async function test() {
    try {
        const google = createGoogleGenerativeAI({
            apiKey: "mock-key",
        });
        const result = streamText({
            model: google("gemini-1.5-flash"),
            system: "Test",
            messages: [{ role: "user", content: "hello" }]
        });
        
        console.log("PROTO METHODS:", Object.getOwnPropertyNames(Object.getPrototypeOf(result)));
    } catch(e) {
        console.error("ERROR:", e);
    }
}
test();
