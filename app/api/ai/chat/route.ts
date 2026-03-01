import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { GoogleGenerativeAI } from "@google/generative-ai"
import type { ChatMessage } from "@/types/chat"
import { getOverviewData } from "@/app/api/analytics/route"

const DEMO_CONTEXT = {
    metrics: {
        sessions: 12543,
        users: 9876,
        newUsers: 7432,
        pageViews: 48721,
        bounceRate: 0.42,
        engagementRate: 0.58,
        avgSessionDuration: 185,
    },
    trafficSources: [
        { source: "Organic Search", sessions: 5800, users: 4200 },
        { source: "Direct", sessions: 3100, users: 2300 },
        { source: "Referral", sessions: 1800, users: 1400 },
        { source: "Organic Social", sessions: 1200, users: 900 },
    ],
    topPages: [
        { path: "/", views: 15400 },
        { path: "/pricing", views: 4500 },
        { path: "/blog/trends-2024", views: 3200 },
        { path: "/features", views: 2800 },
    ],
}

function buildSystemPrompt(analyticsData: Record<string, unknown>): string {
    const dataJson = JSON.stringify(analyticsData, null, 2)
    return `You are Kea — a warm, sharp, and deeply human marketing analyst built into the Helpful Analytics dashboard by Kea Marketing.

## Who you are

You're not a chatbot. You're the smart friend who happens to be an analytics expert — the one people call when they're confused about a traffic drop or excited about a spike they don't understand yet.

You've worked alongside hundreds of business owners and growth teams. You genuinely care about helping people understand what's *actually* happening on their website — not just reading numbers off a screen.

You never talk *at* people. You talk *with* them.

## Your voice

- **Warm, not robotic.** Open with something human. "Okay, that's actually a really good sign — let me show you why." Not: "Based on the provided data..."
- **Direct, not corporate.** Get to the point. No fluff. Treat people like smart adults.
- **Confident, not arrogant.** Have opinions. Tell them what you'd actually *do*. But stay humble — you only have part of the picture.
- **Encouraging, not flattering.** Celebrate real wins genuinely. Frame problems as fixable opportunities — never lecture.
- **Occasionally witty, never trying too hard.** A dry observation sometimes. Read the room.

## Formatting rules

- Use **bold** for the single most important number or phrase per response
- Use short bullet points for lists — never long run-on paragraphs when bullets work better
- Keep responses tight. If 3 lines does it, use 3 lines. If depth is warranted, go there.
- Always end with one forward-moving line: a recommendation, a next step, or a question

## Your values

- Every business owner deserves to understand their own data — not just big teams with analytics departments
- Never celebrate vanity metrics — always ask: does this actually mean something for the business?
- Insight without direction is just trivia — always point toward action
- Be honest when you don't know. Never fabricate data or guess wildly.

## Your analytics data

You have access to the following GA4 data for the user's selected property and date range. Use it to answer questions specifically and accurately:

\`\`\`json
${dataJson}
\`\`\`

If a user asks something you can't answer from this data, tell them what specific report or page in their dashboard would help — and invite them to dig deeper with you.`
}

function buildGeminiHistory(messages: ChatMessage[]) {
    // Gemini requires history to start with a 'user' turn.
    // The welcome message is role 'assistant' (UI-only) — strip all leading non-user messages.
    const priorMessages = messages.slice(0, -1)
    const firstUserIdx = priorMessages.findIndex((m) => m.role === "user")
    if (firstUserIdx === -1) return []

    return priorMessages.slice(firstUserIdx).map((msg) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
    }))
}

export async function POST(request: Request) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
        return new Response("GEMINI_API_KEY is not configured", { status: 500 })
    }

    const session = await getServerSession(authOptions)
    if (!session) {
        return new Response("Unauthorized", { status: 401 })
    }

    let body: {
        propertyId: string
        startDate: string
        endDate: string
        messages: ChatMessage[]
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

    const lastUserMessage = messages[messages.length - 1]
    if (!lastUserMessage || lastUserMessage.role !== "user") {
        return new Response("Last message must be from user", { status: 400 })
    }

    // Fetch analytics context
    let analyticsData: Record<string, unknown>
    try {
        const accessToken = (session as { accessToken?: string }).accessToken
        if (accessToken && propertyId && propertyId !== "demo-property") {
            analyticsData = await getOverviewData(accessToken, propertyId, startDate, endDate)
        } else {
            analyticsData = DEMO_CONTEXT
        }
    } catch {
        analyticsData = DEMO_CONTEXT
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
        model: "gemini-flash-latest",
        systemInstruction: buildSystemPrompt(analyticsData),
    })

    const history = buildGeminiHistory(messages)

    const chat = model.startChat({ history })

    const stream = new ReadableStream({
        async start(controller) {
            try {
                const result = await chat.sendMessageStream(lastUserMessage.content)
                const encoder = new TextEncoder()

                for await (const chunk of result.stream) {
                    const text = chunk.text()
                    if (text) {
                        controller.enqueue(encoder.encode(text))
                    }
                }
            } catch (error) {
                const encoder = new TextEncoder()
                const message = error instanceof Error ? error.message : "An error occurred"
                controller.enqueue(encoder.encode(`Sorry, I encountered an error: ${message}`))
            } finally {
                controller.close()
            }
        },
    })

    return new Response(stream, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Transfer-Encoding": "chunked",
            "X-Content-Type-Options": "nosniff",
        },
    })
}
