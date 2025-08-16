import { type NextRequest, NextResponse } from "next/server"
import { getValidAccessToken } from "@/lib/auth"
import {
  PROPERTY_IDS,
  cacheProperty,
  getCachedProperty,
  mergePropertyData,
  getPropertiesByPriority,
  type PropertyDetails,
} from "@/config/properties"

export async function GET(request: NextRequest) {
  try {
    const accessToken = await getValidAccessToken(request)

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("🔍 Fetching property details with manual override support...")

    const results = {
      userInfo: null,
      properties: [] as PropertyDetails[],
      stats: {
        total: 0,
        autoFetched: 0,
        manualOnly: 0,
        hybrid: 0,
        failed: 0,
      },
    }

    // Get user info first
    try {
      const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (userResponse.ok) {
        results.userInfo = await userResponse.json()
        console.log("✅ User authenticated:", results.userInfo.email)
      }
    } catch (error) {
      console.log("⚠️ Could not fetch user info")
    }

    // Fetch details for each configured property ID
    for (const propertyId of PROPERTY_IDS) {
      console.log(`\n🔍 Processing property: ${propertyId}`)

      // Check cache first
      const cached = getCachedProperty(propertyId)
      if (cached) {
        console.log(`✅ Using cached data for ${propertyId}: ${cached.displayName}`)
        results.properties.push(cached)
        continue
      }

      let autoFetchedData: Partial<PropertyDetails> = {
        id: propertyId,
        propertyType: "GA4",
      }

      // Try to auto-fetch property details from GA4 API
      const endpoints = [
        `https://analyticsadmin.googleapis.com/v1alpha/properties/${propertyId}`,
        `https://analyticsadmin.googleapis.com/v1beta/properties/${propertyId}`,
        `https://analyticsadmin.googleapis.com/v1/properties/${propertyId}`,
      ]

      let propertyFetched = false

      for (const endpoint of endpoints) {
        if (propertyFetched) break

        try {
          const response = await fetch(endpoint, {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
          })

          if (response.ok) {
            const responseText = await response.text()
            if (responseText.trim()) {
              try {
                const propertyData = JSON.parse(responseText)

                // Extract auto-fetched property details
                autoFetchedData = {
                  id: propertyId,
                  name: propertyData.name || `properties/${propertyId}`,
                  displayName: propertyData.displayName || `Property ${propertyId}`,
                  websiteUrl: propertyData.websiteUrl,
                  createTime: propertyData.createTime,
                  updateTime: propertyData.updateTime,
                  propertyType: "GA4",
                  timeZone: propertyData.timeZone,
                  currencyCode: propertyData.currencyCode,
                  industryCategory: propertyData.industryCategory,
                }

                // Try to get account information
                if (propertyData.parent) {
                  try {
                    const accountId = propertyData.parent.replace("accounts/", "")
                    const accountEndpoint = `https://analyticsadmin.googleapis.com/v1alpha/accounts/${accountId}`

                    const accountResponse = await fetch(accountEndpoint, {
                      headers: {
                        Authorization: `Bearer ${accessToken}`,
                        "Content-Type": "application/json",
                      },
                    })

                    if (accountResponse.ok) {
                      const accountData = await accountResponse.json()
                      autoFetchedData.accountName = accountData.displayName
                      autoFetchedData.accountId = accountId
                    }
                  } catch (accountError) {
                    // Ignore account fetch errors
                  }
                }

                console.log(`✅ Successfully auto-fetched: ${autoFetchedData.displayName}`)
                propertyFetched = true
              } catch (parseError) {
                console.log(`❌ JSON parse error for ${propertyId}`)
              }
            }
          }
        } catch (error) {
          // Continue to next endpoint
        }
      }

      if (!propertyFetched) {
        console.log(`⚠️ Could not auto-fetch details for property: ${propertyId}`)
        results.stats.failed++
      }

      // Merge auto-fetched data with manual overrides
      const mergedProperty = mergePropertyData(autoFetchedData, propertyId)

      // Track stats
      if (mergedProperty.source === "hybrid") {
        results.stats.hybrid++
        console.log(`🔄 Hybrid property: ${mergedProperty.displayName}`)
      } else if (mergedProperty.source === "manual-override") {
        results.stats.manualOnly++
        console.log(`📝 Manual-only property: ${mergedProperty.displayName}`)
      } else {
        results.stats.autoFetched++
        console.log(`🤖 Auto-fetched property: ${mergedProperty.displayName}`)
      }

      // Cache the merged property details
      cacheProperty(mergedProperty)
      results.properties.push(mergedProperty)
    }

    // Sort properties by priority
    const sortedProperties = getPropertiesByPriority(results.properties)
    results.stats.total = sortedProperties.length

    console.log("\n📊 SUMMARY:")
    console.log(`- Total properties: ${results.stats.total}`)
    console.log(`- Auto-fetched: ${results.stats.autoFetched}`)
    console.log(`- Hybrid: ${results.stats.hybrid}`)
    console.log(`- Manual-only: ${results.stats.manualOnly}`)
    console.log(`- Failed: ${results.stats.failed}`)

    // Get unique account names
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
        discoveredVia: "hybrid-system",
        isUA: false,
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
