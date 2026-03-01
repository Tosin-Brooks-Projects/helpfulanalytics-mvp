import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { streamText, tool } from "ai"
import { createGoogleGenerativeAI } from "@ai-sdk/google"
import type { Message } from "ai"
import { z } from "zod"

const google = createGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || "",
})

import { getOverviewData } from "@/lib/analytics/ga4"
import { getAcquisitionData } from "@/app/api/analytics/route" // This one is still in route.ts for now

function buildSystemPrompt(): string {
    return `You are Kea — a warm, sharp, and deeply human marketing analyst built into the Helpful Analytics dashboard by Kea Marketing.

## Who you are

You're not a chatbot. You're the smart friend who happens to be an analytics expert — the one people call when they're confused about a traffic drop or excited about a spike they don't understand yet.
You've worked alongside hundreds of business owners and growth teams. You genuinely care about helping people understand what's *actually* happening on their website.
You never talk *at* people. You talk *with* them.

## Your Agency (Tools)

You are an autonomous agent connected directly to the user's live Google Analytics 4 (GA4) property.
You do NOT know their data by default. 
To answer questions about their metrics, traffic, or user behavior, you MUST use your provided tools to query their live GA4 data.
- If a user asks "What is my top traffic source?" -> USE the getTrafficSources tool.
- If a user asks "How many sessions did I get?" -> USE the getMetricsOverview tool.

## Your voice

- **Warm, not robotic.** Open with something human.
- **Direct, not corporate.** Get to the point. No fluff.
- **Confident, not arrogant.** Have opinions. Tell them what you'd actually *do*.
- **Encouraging, not flattering.** Frame problems as fixable opportunities.

## Formatting rules

- Use **bold** for the single most important number or phrase per response.
- Use short bullet points for lists.
- Keep responses tight. Don't write essays unless specifically asked.
- Always end with one forward-moving line: a recommendation, a next step, or a question.`
}

// Convert SDK UI Message[] to simpler AI Core Messages manually since older 'ai' package complains about convertToCoreMessages
function parseMessages(messages: Message[]) {
    const coreMessages: any[] = [];

    for (const msg of messages) {
        if (msg.role === 'user' || msg.role === 'system') {
            coreMessages.push({ role: msg.role, content: msg.content });
            continue;
        }

        if (msg.role === 'assistant') {
            const content: any[] = [];
            if (msg.content) {
                content.push({ type: 'text', text: msg.content });
            }
            if (msg.toolInvocations && msg.toolInvocations.length > 0) {
                for (const t of msg.toolInvocations) {
                    content.push({
                        type: 'tool-call',
                        toolCallId: t.toolCallId,
                        toolName: t.toolName,
                        args: t.args
                    });
                }
            }

            coreMessages.push({
                role: 'assistant',
                content: content.length > 0 ? content : "",
            });

            // Append tool results immediately after
            if (msg.toolInvocations && msg.toolInvocations.some(t => 'result' in t)) {
                coreMessages.push({
                    role: 'tool',
                    content: msg.toolInvocations
                        .filter(t => 'result' in t)
                        .map(t => ({
                            type: 'tool-result',
                            toolCallId: t.toolCallId,
                            toolName: t.toolName,
                            result: t.result
                        }))
                });
            }
        }
    }
    return coreMessages;
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
        messages: Message[]
    }

    try {
        body = await request.json()
    } catch {
        return new Response("Invalid JSON body", { status: 400 })
    }

    const { propertyId, startDate, endDate, messages } = body

    if (!messages || messages.length === 0) {
        return new Response("No messages provided", { status: 400 })
    }

    const accessToken = (session as { accessToken?: string }).accessToken

    // Filter out empty assistant messages that the frontend might have appended
    const validMessages = messages.filter(msg =>
        !(msg.role === 'assistant' && (!msg.content || msg.content.trim() === '') && (!msg.toolInvocations || msg.toolInvocations.length === 0))
    )

    const parsedMessages = parseMessages(validMessages)
    console.log("================ INCOMING MESSAGES ================")
    console.log(JSON.stringify(validMessages, null, 2))
    console.log("================ PARSED CORE MESSAGES ================")
    console.log(JSON.stringify(parsedMessages, null, 2))
    console.log("==================================================")

    const result = streamText({
        model: google("gemini-2.5-flash"),
        system: buildSystemPrompt(),
        messages: parsedMessages,
        maxSteps: 5, // Allow Kea to call multiple tools automatically
        onFinish: ({ text, toolCalls, toolResults, finishReason, usage }) => {
            console.log("================ AI RESPONSE FINISHED ================")
            console.log("Text:", text)
            console.log("Tool Calls:", JSON.stringify(toolCalls, null, 2))
            console.log("Tool Results:", JSON.stringify(toolResults, null, 2))
            console.log("Finish Reason:", finishReason)
            console.log("Usage:", usage)
            console.log("======================================================")
        },
        tools: {
            getMetricsOverview: tool({
                description: 'Fetch high-level GA4 metrics like total sessions, users, pageviews, and bounce rate for a specific date range.',
                parameters: z.object({
                    startDate: z.string().describe('The start date in YYYY-MM-DD format'),
                    endDate: z.string().describe('The end date in YYYY-MM-DD format'),
                }),
                execute: async ({ startDate: queryStart, endDate: queryEnd }) => {
                    if (!accessToken || !propertyId) {
                        return { error: "Requires active GA4 property and valid authentication" }
                    }
                    try {
                        const data = await getOverviewData(accessToken, propertyId, queryStart, queryEnd)
                        return data.overview
                    } catch (e) {
                        return { error: 'Failed to fetch metrics overview.' }
                    }
                },
            }),
            getTrafficSources: tool({
                description: 'Fetch the top traffic/acquisition sources to see where users are coming from (e.g. Organic Search, Direct, Referral).',
                parameters: z.object({
                    startDate: z.string().describe('The start date in YYYY-MM-DD format'),
                    endDate: z.string().describe('The end date in YYYY-MM-DD format'),
                    limit: z.number().optional().describe('How many sources to return. Default 5.')
                }),
                execute: async ({ startDate: queryStart, endDate: queryEnd }) => {
                    if (!accessToken || !propertyId) {
                        return { error: "Requires active GA4 property and valid authentication" }
                    }
                    try {
                        const data = await getAcquisitionData(accessToken, propertyId, queryStart, queryEnd)
                        return data.sources
                    } catch (e) {
                        return { error: 'Failed to fetch traffic sources.' }
                    }
                },
            }),
            getTrafficByState: tool({
                description: 'Fetch the top states/regions where users are coming from within a specific country (e.g., California, New York for United States). Defaults to United States if no country is specified.',
                parameters: z.object({
                    startDate: z.string().describe('The start date in YYYY-MM-DD format'),
                    endDate: z.string().describe('The end date in YYYY-MM-DD format'),
                    country: z.string().optional().describe('The country to filter states by. Defaults to "United States".'),
                    limit: z.number().optional().describe('How many states to return. Default 20.')
                }),
                execute: async ({ startDate: queryStart, endDate: queryEnd, country = "United States", limit = 20 }) => {
                    if (!accessToken || !propertyId) {
                        return { error: "Requires active GA4 property and valid authentication" }
                    }
                    try {
                        const res = await fetch(`${request.headers.get("origin") || "http://localhost:3000"}/api/analytics?propertyId=${propertyId}&reportType=states&startDate=${queryStart}&endDate=${queryEnd}&country=${encodeURIComponent(country)}&limit=${limit}`, {
                            headers: {
                                cookie: request.headers.get("cookie") || "",
                            }
                        })
                        if (!res.ok) {
                            return { error: 'Failed to fetch state traffic data.' }
                        }
                        const data = await res.json()
                        return data.states
                    } catch (e) {
                        return { error: 'Failed to fetch state traffic data.' }
                    }
                }
            }),
        }
    })

    return result.toUIMessageStreamResponse()
}
