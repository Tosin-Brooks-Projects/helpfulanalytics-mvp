import countries from "world-countries"

const FLAG_BY_NAME = new Map<string, string>()
for (const c of countries) {
    FLAG_BY_NAME.set(c.name.common.toLowerCase(), c.flag)
    for (const alt of c.altSpellings || []) {
        const key = alt.toLowerCase()
        if (!FLAG_BY_NAME.has(key)) FLAG_BY_NAME.set(key, c.flag)
    }
}

// A few common GA4/geonames spellings that don't match world-countries' common name.
const ALIASES: Record<string, string> = {
    "united states of america": "united states",
    "russian federation": "russia",
    "south korea": "south korea",
    "republic of korea": "south korea",
    "macedonia": "north macedonia",
    "swaziland": "eswatini",
    "cape verde": "cabo verde",
    "burma": "myanmar",
    "czech republic": "czechia",
    "ivory coast": "ivory coast",
    "cote d'ivoire": "ivory coast",
}

/** Real Unicode flag emoji for a country name as returned by GA4 (falls back to null if unrecognized). */
export function getCountryFlag(countryName: string | undefined): string | null {
    if (!countryName) return null
    const key = countryName.trim().toLowerCase()
    return FLAG_BY_NAME.get(key) || FLAG_BY_NAME.get(ALIASES[key] || "") || null
}
