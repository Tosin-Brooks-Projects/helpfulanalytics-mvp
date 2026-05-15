import { db } from "@/lib/firebase-admin";
import { Resend } from "resend";
import { runReport } from "@/lib/analytics/ga4";
import { buildDailySummaryEmail } from "./templates";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
});

interface ProcessedUserEmailResult {
    userId: string;
    email: string;
    success: boolean;
    sent: boolean;
    reason?: string;
}

/**
 * Helper to refresh a stored Google OAuth refresh token.
 * Returns fresh accessToken, expiresAt timestamp, and updated refreshToken (if rotated).
 */
async function refreshOfflineAccessToken(refreshToken: string) {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        throw new Error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in environment variables.");
    }

    const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            grant_type: "refresh_token",
            refresh_token: refreshToken,
        }),
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Google Token Refresh Failed: ${JSON.stringify(data)}`);
    }

    return {
        accessToken: data.access_token,
        expiresAt: Math.floor(Date.now() / 1000) + data.expires_in,
        refreshToken: data.refresh_token || refreshToken, // Use new one if rotated
    };
}

/**
 * Processes a single user:
 * 1. Refreshes Google tokens
 * 2. Gathers data for all properties
 * 3. Synthesizes insights with Gemini
 * 4. Dispatches Resend email
 * 5. Updates Firestore tracking
 */
export async function processAndSendUserAnalyticsEmail(
    userId: string,
    userData: any,
    dryRun = false
): Promise<ProcessedUserEmailResult> {
    const resendKey = process.env.RESEND_API_KEY;
    if (!resendKey) {
        return { userId, email: userData.email, success: false, sent: false, reason: "Missing RESEND_API_KEY" };
    }

    const resend = new Resend(resendKey);

    try {
        // 1. Validate & Load Google Tokens
        const refreshToken = userData.tokens?.google?.refreshToken;
        if (!refreshToken) {
            return { userId, email: userData.email, success: false, sent: false, reason: "User has no offline Google refresh token stored" };
        }

        // Always refresh to guarantee a live window
        console.log(`[Email Agent] Refreshing Google token for user ${userId}...`);
        const tokenInfo = await refreshOfflineAccessToken(refreshToken);

        // Save new tokens back to DB for future runs
        if (!dryRun) {
            await db.collection("users").doc(userId).set({
                tokens: {
                    google: {
                        accessToken: tokenInfo.accessToken,
                        expiresAt: tokenInfo.expiresAt,
                        refreshToken: tokenInfo.refreshToken,
                    }
                }
            }, { merge: true });
        }

        // 2. Fetch Connected Properties
        const propertiesSnap = await db.collection("users").doc(userId).collection("properties").get();
        const properties = propertiesSnap.docs.map(doc => doc.data());

        if (properties.length === 0) {
            return { userId, email: userData.email, success: true, sent: false, reason: "No connected properties found for this user" };
        }

        // 3. Fetch Yesterday's Statistics for all properties
        const propertySummaries: Array<{ propertyName: string; sessions: number; users: number; bounceRate: number }> = [];

        console.log(`[Email Agent] Gathering GA4 analytics for ${properties.length} properties...`);
        for (const prop of properties) {
            try {
                const propertyId = prop.id;
                const response = await runReport(tokenInfo.accessToken, propertyId, {
                    dateRanges: [{ startDate: "yesterday", endDate: "yesterday" }],
                    metrics: [
                        { name: "sessions" },
                        { name: "activeUsers" },
                        { name: "bounceRate" }
                    ]
                });

                const row = response.rows?.[0];
                const sessions = parseInt(row?.metricValues?.[0]?.value || "0", 10);
                const users = parseInt(row?.metricValues?.[1]?.value || "0", 10);
                const bounceRate = parseFloat(row?.metricValues?.[2]?.value || "0.0");

                propertySummaries.push({
                    propertyName: prop.name || "Unknown Property",
                    sessions,
                    users,
                    bounceRate
                });
            } catch (err: any) {
                console.warn(`[Email Agent] Failed fetching analytics for property ${prop.id}:`, err?.message || err);
                // Skip or insert placeholder? We will skip to not skew analytics, or just use zeros
                propertySummaries.push({
                    propertyName: prop.name || "Unknown Property",
                    sessions: 0,
                    users: 0,
                    bounceRate: 0
                });
            }
        }

        // 4. Gemini Synthesis: Formulate Kea's analysis
        console.log(`[Email Agent] Triggering Gemini analysis for user ${userId}...`);

        // Build statistical prompt context
        const statsJson = JSON.stringify(propertySummaries, null, 2);
        const prompt = `
            Analyze yesterday's analytics for my web properties and give me a daily summary. 
            Keep it snappy, actionable, and tailored for a short email readout.

            Properties Data:
            ${statsJson}
            
            Rules:
            - Talk as Kea (Warm, not robotic; Direct, not corporate; Confident, witty, and action-oriented).
            - Do not say "Sure, here's your summary!" Just jump into it.
            - Use HTML formatting tags: Wrap paragraphs in <p>, use <strong> for key numbers or phrases, use <ul> and <li> for short bullet-point ideas. Avoid markdown.
            - Focus on the property doing best, or suggest what needs attention.
            - Keep the total length under 3 short paragraphs or lists.
        `;

        const systemInstruction = `
            You are Kea — the sharp, warm, slightly witty friend who is a fluent marketing and analytics expert.
            Your voice is extremely human. You never sound corporate. You always focus on action.
            Return ONLY valid HTML formatted content.
        `;

        const geminiResponse = await generateText({
            model: google("gemini-2.5-flash"),
            system: systemInstruction,
            prompt: prompt
        });

        const insightsHtml = geminiResponse.text || "<p>Looks like a standard day on your properties. Keep an eye on traffic spikes throughout tomorrow!</p>";

        // 5. Build Meta Params (Trial tracking, etc.)
        const now = new Date();
        const todayString = now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
        
        // Calculate trial logic
        const isPaid = userData.subscription?.status === "active" || userData.subscriptionStatus === "premium";
        const createdAt = userData.createdAt?.toDate ? userData.createdAt.toDate() : new Date(userData.createdAt || Date.now());
        const diffTime = Math.abs(now.getTime() - createdAt.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const trialDaysLeft = Math.max(0, 30 - diffDays);

        const baseUrl = process.env.NEXTAUTH_URL || "https://helpfulanalytics.com";

        const emailHtml = buildDailySummaryEmail({
            userName: userData.name || "There",
            todayString,
            trialDaysLeft,
            isPaid,
            insightsHtml,
            propertySummaries,
            baseUrl
        });

        if (dryRun) {
            console.log(`[Email Agent] DRY RUN COMPLETE for ${userData.email}. Target HTML generated.`);
            return { userId, email: userData.email, success: true, sent: false, reason: "Dry Run execution completed successfully" };
        }

        // 6. Send via Resend
        let fromEmail = "Kea <no-reply@helpfulanalytics.com>";
        try {
            const settingsDoc = await db.collection("admin_settings").doc("global").get();
            if (settingsDoc.exists && settingsDoc.data()?.reportFromEmail) {
                fromEmail = settingsDoc.data()?.reportFromEmail;
            }
        } catch {}

        console.log(`[Email Agent] Dispatching email via Resend to ${userData.email}...`);
        const sendResponse = await resend.emails.send({
            from: fromEmail,
            to: userData.email,
            subject: `✦ Kea's Summary: Yesterday's Analytics (${todayString})`,
            html: emailHtml,
        });

        if (sendResponse.error) {
            throw new Error(`Resend API Error: ${JSON.stringify(sendResponse.error)}`);
        }

        // 7. Save Success State
        await db.collection("users").doc(userId).set({
            lastSentEmailAt: new Date(),
            trialEmailCount: (userData.trialEmailCount || 0) + 1
        }, { merge: true });

        return { userId, email: userData.email, success: true, sent: true };
    } catch (err: any) {
        console.error(`[Email Agent] Process exception for ${userData.email}:`, err);
        return { userId, email: userData.email, success: false, sent: false, reason: err?.message || "Unknown exception" };
    }
}
