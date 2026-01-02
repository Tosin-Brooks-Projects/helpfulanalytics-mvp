import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
// @ts-ignore
import { getOverviewData, getMockOverviewData } from "@/app/api/analytics/route"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { db } from "@/lib/firebase-admin"

export const dynamic = 'force-dynamic'

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

        // --- CACHING STRATEGY ---
        const cacheKey = `insights-${propertyId}-${startDate}-${endDate}`

        // Only verify cache if not running in a strictly mock environment (though mock doesn't cost money)
        // But let's cache everything to simulate prod behavior.
        if (db && Object.keys(db).length > 0) {
            try {
                const cacheRef = db.collection("ai_cache").doc(cacheKey)
                const cacheDoc = await cacheRef.get()

                if (cacheDoc.exists) {
                    const data = cacheDoc.data()
                    // Check if cache is fresh (less than 24 hours old)
                    const ONE_DAY_MS = 24 * 60 * 60 * 1000
                    if (data?.timestamp && (Date.now() - data.timestamp < ONE_DAY_MS)) {
                        console.log("Serving AI Insights from Cache:", cacheKey)
                        return NextResponse.json(data.insights)
                    }
                }
            } catch (err) {
                console.warn("Cache check failed:", err)
                // Continue to generation if cache fails
            }
        }
        // ------------------------

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

        // Initialize Gemini
        const apiKey = process.env.GEMINI_API_KEY
        if (!apiKey) {
            return NextResponse.json({ error: "Missing GEMINI_API_KEY" }, { status: 500 })
        }

        const genAI = new GoogleGenerativeAI(apiKey)
        // Make sure to use the model that supports JSON efficiently
        const model = genAI.getGenerativeModel({
            model: "gemini-flash-latest",
            generationConfig: {
                responseMimeType: "application/json"
            }
        })

        const systemInstructions = `You are an expert Data Analyst for a web analytics dashboard. 
        Your goal is to provide concise, high-impact insights based on the provided metrics.
        
        CRITICAL: Ensure all text is grammatically correct and free of typos. Proofread your output carefully.
        
        Focus on generating 3-4 distinct items:
        - "Insight": A key observation about traffic or behavior.
        - "Trend": A high-impact trend (e.g., "Trending: X is up Y%").
        - "Suggestion": An actionable recommendation.
        - "Alert": A critical point of attention (optional).
        
        Output format must be strictly JSON with this schema:
        {
            "insights": [
                {
                    "type": "Insight" | "Trend" | "Suggestion" | "Alert",
                    "title": "Short Title",
                    "description": "One concise, punchy sentence.",
                    "content": "A detailed paragraph explaining the insight, context, and potential impact (2-3 sentences)."
                }
            ]
        }`

        const userPrompt = `Analyze this GA4 data and provide insights JSON:
        Metrics: ${JSON.stringify(analyticsData.metrics)}
        Top Traffic Sources: ${JSON.stringify(analyticsData.trafficSources)}
        
        Follow the system instructions for format.`

        // Call Gemini
        try {
            const result = await model.generateContent([systemInstructions, userPrompt])
            const response = await result.response
            const text = response.text()
            const insights = JSON.parse(text)

            // --- SAVE TO CACHE ---
            if (db && Object.keys(db).length > 0) {
                try {
                    await db.collection("ai_cache").doc(cacheKey).set({
                        timestamp: Date.now(),
                        insights: insights,
                        propertyId,
                        cacheKey
                    })
                    console.log("Cached new AI Insights:", cacheKey)
                } catch (err) {
                    console.warn("Failed to cache insights:", err)
                }
            }
            // ---------------------

            return NextResponse.json(insights)

        } catch (error) {
            console.error("Gemini Generation Failed:", error)
            // Return generic fallback if AI fails
            return NextResponse.json({
                insights: [
                    { type: "Insight", title: "AI Busy", description: "The AI service is currently experiencing high traffic. Please try again later.", content: "Please wait a moment and refresh." },
                    { type: "Suggestion", title: "Check Back Soon", description: "We will continue trying to analyze your data.", content: "Retry shortly." }
                ]
            })
        }

    } catch (error) {
        console.error("AI Insights Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
