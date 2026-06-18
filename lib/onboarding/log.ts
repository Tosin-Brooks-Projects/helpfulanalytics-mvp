import { db } from "@/lib/firebase-admin"
import { Resend } from "resend"

const ALERT_EMAIL = "allioluwatosin8@gmail.com"

export type OnboardingLogEvent = {
    userId?: string | null
    email?: string | null
    step: string
    status: "info" | "error"
    message?: string
    meta?: Record<string, any>
}

export async function logOnboardingEvent(event: OnboardingLogEvent) {
    const entry = {
        userId: event.userId || null,
        email: event.email || null,
        step: event.step,
        status: event.status,
        message: event.message || null,
        meta: event.meta || null,
        createdAt: new Date(),
    }

    console[event.status === "error" ? "error" : "log"](`[Onboarding] ${event.step}`, entry)

    try {
        await db.collection("onboarding_logs").add(entry)
    } catch (e) {
        console.error("[Onboarding] Failed to write log entry:", e)
    }

    if (event.status === "error") {
        await sendOnboardingErrorAlert(entry)
    }
}

async function sendOnboardingErrorAlert(entry: Record<string, any>) {
    const key = process.env.RESEND_API_KEY
    if (!key) {
        console.error("[Onboarding] Cannot send error alert, RESEND_API_KEY missing")
        return
    }

    try {
        const resend = new Resend(key)
        const html = `
            <h2>Onboarding error</h2>
            <p><strong>Step:</strong> ${entry.step}</p>
            <p><strong>User:</strong> ${entry.email || "unknown"} ${entry.userId ? `(${entry.userId})` : ""}</p>
            <p><strong>Message:</strong> ${entry.message || "n/a"}</p>
            <pre style="background:#f4f4f5;padding:12px;border-radius:8px;white-space:pre-wrap;">${JSON.stringify(entry.meta || {}, null, 2)}</pre>
            <p style="color:#888;font-size:12px;">${entry.createdAt?.toISOString?.() || new Date().toISOString()}</p>
        `
        await resend.emails.send({
            from: "Onboarding Alerts <no-reply@helpfulanalytics.com>",
            to: ALERT_EMAIL,
            subject: `Onboarding error: ${entry.step}`,
            html,
        })
    } catch (e) {
        console.error("[Onboarding] Failed to send error alert email:", e)
    }
}
