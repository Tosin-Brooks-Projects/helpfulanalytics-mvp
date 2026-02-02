import { type NextRequest, NextResponse } from "next/server"
import { getValidAccessToken } from "@/lib/auth"
import {
  cacheProperty,
  getCachedProperty,
  mergePropertyData,
  getPropertiesByPriority,
  type PropertyDetails,
} from "@/config/properties"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const accessToken = await getValidAccessToken()

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("🔍 Fetching all GA4 properties for user...")

    const results = {
      userInfo: null as { email: string;[key: string]: any } | null,
      properties: [] as PropertyDetails[],
      stats: {
        total: 0,
        autoFetched: 0,
        manualOnly: 0,
        hybrid: 0,
        failed: 0,
      },
    }

    // Get user info
    try {
      const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (userResponse.ok) {
        results.userInfo = await userResponse.json()
      }
    } catch (error) {
      console.log("⚠️ Could not fetch user info")
    }

    // Fetch all account summaries (Accounts + Properties)
    // This is much more efficient than iterating IDs
    const summariesResponse = await fetch(
      "https://analyticsadmin.googleapis.com/v1beta/accountSummaries",
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    )

    if (!summariesResponse.ok) {
      throw new Error(`Failed to fetch account summaries: ${summariesResponse.statusText}`)
    }

    const summariesData = await summariesResponse.json()
    const accountSummaries = summariesData.accountSummaries || []

    console.log(`✅ Found ${accountSummaries.length} accounts`)

    // Process all properties from all accounts
    for (const account of accountSummaries) {
      const accountName = account.displayName
      const accountId = account.account.split("/")[1] // accounts/123 -> 123

      if (!account.propertySummaries) continue

      for (const prop of account.propertySummaries) {
        const propertyId = prop.property.split("/")[1] // properties/456 -> 456

        // Skip if not GA4 (though API mostly returns GA4 now)
        // propertyType is usually undefined for GA4 in this endpoint, or "PROPERTY_TYPE_UNSPECIFIED"

        const autoFetchedData: Partial<PropertyDetails> = {
          id: propertyId,
          name: prop.property,
          displayName: prop.displayName,
          propertyType: "GA4",
          accountName: accountName,
          accountId: accountId,
        }

        // Merge with any manual overrides (colors, tags, etc.)
        const mergedProperty = mergePropertyData(autoFetchedData, propertyId)

        // Cache and add to results
        cacheProperty(mergedProperty)
        results.properties.push(mergedProperty)
      }
    }

    // Sort properties by priority
    const sortedProperties = getPropertiesByPriority(results.properties)
    results.stats.total = sortedProperties.length

    // Get unique account names for stats
    const accountNames = [...new Set(sortedProperties.map((p) => p.accountName).filter(Boolean))]

    return NextResponse.json({
      properties: sortedProperties.map((prop) => ({
        name: prop.name,
        displayName: prop.displayName,
        propertyId: prop.id,
        websiteUrl: prop.websiteUrl,
        createTime: prop.createTime,
        updateTime: prop.updateTime,
        propertyType: prop.propertyType,
        accountName: prop.accountName,
        accountId: prop.accountId,
        timeZone: prop.timeZone,
        currencyCode: prop.currencyCode,
        industryCategory: prop.industryCategory,
        description: prop.description,
        customColor: prop.customColor,
        tags: prop.tags,
        priority: prop.priority,
        notes: prop.notes,
        source: prop.source,
        discoveredVia: "account-summaries",
      })),
      stats: results.stats,
      userEmail: results.userInfo?.email,
      totalAccounts: accountNames.length,
    })
  } catch (error) {
    console.error("❌ Properties fetch error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to fetch properties",
        retryable: true,
      },
      { status: 500 },
    )
  }
}
