
// dotenv loaded via node --env-file
console.log("RAW KEY:", JSON.stringify(process.env.FIREBASE_PRIVATE_KEY));
const key = process.env.FIREBASE_PRIVATE_KEY;
const replaced = key.replace(/\\n/g, "\n");
console.log("REPLACED LENGTH:", replaced.length);
console.log("FIRST 50 CHARS:", replaced.substring(0, 50));
