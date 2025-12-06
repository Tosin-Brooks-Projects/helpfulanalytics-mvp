import { db } from "@/lib/firebase-admin"
import { BetaAnalyticsDataClient } from "@google-analytics/data"

// Collection names
const CACHE_COLLECTION = "analytics_cache"
const SNAPSHOT_COLLECTION = "analytics_snapshots"

// Cache duration in milliseconds (e.g., 1 hour)
const CACHE_DURATION = 60 * 60 * 1000

export class AnalyticsService {
    private accessToken: string
    private propertyId: string

    constructor(accessToken: string, propertyId: string) {
        this.accessToken = accessToken
        this.propertyId = propertyId
    }

    // Helper to generate cache key
    private getCacheKey(reportType: string, startDate: string, endDate: string): string {
        return `${this.propertyId}_${reportType}_${startDate}_${endDate}`
    }

    // Helper to run GA4 report via fetch (since we switched to fetch in the route)
    private async fetchFromGA4(requestBody: any) {
        const response = await fetch(
            `https://analyticsdata.googleapis.com/v1beta/properties/${this.propertyId}:runReport`,
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            }
        )

        if (!response.ok) {
            const errorText = await response.text()
            throw new Error(`GA4 API Error (${response.status}): ${errorText}`)
        }

        return await response.json()
    }

    // Generic method to get data with cache strategy
    async getData(
        reportType: string,
        startDate: string,
        endDate: string,
        fetchFn: () => Promise<any>,
        forceRefresh = false
    ) {
        const cacheKey = this.getCacheKey(reportType, startDate, endDate)

        // 1. Check Cache (if not forced)
        if (!forceRefresh) {
            try {
                const doc = await db.collection(CACHE_COLLECTION).doc(cacheKey).get()
                if (doc.exists) {
                    const data = doc.data()
                    const now = Date.now()
                    // Check if cache is valid (e.g., less than 1 hour old)
                    if (data && data.updatedAt && now - data.updatedAt.toMillis() < CACHE_DURATION) {
                        console.log(`⚡ Serving ${reportType} from Firestore cache`)
                        return data.payload
                    }
                }
            } catch (error) {
                console.warn("Failed to read from Firestore cache:", error)
            }
        }

        // 2. Fetch from GA4
        console.log(`🌐 Fetching ${reportType} from GA4 API`)
        const data = await fetchFn()

        // 3. Save to Cache
        try {
            await db.collection(CACHE_COLLECTION).doc(cacheKey).set({
                propertyId: this.propertyId,
                reportType,
                startDate,
                endDate,
                updatedAt: new Date(),
                payload: data,
            })
        } catch (error) {
            console.warn("Failed to save to Firestore cache:", error)
        }

        // 4. Save Snapshot (only for Overview report, for historical tracking)
        if (reportType === "overview") {
            await this.saveSnapshot(data)
        }

        return data
    }

    // Save a daily snapshot for AI analysis
    private async saveSnapshot(data: any) {
        try {
            const today = new Date().toISOString().split("T")[0]
            const snapshotKey = `${this.propertyId}_${today}`

            await db.collection(SNAPSHOT_COLLECTION).doc(snapshotKey).set({
                propertyId: this.propertyId,
                date: today,
                metrics: data.metrics, // Assuming standard structure
                trafficSources: data.trafficSources,
                capturedAt: new Date(),
            }, { merge: true }) // Merge to avoid overwriting if we fetch multiple times a day

            console.log(`📸 Saved analytics snapshot for ${today}`)
        } catch (error) {
            console.warn("Failed to save analytics snapshot:", error)
        }
    }
}
