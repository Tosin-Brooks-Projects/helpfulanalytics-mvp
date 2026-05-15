import { NextResponse } from "next/server";
import { db } from "@/lib/firebase-admin";
import { processAndSendUserAnalyticsEmail } from "@/lib/email/email-service";

export const dynamic = "force-dynamic";

/**
 * GET /api/cron/email-agent
 * The autonomous engine that scans active users and triggers emailing summaries.
 * Expected headers: Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    
    // Dry-run and direct debug parameters
    const dryRun = searchParams.get("dryRun") === "true";
    const debugUserId = searchParams.get("userId"); 
    const forceAll = searchParams.get("forceAll") === "true";

    // 1. Security check
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    // Allow executing if local/development and secret is not set, OR verify Bearer token.
    const isProduction = process.env.NODE_ENV === "production";
    
    if (isProduction || cronSecret) {
        if (!authHeader || !authHeader.startsWith("Bearer ") || authHeader.split(" ")[1] !== cronSecret) {
            return NextResponse.json({ error: "Unauthorized. Missing or invalid CRON_SECRET token." }, { status: 401 });
        }
    }

    try {
        const startTime = Date.now();
        
        // 2. Retrieve Users
        let query = db.collection("users");
        let usersSnap;

        if (debugUserId) {
            // Fast debug mode for single user
            const doc = await db.collection("users").doc(debugUserId).get();
            if (!doc.exists) {
                return NextResponse.json({ error: `User ${debugUserId} not found.` }, { status: 404 });
            }
            const result = await processAndSendUserAnalyticsEmail(doc.id, doc.data(), dryRun);
            return NextResponse.json({
                status: "debug_complete",
                dryRun,
                results: [result]
            });
        }

        // Standard scheduler flow
        usersSnap = await query.get();
        const now = new Date();
        const utcDayStr = now.toISOString().split("T")[0]; // current UTC day

        const eligibleUsers: Array<{ id: string; data: any }> = [];

        // 3. Filter active users whose timezone preferences match right now
        for (const doc of usersSnap.docs) {
            const data = doc.data();
            const frequency = data.emailFrequency || "daily"; // Default to daily

            if (frequency === "never") continue;

            // Check timezone matching
            const userTimezone = data.emailTimezone || "America/New_York";
            const preferredHour = typeof data.emailPreferredHour === "number" ? data.emailPreferredHour : 18; // Default 6 PM (18:00)

            // Calculate user's current local hour
            let localHour = 18;
            try {
                const formatter = new Intl.DateTimeFormat("en-US", {
                    timeZone: userTimezone,
                    hour: "numeric",
                    hour12: false
                });
                localHour = parseInt(formatter.format(now), 10);
            } catch (err) {
                console.warn(`[Email Scheduler] Timezone parsing failed for ${userTimezone}, using default.`);
            }

            // Ensure they haven't been sent an email today
            const lastSent = data.lastSentEmailAt?.toDate ? data.lastSentEmailAt.toDate() : (data.lastSentEmailAt ? new Date(data.lastSentEmailAt) : null);
            let sentToday = false;
            if (lastSent) {
                // Compare formatted dates in user timezone (simplification: just UTC calendar day comparison)
                const lastSentDayStr = lastSent.toISOString().split("T")[0];
                if (lastSentDayStr === utcDayStr) {
                    sentToday = true;
                }
            }

            // Check logic conditions
            const isCorrectHour = localHour === preferredHour;
            
            if (forceAll || (isCorrectHour && !sentToday)) {
                eligibleUsers.push({ id: doc.id, data });
            }
        }

        console.log(`[Email Scheduler] Found ${eligibleUsers.length} users matching conditions (Hour = Match, SentToday = False).`);

        if (eligibleUsers.length === 0) {
            return NextResponse.json({
                status: "idle",
                message: "No users matched criteria for email dispatch in this hour block.",
                scannedCount: usersSnap.size,
                timestamp: now.toISOString()
            });
        }

        // 4. Process batch with voluntary timeout interruption
        const results = [];
        let partialInterruption = false;
        const TIMEOUT_LIMIT_MS = 22000; // 22 seconds threshold

        for (let i = 0; i < eligibleUsers.length; i++) {
            const u = eligibleUsers[i];
            
            // Before processing, check if we are nearing the 30s external timeout limit
            if ((Date.now() - startTime) > TIMEOUT_LIMIT_MS) {
                console.warn(`[Email Scheduler] VOLUNTARY TIMEOUT INTERRUPT: Execution near ${TIMEOUT_LIMIT_MS}ms limit. Gracefully suspending batch.`);
                partialInterruption = true;
                break;
            }

            try {
                const res = await processAndSendUserAnalyticsEmail(u.id, u.data, dryRun);
                results.push(res);
            } catch (err: any) {
                results.push({
                    userId: u.id,
                    email: u.data.email,
                    success: false,
                    sent: false,
                    reason: `Dispatcher exception: ${err?.message || err}`
                });
            }
        }

        const endTime = Date.now();
        return NextResponse.json({
            status: partialInterruption ? "partial_complete" : "success",
            dryRun,
            elapsedMs: endTime - startTime,
            timestamp: now.toISOString(),
            scannedCount: usersSnap.size,
            matchedCount: eligibleUsers.length,
            processedCount: results.length,
            remainingCount: eligibleUsers.length - results.length,
            suspendedEarly: partialInterruption,
            results
        });

    } catch (error: any) {
        console.error("[Email Scheduler] CRITICAL SCHEDULER EXCEPTION:", error);
        return NextResponse.json({ error: "Internal Scheduler Error", message: error?.message || error }, { status: 500 });
    }
}
