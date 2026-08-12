const TESTING_PROPERTY_LIMITS: Record<string, number> = {
    "support@konetiq.com": 3,
}

/**
 * Effective property cap for a user.
 * Precedence: admin-set maxPropertiesOverride > tierLimit/testing floor.
 */
export function getEffectivePropertyLimit(session: any, userData: any, tierLimit: number) {
    const override = userData?.maxPropertiesOverride
    if (typeof override === "number" && override > 0) {
        return override
    }

    const email = String(session?.user?.email || userData?.email || "").toLowerCase().trim()
    return Math.max(tierLimit, TESTING_PROPERTY_LIMITS[email] || 0)
}
