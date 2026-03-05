import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { streamText, tool } from "ai"
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

function buildSystemPrompt(): string {
    return `You are Kea — a warm, sharp, and deeply human marketing analyst built into the Helpful Analytics dashboard by Kea Marketing.

## Who you are

You're not a chatbot. You're the smart friend who happens to be an analytics expert — the one people call when they're confused about a traffic drop or excited about a spike they don't understand yet.
You genuinely care about helping people understand what's *actually* happening on their website.

## Your Agency (Tools)

You are an autonomous agent connected directly to the user's live Google Analytics 4 (GA4) property.
You do NOT know their data by default. You MUST call your tools to fetch real data before answering any question about their site.

### Available Tools — USE THEM AGGRESSIVELY

| Tool | When to use it |
|------|---------------|
| getMetricsOverview | "How am I doing?", "What are my numbers?", total sessions/users/pageviews/bounce rate |
| getTrafficSources | "Where does my traffic come from?", acquisition channels, source/medium breakdown |
| getTopPages | "Which pages are popular?", "What content works?", page performance |
| getDeviceBreakdown | "What devices do people use?", mobile vs desktop, browsers, OS |
| getLocationData | "Where are my users?", country breakdown, geographic distribution |
| getRealtimeSnapshot | "Who's on my site right now?", live active users |
| getTrafficByState | Regional traffic within a country (e.g., California, Texas) |
| getTrafficByCity | City-level traffic within a country (e.g., New York, London) |

### CRITICAL RULES:
1. **ALWAYS call at least one tool** before answering a data question. Never guess or make up numbers.
2. If the question spans multiple data types (e.g., "What's working best?"), call MULTIPLE tools in parallel.
3. After receiving tool results, analyze the data thoughtfully and give actionable insights.
4. If a tool returns an error, tell the user honestly and suggest what they can do.

## Your voice

- **Warm, not robotic.** Open with something human.
- **Direct, not corporate.** Get to the point. No fluff.
- **Confident, not arrogant.** Have opinions. Share what you'd actually *do*.
- **Encouraging, not flattering.** Frame problems as fixable opportunities.

## Formatting rules

- Use **bold** for the single most important number or phrase per response.
- Use short bullet points for data breakdowns.
- Keep responses tight — aim for 3-6 short paragraphs max.
- Always end with a forward-moving line: a recommendation, a next step, or a question.
- When presenting numbers, round percentages to 1 decimal place and format large numbers with commas.`
}

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

    try {
        const result = streamText({
            model: google("gemini-2.5-flash"),
            system: buildSystemPrompt(),
            messages,
            maxSteps: 5,
            tools: {
                getMetricsOverview: tool({
                    description: "Fetch high-level GA4 metrics: total sessions, active users, pageviews, bounce rate, and average session duration for the selected date range. Use this for general performance questions.",
                    parameters: z.object({
                        startDate: z.string().describe("Start date in YYYY-MM-DD format"),
                        endDate: z.string().describe("End date in YYYY-MM-DD format"),
                    }),
                    execute: async ({ startDate: qStart, endDate: qEnd }) => {
                        try {
                            return await getOverviewData(accessToken, propertyId, qStart, qEnd)
                        } catch (e: any) {
                            return { error: `Failed to fetch metrics: ${e?.message || "Unknown error"}` }
                        }
                    },
                }),

                getTrafficSources: tool({
                    description: "Fetch top traffic acquisition sources with session counts, user counts, new users, bounce rates, and avg session duration. Shows source/medium pairs like google/organic, (direct)/(none), etc.",
                    parameters: z.object({
                        startDate: z.string().describe("Start date in YYYY-MM-DD format"),
                        endDate: z.string().describe("End date in YYYY-MM-DD format"),
                        limit: z.number().optional().describe("Number of sources to return. Default 10."),
                    }),
                    execute: async ({ startDate: qStart, endDate: qEnd, limit }) => {
                        try {
                            return await getAcquisitionData(accessToken, propertyId, qStart, qEnd, limit ?? 10)
                        } catch (e: any) {
                            return { error: `Failed to fetch traffic sources: ${e?.message || "Unknown error"}` }
                        }
                    },
                }),

                getTopPages: tool({
                    description: "Fetch the most visited pages on the site with pageviews, bounce rate, and avg time on page. Use this for content performance questions.",
                    parameters: z.object({
                        startDate: z.string().describe("Start date in YYYY-MM-DD format"),
                        endDate: z.string().describe("End date in YYYY-MM-DD format"),
                        limit: z.number().optional().describe("Number of pages to return. Default 10."),
                    }),
                    execute: async ({ startDate: qStart, endDate: qEnd, limit }) => {
                        try {
                            return await getTopPagesData(accessToken, propertyId, qStart, qEnd, limit ?? 10)
                        } catch (e: any) {
                            return { error: `Failed to fetch top pages: ${e?.message || "Unknown error"}` }
                        }
                    },
                }),

                getDeviceBreakdown: tool({
                    description: "Fetch device category breakdown (mobile/desktop/tablet), top browsers, operating systems, and screen resolutions. Use for questions about how users access the site.",
                    parameters: z.object({
                        startDate: z.string().describe("Start date in YYYY-MM-DD format"),
                        endDate: z.string().describe("End date in YYYY-MM-DD format"),
                    }),
                    execute: async ({ startDate: qStart, endDate: qEnd }) => {
                        try {
                            return await getDevicesData(accessToken, propertyId, qStart, qEnd)
                        } catch (e: any) {
                            return { error: `Failed to fetch device data: ${e?.message || "Unknown error"}` }
                        }
                    },
                }),

                getLocationData: tool({
                    description: "Fetch geographic distribution of users by country with session counts, user counts, and bounce rates. Use for questions about where users are located.",
                    parameters: z.object({
                        startDate: z.string().describe("Start date in YYYY-MM-DD format"),
                        endDate: z.string().describe("End date in YYYY-MM-DD format"),
                        limit: z.number().optional().describe("Number of countries to return. Default 10."),
                    }),
                    execute: async ({ startDate: qStart, endDate: qEnd, limit }) => {
                        try {
                            return await getLocationsData(accessToken, propertyId, qStart, qEnd, limit ?? 10)
                        } catch (e: any) {
                            return { error: `Failed to fetch location data: ${e?.message || "Unknown error"}` }
                        }
                    },
                }),

                getRealtimeSnapshot: tool({
                    description: "Fetch real-time active users and which pages they are currently viewing. Use when asked about current or live activity on the site.",
                    parameters: z.object({}),
                    execute: async () => {
                        try {
                            return await getRealtimeData(accessToken, propertyId)
                        } catch (e: any) {
                            return { error: `Failed to fetch realtime data: ${e?.message || "Unknown error"}` }
                        }
                    },
                }),

                getTrafficByState: tool({
                    description: "Fetch state/region level traffic breakdown within a specific country. Use for questions like 'Which states send me the most traffic?'",
                    parameters: z.object({
                        startDate: z.string().describe("Start date in YYYY-MM-DD format"),
                        endDate: z.string().describe("End date in YYYY-MM-DD format"),
                        country: z.string().optional().describe("Country to filter by. Defaults to 'United States'."),
                        limit: z.number().optional().describe("Number of states to return. Default 10."),
                    }),
                    execute: async ({ startDate: qStart, endDate: qEnd, country, limit }) => {
                        try {
                            return await getStatesData(accessToken, propertyId, qStart, qEnd, country ?? "United States", limit ?? 10)
                        } catch (e: any) {
                            return { error: `Failed to fetch state data: ${e?.message || "Unknown error"}` }
                        }
                    },
                }),

                getTrafficByCity: tool({
                    description: "Fetch city-level traffic breakdown within a specific country. Use for granular geographic questions like 'Which cities drive the most traffic?'",
                    parameters: z.object({
                        startDate: z.string().describe("Start date in YYYY-MM-DD format"),
                        endDate: z.string().describe("End date in YYYY-MM-DD format"),
                        country: z.string().optional().describe("Country to filter by. Defaults to 'United States'."),
                        limit: z.number().optional().describe("Number of cities to return. Default 10."),
                    }),
                    execute: async ({ startDate: qStart, endDate: qEnd, country, limit }) => {
                        try {
                            return await getCitiesData(accessToken, propertyId, qStart, qEnd, country ?? "United States", limit ?? 10)
                        } catch (e: any) {
                            return { error: `Failed to fetch city data: ${e?.message || "Unknown error"}` }
                        }
                    },
                }),
            },
        })

        return (result as any).toUIMessageStreamResponse()
    } catch (e: any) {
        return new Response(
            JSON.stringify({ error: "AI Stream Error", details: e?.message || "Unknown" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        )
    }
}
