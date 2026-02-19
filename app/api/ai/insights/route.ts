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
        const { propertyId, reportType = "overview", startDate = "30daysAgo", endDate = "today", compareStartDate, compareEndDate } = body

        if (!propertyId) {
            return NextResponse.json({ error: "Property ID required" }, { status: 400 })
        }

        // --- CACHING STRATEGY ---
        const cacheKey = `insights-${propertyId}-${startDate}-${endDate}-${compareStartDate || 'no-comp'}-${compareEndDate || 'no-comp'}-${reportType}`

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

        let analyticsData
        let previousData = null

        // MOCK DATA FOR DEMO PROPERTY
        if (propertyId === "demo-property") {
            // Return varied mock insights based on report type
            const mockInsights = getMockAIInsights(reportType)
            // Simulate delay
            await new Promise(resolve => setTimeout(resolve, 1500))
            return NextResponse.json(mockInsights)
        }

        // REAL DATA FETCHING
        // @ts-ignore
        const accessToken = session.accessToken
        if (!accessToken) {
            return NextResponse.json({ error: "Unauthorized - No Google Token" }, { status: 401 })
        }

        // Fetch data based on report type to give AI specific context
        // Note: For now, we'll feed the AI the 'overview' data + some specific data if possible, 
        // OR just stick to overview data and ask it to focus on specific aspects if meaningful.
        // Better: Fetch the specific comparison data if reportType != overview.

        // Simplified for this iteration: We will use the Main Overview Data but prompt AI to look at specific sections (like 'mobile' in device breakdown if available in overview).
        // Ideally, we'd fetch the specific report data here too.
        analyticsData = await getOverviewData(accessToken, propertyId, startDate, endDate)

        if (compareStartDate && compareEndDate) {
            previousData = await getOverviewData(accessToken, propertyId, compareStartDate, compareEndDate)
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

        let userPrompt = ""

        if (previousData) {
            userPrompt = `Analyze this GA4 comparison data (Current vs Previous) with a focus on ${reportType.toUpperCase()}.
             Focus on WHY the current period won or lost against the previous period. Be the "Referee" or "Coach".
             
             Current Metrics: ${JSON.stringify(analyticsData.metrics)}
             Previous Metrics: ${JSON.stringify(previousData.metrics)}
             
             Current Top Sources: ${JSON.stringify(analyticsData.trafficSources)}
             Previous Top Sources: ${JSON.stringify(previousData.trafficSources)}
             
             Follow the system instructions for format. Titles should be fun/competitive like "Victory in Organic Search" or "Slump in Mobile".`
        } else {
            userPrompt = `Analyze this GA4 data with a focus on ${reportType.toUpperCase()} and provide insights JSON:
             Metrics: ${JSON.stringify(analyticsData.metrics)}
             Top Traffic Sources: ${JSON.stringify(analyticsData.trafficSources)}
             
             Follow the system instructions for format.`
        }

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

function getMockAIInsights(reportType: string) {
    const common = [
        { type: "Trend", title: "Traffic Surge", description: "Overall sessions are up by 25% compared to last period.", content: "This indicates strong growth, likely driven by your recent marketing campaigns or organic reach improvements." }
    ]

    switch (reportType) {
        case 'devices':
            return {
                insights: [
                    { type: "Trend", title: "Mobile Dominance", description: "Mobile traffic now accounts for 65% of all sessions, up 10% from last month.", content: "Your users are increasingly accessing the site on the go. Ensure your mobile UX is flawless." },
                    { type: "Suggestion", title: "Optimize for Touch", description: "High bounce rate on tablet devices (55%) suggests potential navigation issues.", content: "Consider increasing button sizes and simplifying menus for tablet users to improve engagement." },
                    { type: "Insight", title: "Desktop Conversion", description: "While mobile brings traffic, desktop users still have 2x higher conversion rates.", content: "Continue to nurture desktop users for high-value actions while using mobile for top-of-funnel acquisition." }
                ]
            }
        case 'audience':
            return {
                insights: [
                    { type: "Insight", title: "Global Reach", description: "New user growth is spiking in India (+137%) and United Kingdom (+10%).", content: "Your content is resonating internationally. Consider creating region-specific landing pages." },
                    { type: "Alert", title: "Germany Retention", description: "Traffic from Germany has dropped by 10% with a higher bounce rate.", content: "Check if there are any localization issues or slow load times affecting German users specifically." },
                    { type: "Suggestion", title: "Loyal Locals", description: "US users have the highest engagement duration (3m 45s).", content: "Leverage this loyalty by offering US-specific loyalty programs or events." }
                ]
            }
        case 'pages':
            return {
                insights: [
                    { type: "Trend", title: "Viral Content", description: "'/blog/trends-2024' has seen a 300% explosion in views.", content: "This article is viral. Capitalize on this by adding a strong CTA or link to your product page within the first paragraph." },
                    { type: "Insight", title: "Pricing Interest", description: "Views on the '/pricing' page are up 18%, correlating with deeper funnels.", content: "Users are evaluating your offer seriously. Ensure your pricing table is clear and compelling." },
                    { type: "Suggestion", title: "Feature Fatigue", description: "'/features' page has a slight dip in traffic.", content: "It might be time to refresh the features page with new screenshots or a video walkthrough." }
                ]
            }
        case 'sources':
            return {
                insights: [
                    { type: "Trend", title: "SEO Victory", description: "Organic Search is up 20% and remains your top acquisition channel.", content: "Your SEO strategy is payng off. Continue to publish high-quality content targeting these keywords." },
                    { type: "Insight", title: "Referral Spike", description: "Referral traffic doubled (+100%) thanks to the recent Product Hunt feature.", content: "Engage with these new users immediately. Consider a welcome message specific to Product Hunt visitors." },
                    { type: "Alert", title: "Direct Drop", description: "Direct traffic is slightly down (-3.8%).", content: "This is usually normal fluctuation, but keep an eye on brand awareness campaigns." }
                ]
            }
        default: // Overview
            return {
                insights: [
                    { type: "Insight", title: "Victory: Traffic Volume Sprint", description: "Total sessions surged by 25%, jumping from 10,034 to 12,543.", content: "You are crushing your previous records. The momentum is clearly on your side." },
                    { type: "Alert", title: "The Depth Deficit", description: "Average page views per session dropped slightly as traffic scaled.", content: "New users are skimming. Use internal linking to keep them exploring longer." },
                    { type: "Suggestion", title: "Maximize the Assist", description: "Deploy strategic internal linking on high-traffic landing pages.", content: "Guide your new influx of visitors to high-converting pages to boost value." }
                ]
            }
    }
}
