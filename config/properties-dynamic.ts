// Alternative: Dynamic property loading from external source
// This version loads properties from an API or external config

export interface ManualProperty {
  id: string
  name: string
  websiteUrl?: string
  accountName?: string
  description?: string
}

// Load properties from external source (API, database, etc.)
export async function loadPropertiesFromExternal(): Promise<ManualProperty[]> {
  try {
    // Option 1: Load from your own API
    const response = await fetch("/api/config/properties")
    if (response.ok) {
      return await response.json()
    }

    // Option 2: Load from external service (Airtable, Notion, etc.)
    // const response = await fetch('https://api.airtable.com/v0/your-base/properties', {
    //   headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` }
    // })

    // Fallback to hardcoded if external source fails
    return getDefaultProperties()
  } catch (error) {
    console.error("Failed to load properties from external source:", error)
    return getDefaultProperties()
  }
}

function getDefaultProperties(): ManualProperty[] {
  return [
    {
      id: "449848474",
      name: "Beehiiv (The Mobile Rundown)",
      accountName: "Brooks Conkle",
      websiteUrl: "https://themobilerundown.beehiiv.com",
      description: "Newsletter analytics",
    },
    // ... other properties
  ]
}

// Cache for loaded properties
let cachedProperties: ManualProperty[] | null = null

export async function getProperties(): Promise<ManualProperty[]> {
  if (!cachedProperties) {
    cachedProperties = await loadPropertiesFromExternal()
  }
  return cachedProperties
}

// Clear cache when needed
export function clearPropertiesCache() {
  cachedProperties = null
}
