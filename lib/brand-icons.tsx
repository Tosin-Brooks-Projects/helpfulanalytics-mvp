"use client"

import { useState } from "react"
import type { IconType } from "react-icons"
import {
    SiGoogle,
    SiFacebook,
    SiInstagram,
    SiX,
    SiYoutube,
    SiTiktok,
    SiReddit,
    SiPinterest,
    SiDuckduckgo,
    SiBaidu,
    SiPerplexity,
    SiWhatsapp,
    SiTelegram,
    SiSnapchat,
    SiGooglechrome,
    SiSafari,
    SiFirefoxbrowser,
    SiOpera,
    SiSamsung,
    SiApple,
    SiAndroid,
    SiLinux,
} from "react-icons/si"
import { FaLinkedin, FaWindows, FaMicrosoft, FaEdge, FaYahoo } from "react-icons/fa6"
import { Globe, Link2 } from "lucide-react"

type BrandMatch = { icon: IconType; color: string }

const SOURCE_BRANDS: Array<{ match: RegExp; icon: IconType; color: string }> = [
    { match: /google/i, icon: SiGoogle, color: "#4285F4" },
    { match: /bing/i, icon: FaMicrosoft, color: "#00809D" },
    { match: /yahoo/i, icon: FaYahoo, color: "#5F01D1" },
    { match: /duckduckgo/i, icon: SiDuckduckgo, color: "#DE5833" },
    { match: /baidu/i, icon: SiBaidu, color: "#2932E1" },
    { match: /perplexity/i, icon: SiPerplexity, color: "#1F1B16" },
    { match: /facebook|fb\.com|instagram\.com\/facebook/i, icon: SiFacebook, color: "#0866FF" },
    { match: /instagram/i, icon: SiInstagram, color: "#E4405F" },
    { match: /(^|\.)x\.com|twitter|\bt\.co\b/i, icon: SiX, color: "#000000" },
    { match: /linkedin/i, icon: FaLinkedin, color: "#0A66C2" },
    { match: /youtube/i, icon: SiYoutube, color: "#FF0000" },
    { match: /tiktok/i, icon: SiTiktok, color: "#000000" },
    { match: /reddit/i, icon: SiReddit, color: "#FF4500" },
    { match: /pinterest/i, icon: SiPinterest, color: "#BD081C" },
    { match: /whatsapp/i, icon: SiWhatsapp, color: "#25D366" },
    { match: /telegram/i, icon: SiTelegram, color: "#26A5E4" },
    { match: /snapchat/i, icon: SiSnapchat, color: "#FFFC00" },
]

const BROWSER_BRANDS: Array<{ match: RegExp; icon: IconType; color: string }> = [
    { match: /edge/i, icon: FaEdge, color: "#0078D7" },
    { match: /chrome/i, icon: SiGooglechrome, color: "#4285F4" },
    { match: /safari/i, icon: SiSafari, color: "#006CFF" },
    { match: /firefox/i, icon: SiFirefoxbrowser, color: "#FF7139" },
    { match: /opera/i, icon: SiOpera, color: "#FF1B2D" },
    { match: /samsung/i, icon: SiSamsung, color: "#1428A0" },
]

const OS_BRANDS: Array<{ match: RegExp; icon: IconType; color: string }> = [
    { match: /windows/i, icon: FaWindows, color: "#0078D7" },
    { match: /mac|ios|ipad|iphone/i, icon: SiApple, color: "#000000" },
    { match: /android/i, icon: SiAndroid, color: "#3DDC84" },
    { match: /chrome ?os/i, icon: SiGooglechrome, color: "#4285F4" },
    { match: /linux/i, icon: SiLinux, color: "#FCC624" },
]

function resolveBrand(value: string | undefined, table: Array<{ match: RegExp; icon: IconType; color: string }>): BrandMatch | null {
    if (!value) return null
    const found = table.find((entry) => entry.match.test(value))
    return found ? { icon: found.icon, color: found.color } : null
}

function isDirect(value: string | undefined) {
    if (!value) return true
    const v = value.toLowerCase()
    return v === "direct" || v === "(direct)" || v === "(not set)" || v === "none"
}

/** Extracts a bare domain (no www., no path) from a GA4 source value, or null if it isn't domain-shaped. */
function extractDomain(value: string): string | null {
    const v = value.trim().toLowerCase().replace(/^www\./, "")
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(v)) return null
    return v
}

/** Real favicon for an arbitrary referral domain, via a favicon service; falls back to a generic globe icon on load failure. */
function FaviconIcon({ domain, className }: { domain: string; className?: string }) {
    const [failed, setFailed] = useState(false)
    if (failed) return <Globe className={className} aria-hidden="true" />
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={`https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=64`}
            alt=""
            className={className}
            onError={() => setFailed(true)}
        />
    )
}

/** Real brand logo for a GA4 traffic source: known brands get their official icon, other domains get their real favicon, everything else falls back to a generic globe/link icon. */
export function SourceIcon({ source, className }: { source: string; className?: string }) {
    if (isDirect(source)) {
        return <Link2 className={className} aria-hidden="true" />
    }
    const brand = resolveBrand(source, SOURCE_BRANDS)
    if (brand) {
        const Icon = brand.icon
        return <Icon className={className} style={{ color: brand.color }} aria-hidden="true" />
    }
    const domain = extractDomain(source)
    if (domain) {
        return <FaviconIcon domain={domain} className={className} />
    }
    return <Globe className={className} aria-hidden="true" />
}

/** Real brand logo for a browser name (falls back to a generic globe icon). */
export function BrowserIcon({ browser, className }: { browser: string; className?: string }) {
    const brand = resolveBrand(browser, BROWSER_BRANDS)
    if (!brand) return <Globe className={className} aria-hidden="true" />
    const Icon = brand.icon
    return <Icon className={className} style={{ color: brand.color }} aria-hidden="true" />
}

/** Real brand logo for an operating system name (falls back to a generic globe icon). */
export function OSIcon({ os, className }: { os: string; className?: string }) {
    const brand = resolveBrand(os, OS_BRANDS)
    if (!brand) return <Globe className={className} aria-hidden="true" />
    const Icon = brand.icon
    return <Icon className={className} style={{ color: brand.color }} aria-hidden="true" />
}
