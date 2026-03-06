import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { generateText, tool, createUIMessageStream, createUIMessageStreamResponse } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { z } from "zod"

import {
    getOverviewData,
    getTopPagesData,
    getDevicesData,
    getLocationsData,
    getAcquisitionData,
    getStatesData,
    getCitiesData,
    getRealtimeData,
} from "@/lib/analytics/ga4"

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
})

// ─── Demo / Mock Data ───────────────────────────────────────────

const DEMO_OVERVIEW = {
    metrics: {
        sessions: 12543,
        activeUsers: 8432,
        screenPageViews: 45210,
        bounceRate: 42.5,
        averageSessionDuration: 145,
    },
    trafficSources: [
        { name: "Organic Search", users: 4500 },
        { name: "Direct", users: 2100 },
        { name: "Referral", users: 1200 },
        { name: "Social", users: 632 },
    ],
    devices: [
        { name: "Mobile", users: 5120 },
        { name: "Desktop", users: 2800 },
        { name: "Tablet", users: 512 },
    ],
}

const DEMO_PAGES = {
    pages: [
        { pagePath: "/", pageTitle: "Home", pageViews: 15400, bounceRate: 35.2, avgTimeOnPage: 62, percentage: 34.1 },
        { pagePath: "/pricing", pageTitle: "Pricing", pageViews: 4500, bounceRate: 28.1, avgTimeOnPage: 120, percentage: 9.9 },
        { pagePath: "/blog/analytics-tips", pageTitle: "10 Analytics Tips", pageViews: 3200, bounceRate: 45.3, avgTimeOnPage: 185, percentage: 7.1 },
        { pagePath: "/features", pageTitle: "Features", pageViews: 2800, bounceRate: 32.0, avgTimeOnPage: 95, percentage: 6.2 },
        { pagePath: "/contact", pageTitle: "Contact", pageViews: 1200, bounceRate: 50.5, avgTimeOnPage: 42, percentage: 2.7 },
    ],
    totalPageViews: 45210,
}

const DEMO_SOURCES = {
    sources: [
        { source: "google", medium: "organic", sessions: 5200, users: 4500, newUsers: 3100, bounceRate: 38.2, percentage: 41.5 },
        { source: "(direct)", medium: "(none)", sessions: 2800, users: 2100, newUsers: 800, bounceRate: 42.1, percentage: 22.3 },
        { source: "facebook", medium: "social", sessions: 1500, users: 1200, newUsers: 950, bounceRate: 55.3, percentage: 12.0 },
        { source: "twitter", medium: "social", sessions: 800, users: 632, newUsers: 500, bounceRate: 60.1, percentage: 6.4 },
        { source: "linkedin", medium: "referral", sessions: 650, users: 520, newUsers: 410, bounceRate: 35.0, percentage: 5.2 },
    ],
    totalSessions: 12543,
}

const DEMO_DEVICES = {
    devices: [
        { deviceCategory: "mobile", sessions: 6500, users: 5120, bounceRate: 48.2, percentage: 51.8 },
        { deviceCategory: "desktop", sessions: 4800, users: 2800, bounceRate: 35.1, percentage: 38.3 },
        { deviceCategory: "tablet", sessions: 1243, users: 512, bounceRate: 40.5, percentage: 9.9 },
    ],
    browsers: [
        { browser: "Chrome", sessions: 7500, percentage: 59.8 },
        { browser: "Safari", sessions: 3200, percentage: 25.5 },
        { browser: "Firefox", sessions: 1100, percentage: 8.8 },
    ],
    totalSessions: 12543,
}

const DEMO_LOCATIONS = {
    countries: [
        { country: "United States", sessions: 5200, users: 4100, bounceRate: 38.5, percentage: 41.5 },
        { country: "United Kingdom", sessions: 2100, users: 1800, bounceRate: 40.2, percentage: 16.7 },
        { country: "Germany", sessions: 1200, users: 950, bounceRate: 42.1, percentage: 9.6 },
        { country: "Canada", sessions: 900, users: 720, bounceRate: 39.8, percentage: 7.2 },
        { country: "India", sessions: 850, users: 700, bounceRate: 55.3, percentage: 6.8 },
    ],
    totalSessions: 12543,
}

const DEMO_REALTIME = {
    activeUsers: 47,
    pages: [
        { path: "/", active: 18, title: "Home" },
        { path: "/pricing", active: 12, title: "Pricing" },
        { path: "/blog/analytics-tips", active: 8, title: "Blog Post" },
        { path: "/features", active: 6, title: "Features" },
        { path: "/docs", active: 3, title: "Documentation" },
    ],
}

function isDemoProperty(propertyId: string): boolean {
    return propertyId === "demo-property" || propertyId === ""
}

// ─── Message Format Converter ───────────────────────────────────

function convertToModelMessages(uiMessages: any[]): Array<{ role: string; content: string }> {
    const result: Array<{ role: string; content: string }> = []

    for (const msg of uiMessages) {
        if (msg.role === "user") {
            if (msg.content && msg.content.trim().length > 0) {
                result.push({ role: "user", content: msg.content })
            }
            continue
        }

        if (msg.role === "assistant") {
            let text = ""
            if (typeof msg.content === "string" && msg.content.trim().length > 0) {
                text = msg.content
            } else if (Array.isArray(msg.parts)) {
                text = msg.parts
                    .filter((p: any) => p.type === "text" && p.text)
                    .map((p: any) => p.text)
                    .join("\n")
            }
            if (text.trim().length > 0) {
                result.push({ role: "assistant", content: text })
            }
            continue
        }

        if (msg.content && typeof msg.content === "string" && msg.content.trim().length > 0) {
            result.push({ role: msg.role, content: msg.content })
        }
    }

    console.log("[Kea] Converting", uiMessages.length, "UI messages →", result.length, "model messages")
    return result
}

// ─── System Prompt ──────────────────────────────────────────────

function buildSystemPrompt(): string {
    return `You are Kea — a warm, sharp, and deeply human marketing analyst built into the Helpful Analytics dashboard.

## Who you are

You're not a chatbot. You're the smart friend who happens to be an analytics expert — the one people call when they're confused about a traffic drop or excited about a spike they don't understand yet.

## Your Agency (Tools)

You have tools connected to the user's live GA4 property. You MUST call your tools to fetch real data before answering any question about their site.

### Available Tools

| Tool | When to use it |
|------|---------------|
| getMetricsOverview | Overall performance: sessions, users, pageviews, bounce rate |
| getTrafficSources | Where traffic comes from: source/medium breakdown |
| getTopPages | Which pages are popular: pageviews, bounce rates |
| getDeviceBreakdown | What devices visitors use: mobile/desktop/tablet, browsers |
| getLocationData | Where visitors are located: country breakdown |
| getRealtimeSnapshot | Who's on the site right now: live active users |
| getTrafficByState | Regional traffic within a specific country |
| getTrafficByCity | City-level traffic within a specific country |

### CRITICAL RULES:
1. **ALWAYS call at least one tool** before answering a data question. Never guess or make up numbers.
2. If the question spans multiple data types, call MULTIPLE tools.
3. After receiving tool results, analyze the data and give actionable insights.
4. If a tool returns an error, tell the user honestly and suggest what they can do.

## Your voice

- **Warm, not robotic.** Open with something human.
- **Direct, not corporate.** Get to the point. No fluff.
- **Confident, not arrogant.** Have opinions. Share what you'd actually do.
- **Encouraging, not flattering.** Frame problems as fixable opportunities.

## Formatting rules

- Use **bold** for the single most important number or insight.
- Use short bullet points for data breakdowns.
- Keep responses to 3-6 short paragraphs max.
- Always end with a recommendation, next step, or question.
- Round percentages to 1 decimal place and format large numbers with commas.`
}

// ─── Build Tools ────────────────────────────────────────────────

function buildTools(isDemo: boolean, accessToken: string, propertyId: string) {
    return {
        getMetricsOverview: tool({
            description: "Fetch high-level GA4 metrics: total sessions, active users, pageviews, bounce rate, and average session duration for the selected date range.",
            parameters: z.object({
                startDate: z.string().describe("Start date in YYYY-MM-DD format"),
                endDate: z.string().describe("End date in YYYY-MM-DD format"),
            }),
            execute: async ({ startDate: qStart, endDate: qEnd }) => {
                console.log("[Kea Tool] getMetricsOverview called")
                if (isDemo) return DEMO_OVERVIEW
                try {
                    return await getOverviewData(accessToken, propertyId, qStart, qEnd)
                } catch (e: any) {
                    return { error: `Failed to fetch metrics: ${e?.message || "Unknown error"}` }
                }
            },
        }),

        getTrafficSources: tool({
            description: "Fetch top traffic acquisition sources with session counts, user counts, new users, bounce rates.",
            parameters: z.object({
                startDate: z.string().describe("Start date in YYYY-MM-DD format"),
                endDate: z.string().describe("End date in YYYY-MM-DD format"),
                limit: z.number().optional().describe("Number of sources to return. Default 10."),
            }),
            execute: async ({ startDate: qStart, endDate: qEnd, limit }) => {
                console.log("[Kea Tool] getTrafficSources called")
                if (isDemo) return DEMO_SOURCES
                try {
                    return await getAcquisitionData(accessToken, propertyId, qStart, qEnd, limit ?? 10)
                } catch (e: any) {
                    return { error: `Failed to fetch traffic sources: ${e?.message || "Unknown error"}` }
                }
            },
        }),

        getTopPages: tool({
            description: "Fetch the most visited pages on the site with pageviews, bounce rate, and avg time on page.",
            parameters: z.object({
                startDate: z.string().describe("Start date in YYYY-MM-DD format"),
                endDate: z.string().describe("End date in YYYY-MM-DD format"),
                limit: z.number().optional().describe("Number of pages to return. Default 10."),
            }),
            execute: async ({ startDate: qStart, endDate: qEnd, limit }) => {
                console.log("[Kea Tool] getTopPages called")
                if (isDemo) return DEMO_PAGES
                try {
                    return await getTopPagesData(accessToken, propertyId, qStart, qEnd, limit ?? 10)
                } catch (e: any) {
                    return { error: `Failed to fetch top pages: ${e?.message || "Unknown error"}` }
                }
            },
        }),

        getDeviceBreakdown: tool({
            description: "Fetch device category breakdown (mobile/desktop/tablet), top browsers, and OS distribution.",
            parameters: z.object({
                startDate: z.string().describe("Start date in YYYY-MM-DD format"),
                endDate: z.string().describe("End date in YYYY-MM-DD format"),
            }),
            execute: async ({ startDate: qStart, endDate: qEnd }) => {
                console.log("[Kea Tool] getDeviceBreakdown called")
                if (isDemo) return DEMO_DEVICES
                try {
                    return await getDevicesData(accessToken, propertyId, qStart, qEnd)
                } catch (e: any) {
                    return { error: `Failed to fetch device data: ${e?.message || "Unknown error"}` }
                }
            },
        }),

        getLocationData: tool({
            description: "Fetch geographic distribution of users by country with session counts and bounce rates.",
            parameters: z.object({
                startDate: z.string().describe("Start date in YYYY-MM-DD format"),
                endDate: z.string().describe("End date in YYYY-MM-DD format"),
                limit: z.number().optional().describe("Number of countries to return. Default 10."),
            }),
            execute: async ({ startDate: qStart, endDate: qEnd, limit }) => {
                console.log("[Kea Tool] getLocationData called")
                if (isDemo) return DEMO_LOCATIONS
                try {
                    return await getLocationsData(accessToken, propertyId, qStart, qEnd, limit ?? 10)
                } catch (e: any) {
                    return { error: `Failed to fetch location data: ${e?.message || "Unknown error"}` }
                }
            },
        }),

        getRealtimeSnapshot: tool({
            description: "Fetch real-time active users and which pages they are currently viewing.",
            parameters: z.object({}),
            execute: async () => {
                console.log("[Kea Tool] getRealtimeSnapshot called")
                if (isDemo) return DEMO_REALTIME
                try {
                    return await getRealtimeData(accessToken, propertyId)
                } catch (e: any) {
                    return { error: `Failed to fetch realtime data: ${e?.message || "Unknown error"}` }
                }
            },
        }),

        getTrafficByState: tool({
            description: "Fetch state/region level traffic breakdown within a specific country.",
            parameters: z.object({
                startDate: z.string().describe("Start date in YYYY-MM-DD format"),
                endDate: z.string().describe("End date in YYYY-MM-DD format"),
                country: z.string().optional().describe("Country to filter by. Defaults to 'United States'."),
                limit: z.number().optional().describe("Number of states to return. Default 10."),
            }),
            execute: async ({ startDate: qStart, endDate: qEnd, country, limit }) => {
                console.log("[Kea Tool] getTrafficByState called")
                if (isDemo) return { states: [{ state: "California", sessions: 2100, users: 1800 }, { state: "New York", sessions: 1500, users: 1200 }, { state: "Texas", sessions: 900, users: 750 }], totalSessions: 5200 }
                try {
                    return await getStatesData(accessToken, propertyId, qStart, qEnd, country ?? "United States", limit ?? 10)
                } catch (e: any) {
                    return { error: `Failed to fetch state data: ${e?.message || "Unknown error"}` }
                }
            },
        }),

        getTrafficByCity: tool({
            description: "Fetch city-level traffic breakdown within a specific country.",
            parameters: z.object({
                startDate: z.string().describe("Start date in YYYY-MM-DD format"),
                endDate: z.string().describe("End date in YYYY-MM-DD format"),
                country: z.string().optional().describe("Country to filter by. Defaults to 'United States'."),
                limit: z.number().optional().describe("Number of cities to return. Default 10."),
            }),
            execute: async ({ startDate: qStart, endDate: qEnd, country, limit }) => {
                console.log("[Kea Tool] getTrafficByCity called")
                if (isDemo) return { cities: [{ city: "New York", sessions: 800, users: 650 }, { city: "Los Angeles", sessions: 600, users: 480 }, { city: "Chicago", sessions: 400, users: 320 }], totalSessions: 5200 }
                try {
                    return await getCitiesData(accessToken, propertyId, qStart, qEnd, country ?? "United States", limit ?? 10)
                } catch (e: any) {
                    return { error: `Failed to fetch city data: ${e?.message || "Unknown error"}` }
                }
            },
        }),
    }
}

// ─── API Route ──────────────────────────────────────────────────

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return new Response("Unauthorized", { status: 401 })
    }

    let body: {
        propertyId: string
        startDate: string
        endDate: string
        messages: any[]
    }

    try {
        body = await request.json()
    } catch {
        return new Response("Invalid JSON body", { status: 400 })
    }

    const { messages, propertyId, startDate, endDate } = body

    if (!messages || messages.length === 0) {
        return new Response("No messages provided", { status: 400 })
    }

    const accessToken = (session as { accessToken?: string }).accessToken
    if (!accessToken) {
        return new Response("Google access token missing or expired. Please re-authenticate.", { status: 401 })
    }

    const isDemo = isDemoProperty(propertyId)
    const modelMessages = convertToModelMessages(messages)

    console.log("[Kea] Property:", propertyId, "| isDemo:", isDemo)

    try {
        // Use generateText (not streamText) — it reliably executes tools
        // with maxSteps, unlike streamText which has issues with @ai-sdk/google.
        const result = await generateText({
            model: google("gemini-2.5-flash"),
            system: buildSystemPrompt(),
            messages: modelMessages as any,
            maxSteps: 3,
            tools: buildTools(isDemo, accessToken, propertyId),
        })

        console.log("[Kea] generateText finished:", {
            textLen: result.text.length,
            steps: result.steps.length,
            finishReason: result.finishReason,
        })

        // Wrap in a UI message stream so the useChat hook can consume it
        const stream = createUIMessageStream({
            execute: async ({ writer }) => {
                // Write tool invocations from each step
                for (const step of result.steps) {
                    for (const tc of step.toolCalls) {
                        writer.write({
                            type: "tool-call",
                            toolCallId: tc.toolCallId,
                            toolName: tc.toolName,
                            args: tc.args,
                        })
                    }
                    for (const tr of step.toolResults) {
                        writer.write({
                            type: "tool-result",
                            toolCallId: tr.toolCallId,
                            result: tr.result,
                        })
                    }
                }
                // Write the final text
                writer.write({ type: "text", text: result.text })
            },
        })

        return createUIMessageStreamResponse({ stream })
    } catch (e: any) {
        console.error("[Kea] FATAL error:", e?.message, e?.cause?.message)
        return new Response(
            JSON.stringify({ error: "AI Error", details: e?.message || "Unknown" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        )
    }
}
