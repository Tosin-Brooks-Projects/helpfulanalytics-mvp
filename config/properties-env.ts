// Alternative: Environment variable approach
// Set these in your .env.local file or deployment environment

export interface ManualProperty {
  id: string
  name: string
  websiteUrl?: string
  accountName?: string
  description?: string
}

// Load properties from environment variables
export function getPropertiesFromEnv(): ManualProperty[] {
  const properties: ManualProperty[] = []

  // Parse environment variables
  // Format: NEXT_PUBLIC_GA4_PROPERTIES=id1:name1:url1:account1:desc1|id2:name2:url2:account2:desc2
  const propertiesEnv = process.env.NEXT_PUBLIC_GA4_PROPERTIES

  if (propertiesEnv) {
    const propertyStrings = propertiesEnv.split("|")

    for (const propString of propertyStrings) {
      const [id, name, websiteUrl, accountName, description] = propString.split(":")

      if (id && name) {
        properties.push({
          id: id.trim(),
          name: name.trim(),
          websiteUrl: websiteUrl?.trim() || undefined,
          accountName: accountName?.trim() || undefined,
          description: description?.trim() || undefined,
        })
      }
    }
  }

  // Fallback to individual environment variables
  if (properties.length === 0) {
    const fallbackProperties = [
      {
        id: process.env.NEXT_PUBLIC_GA4_PROPERTY_1_ID,
        name: process.env.NEXT_PUBLIC_GA4_PROPERTY_1_NAME,
        websiteUrl: process.env.NEXT_PUBLIC_GA4_PROPERTY_1_URL,
        accountName: process.env.NEXT_PUBLIC_GA4_PROPERTY_1_ACCOUNT,
        description: process.env.NEXT_PUBLIC_GA4_PROPERTY_1_DESC,
      },
      {
        id: process.env.NEXT_PUBLIC_GA4_PROPERTY_2_ID,
        name: process.env.NEXT_PUBLIC_GA4_PROPERTY_2_NAME,
        websiteUrl: process.env.NEXT_PUBLIC_GA4_PROPERTY_2_URL,
        accountName: process.env.NEXT_PUBLIC_GA4_PROPERTY_2_ACCOUNT,
        description: process.env.NEXT_PUBLIC_GA4_PROPERTY_2_DESC,
      },
      // Add more as needed...
    ].filter((prop): prop is ManualProperty => Boolean(prop.id && prop.name)) as ManualProperty[]

    properties.push(...fallbackProperties)
  }

  return properties
}

export const MANUAL_PROPERTIES = getPropertiesFromEnv()

// Helper functions remain the same
export function getPropertyById(id: string): ManualProperty | undefined {
  return MANUAL_PROPERTIES.find((prop) => prop.id === id)
}

export function getPropertiesByAccount(accountName: string): ManualProperty[] {
  return MANUAL_PROPERTIES.filter((prop) => prop.accountName === accountName)
}

export function getAccountNames(): string[] {
  const accounts = MANUAL_PROPERTIES.map((prop) => prop.accountName).filter(Boolean)
  return [...new Set(accounts)] as string[]
}
