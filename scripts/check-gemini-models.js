const https = require('https');
const fs = require('fs');
const path = require('path');

// Load env
const envPath = path.resolve(__dirname, '../.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const match = envContent.match(/GEMINI_API_KEY=(.+)/);

if (!match) {
    console.error("GEMINI_API_KEY not found in .env");
    process.exit(1);
}

const key = match[1].trim();
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`;

console.log("Fetching models from:", url.replace(key, "KEY_HIDDEN"));

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.models) {
                console.log("\nAvailable Models:");
                json.models.forEach(m => {
                    console.log(`- ${m.name} (${m.displayName}) - input: ${m.inputTokenLimit}, output: ${m.outputTokenLimit}, methods: ${m.supportedGenerationMethods}`);
                });
            } else {
                console.log("Response:", json);
            }
        } catch (e) {
            console.error("Error parsing JSON:", e);
            console.log("Raw body:", data);
        }
    });
}).on('error', (err) => {
    console.error("Error fetching models:", err);
});
