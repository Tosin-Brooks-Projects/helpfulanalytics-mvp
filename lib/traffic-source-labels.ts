/** Human-readable explanation for GA4's unattributed-traffic labels, or null if the value is a real source. */
export function getSourceExplanation(source: string | undefined): string | null {
    const s = String(source || "").toLowerCase()
    if (s === "(direct)" || s === "direct") {
        return "GA4 couldn't attribute these sessions to a source — usually a typed URL, a bookmark, or a referrer stripped by the browser or app. This is common with in-app browsers (Instagram, TikTok, Slack) and email clients, not a tracking problem."
    }
    if (s === "(not set)") {
        return "GA4 has no source/medium data for these sessions — often caused by consent mode restrictions, ad blockers, or a link missing tracking parameters."
    }
    return null
}

/** Same explanation, keyed off the medium value ("(none)" pairs with "(direct)"). */
export function getMediumExplanation(medium: string | undefined): string | null {
    const m = String(medium || "").toLowerCase()
    if (m === "(none)" || m === "none") {
        return "\"(none)\" means these sessions had no source to categorize, so there's no channel/medium either — it pairs with \"(direct)\" traffic."
    }
    if (m === "(not set)") {
        return "GA4 has no source/medium data for these sessions — often caused by consent mode restrictions, ad blockers, or a link missing tracking parameters."
    }
    return null
}
