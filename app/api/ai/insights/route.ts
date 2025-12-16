import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
// @ts-ignore
import { getOverviewData, getMockOverviewData } from "@/app/api/analytics/route"

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)

    // @ts-ignore
    if (!session?.userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { propertyId, startDate = "30daysAgo", endDate = "today" } = body

        if (!propertyId) {
            return NextResponse.json({ error: "Property ID required" }, { status: 400 })
        }

        // Fetch Analytics Data
        let analyticsData
        if (propertyId === "demo-property") {
            analyticsData = await getMockOverviewData()
        } else {
            // @ts-ignore
            const accessToken = session.accessToken
            if (!accessToken) {
                return NextResponse.json({ error: "Unauthorized - No Google Token" }, { status: 401 })
            }
            analyticsData = await getOverviewData(accessToken, propertyId, startDate, endDate)
        }

        // Prepare Prompt
        const systemPrompt = `You are an expert Data Analyst for a web analytics dashboard. 
        Your goal is to provide concise, high-impact insights based on the provided metrics.
        
        Focus on generating exactly two items:
        1. "Insight": A key observation about traffic, users, or trends. (e.g., "Traffic is up 12%...")
        2. "Suggestion": An actionable recommendation based on the insight. (e.g., "Consider promoting...")
        
        Output format must be strictly JSON:
        {
            "insights": [
                {
                    "type": "Insight",
                    "title": "Key Observation",
                    "description": "One concise sentence."
                },
                {
                    "type": "Suggestion",
                    "title": "Action Item",
                    "description": "One concise sentence."
                }
            ]
        }`

        const userPrompt = `Analyze this GA4 data:
        Metrics: ${JSON.stringify(analyticsData.metrics)}
        Top Traffic Sources: ${JSON.stringify(analyticsData.trafficSources)}
        `

        const openRouterKey = process.env.OPENROUTER_API_KEY
        if (!openRouterKey) {
            return NextResponse.json({ error: "Missing OPENROUTER_API_KEY" }, { status: 401 })
        }

        // Call OpenRouter
        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${openRouterKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://helpful-analytics.com",
                    "X-Title": "Helpful Analytics",
                },
                body: JSON.stringify({
                    "model": "google/gemini-2.0-flash-exp:free",
                    "messages": [
                        { "role": "system", "content": systemPrompt },
                        { "role": "user", "content": userPrompt }
                    ],
                    "response_format": { "type": "json_object" }
                }),
            })

            if (!response.ok) {
                console.error(`OpenRouter API Error: ${response.status}`)
                // Return generic fallback if AI fails
                return NextResponse.json({
                    insights: [
                        { type: "Insight", title: "AI Busy", description: "The AI service is currently experiencing high traffic. Please try again later." },
                        { type: "Suggestion", title: "Check Back Soon", description: "We will continue trying to analyze your data." }
                    ]
                })
            }

            const data = await response.json()
            const content = data.choices[0].message.content
            const insights = JSON.parse(content)

            return NextResponse.json(insights)

        } catch (error) {
            console.error("AI Generation Failed:", error)
            return NextResponse.json({
                insights: [
                    { type: "Insight", title: "Analysis Unavailable", description: "We couldn't generate a new report right now." },
                    { type: "Suggestion", title: "Retry", description: "Please refresh the dashboard in a few moments." }
                ]
            })
        }

    } catch (error) {
        console.error("AI Insights Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
