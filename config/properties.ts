// Hybrid configuration - supports both auto-fetch and manual overrides
// The system will auto-fetch property details from GA4 API, but you can override any field manually

export interface ManualPropertyOverride {
  id: string
  name?: string // Override the auto-fetched name
  displayName?: string // Override the auto-fetched display name
  websiteUrl?: string // Override the auto-fetched website URL
  accountName?: string // Override the auto-fetched account name
  description?: string // Add a custom description
  customColor?: string // Add a custom color for the UI
  tags?: string[] // Add custom tags
  priority?: number // Set priority for sorting (1 = highest)
  notes?: string // Add custom notes
}

// Simple property IDs - system will auto-fetch details
export const PROPERTY_IDS = [
  "449848474", // Will auto-fetch: Beehiiv (The Mobile Rundown)
  "266707349", // Will auto-fetch: BrooksConkle.com - GA4
  "451126854", // Will auto-fetch: Gulf Coast Beach Vibes
  "459536714", // Will auto-fetch: Local Media Crew
  "451059663", // Will auto-fetch: Marketing Teddy
  "461646386", // New property 1
  "496167447", // New property 2
  "361166378", // New property 3
  "308434219", // New property 4
]

// Manual overrides - these take precedence over auto-fetched data
export const MANUAL_OVERRIDES: Partial<PropertyDetails>[] = [
  {
    id: "449848474",
    displayName: "The Mobile Rundown Newsletter",
    description: "Newsletter analytics for The Mobile Rundown",
    customColor: "#3B82F6",
    tags: ["newsletter", "beehiiv", "mobile"],
    priority: 1,
    notes: "Primary newsletter property - check daily",
  },
  {
    id: "266707349",
    displayName: "BrooksConkle.com",
    description: "Personal website analytics",
    customColor: "#10B981",
    tags: ["website", "personal", "blog"],
    priority: 2,
  },
  {
    id: "451126854",
    displayName: "Gulf Coast Beach Vibes",
    description: "Beach rental property website",
    customColor: "#F59E0B",
    tags: ["rental", "beach", "vacation"],
    priority: 3,
  },
  // Add more manual overrides as needed
]

// Interface for combined property data (auto-fetched + manual overrides)
export interface PropertyDetails {
  id: string
  name?: string
  displayName?: string
  websiteUrl?: string
  createTime?: string
  updateTime?: string
  propertyType?: string
  accountName?: string
  accountId?: string
  timeZone?: string
  currencyCode?: string
  industryCategory?: string
  description?: string
  customColor?: string
  tags?: string[]
  priority?: number
  notes?: string
  source?: "auto-fetched" | "manual-override" | "hybrid"
}

// Cache for property details to avoid repeated API calls
const propertyCache: Map<string, PropertyDetails> = new Map()

// Helper function to get manual override for a property
export function getManualOverride(id: string): Partial<PropertyDetails> | undefined {
  return MANUAL_OVERRIDES.find((override) => override.id === id)
}

// Helper function to merge auto-fetched data with manual overrides
export function mergePropertyData(autoFetched: Partial<PropertyDetails>, propertyId: string): PropertyDetails {
  const manualOverride = getManualOverride(propertyId)

  if (!manualOverride) {
    // Pure auto-fetched
    return {
      ...autoFetched,
      id: propertyId,
      source: "auto-fetched",
    } as PropertyDetails
  }

  if (!autoFetched.displayName && !autoFetched.name) {
    // Pure manual override (auto-fetch failed)
    return {
      id: propertyId,
      name: `properties/${propertyId}`,
      displayName: `Property ${propertyId}`,
      propertyType: "GA4",
      ...manualOverride,
      source: "manual-override",
    } as PropertyDetails
  }

  // Hybrid: merge auto-fetched with manual overrides
  return {
    ...autoFetched,
    ...manualOverride,
    id: propertyId,
    source: "hybrid",
  } as PropertyDetails
}

// Helper function to get cached property details
export function getCachedProperty(propertyId: string): PropertyDetails | null {
  return propertyCache.get(propertyId) || null
}

// Helper function to cache property details
export function cacheProperty(property: PropertyDetails): void {
  propertyCache.set(property.id, property)
}

// Helper function to get all cached properties
export function getAllCachedProperties(): PropertyDetails[] {
  return Array.from(propertyCache.values())
}

// Clear cache (useful for development)
export function clearPropertyCache(): void {
  propertyCache.clear()
}

// Helper function to get properties sorted by priority
export function getPropertiesByPriority(properties: PropertyDetails[]): PropertyDetails[] {
  return properties.sort((a, b) => {
    // Sort by priority first (lower number = higher priority)
    if (a.priority && b.priority) {
      return a.priority - b.priority
    }
    if (a.priority && !b.priority) return -1
    if (!a.priority && b.priority) return 1

    // Then by display name
    return (a.displayName || "").localeCompare(b.displayName || "")
  })
}

// Helper function to get properties by tag
export function getPropertiesByTag(properties: PropertyDetails[], tag: string): PropertyDetails[] {
  return properties.filter((prop) => prop.tags?.includes(tag))
}

// Helper function to get unique tags
export function getAllTags(properties: PropertyDetails[]): string[] {
  const tags = properties.flatMap((prop) => prop.tags || [])
  return [...new Set(tags)].sort()
}

// Helper function to get unique account names
export function getAccountNames(): string[] {
  const manualAccounts = MANUAL_OVERRIDES.map((override) => override.accountName).filter(Boolean) as string[]
  return [...new Set(manualAccounts)]
}

// Helper function to get property by ID
export function getPropertyById(propertyId: string): PropertyDetails | undefined {
  return getCachedProperty(propertyId) || undefined
}

// Type alias for manual property
export type ManualProperty = PropertyDetails
