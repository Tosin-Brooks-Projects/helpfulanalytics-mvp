/**
 * JSON-LD structured data components for Google rich results and sitelinks.
 * WebSite + Organization on the homepage signal to Google what the site is
 * and which pages to surface as sitelinks under a brand search.
 */

const BASE = "https://helpfulanalytics.com"
const LOGO = `${BASE}/logo.png`
const NAME = "Helpful Analytics"

export function WebsiteJsonLd() {
    const schema = {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebSite",
                "@id": `${BASE}/#website`,
                url: BASE,
                name: NAME,
                description: "Simple GA4 reporting dashboard for marketing agencies. Multi-property management, client reporting, and white-label dashboards without the GA4 complexity.",
                inLanguage: "en-US",
                potentialAction: {
                    "@type": "SearchAction",
                    target: {
                        "@type": "EntryPoint",
                        urlTemplate: `${BASE}/blog?q={search_term_string}`,
                    },
                    "query-input": "required name=search_term_string",
                },
            },
            {
                "@type": "Organization",
                "@id": `${BASE}/#organization`,
                name: NAME,
                url: BASE,
                logo: {
                    "@type": "ImageObject",
                    "@id": `${BASE}/#logo`,
                    url: LOGO,
                    contentUrl: LOGO,
                    width: 512,
                    height: 512,
                    caption: NAME,
                },
                image: { "@id": `${BASE}/#logo` },
                description: "GA4 analytics dashboard built for marketing agencies. Replace Google Analytics complexity with simple, actionable reporting.",
                foundingDate: "2024",
                sameAs: [
                    "https://twitter.com/brooksconkle",
                ],
                contactPoint: {
                    "@type": "ContactPoint",
                    contactType: "customer support",
                    url: `${BASE}/login`,
                    availableLanguage: "English",
                },
            },
            {
                "@type": "WebPage",
                "@id": `${BASE}/#webpage`,
                url: BASE,
                name: `${NAME} — Simple GA4 Reporting for Marketing Agencies`,
                isPartOf: { "@id": `${BASE}/#website` },
                about: { "@id": `${BASE}/#organization` },
                description: "The GA4 dashboard built for marketing agencies. Simple client reporting, multi-account management, and white-label dashboards — without the GA4 complexity.",
                inLanguage: "en-US",
                potentialAction: [
                    {
                        "@type": "ReadAction",
                        target: [BASE],
                    },
                ],
            },
        ],
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}

interface BreadcrumbItem {
    name: string
    href: string
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: item.name,
            item: `${BASE}${item.href}`,
        })),
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}

export function SoftwareAppJsonLd() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: NAME,
        url: BASE,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        description: "GA4 analytics dashboard for marketing agencies. Simple client reporting and multi-property management.",
        offers: [
            {
                "@type": "Offer",
                name: "Starter",
                price: "0",
                priceCurrency: "USD",
                description: "Free 30-day trial, 1 GA4 property",
            },
            {
                "@type": "Offer",
                name: "Pro",
                price: "29",
                priceCurrency: "USD",
                description: "Up to 10 GA4 properties, full reporting suite",
            },
        ],
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            bestRating: "5",
            worstRating: "1",
            ratingCount: "47",
        },
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}

export function BlogJsonLd({ title, description, slug, datePublished, dateModified }: {
    title: string
    description: string
    slug: string
    datePublished: string
    dateModified?: string
}) {
    const url = `${BASE}/blog/${slug}`
    const schema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "@id": url,
        url,
        headline: title,
        description,
        datePublished,
        dateModified: dateModified ?? datePublished,
        author: {
            "@type": "Organization",
            name: NAME,
            url: BASE,
        },
        publisher: {
            "@type": "Organization",
            name: NAME,
            logo: { "@type": "ImageObject", url: LOGO },
        },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        isPartOf: { "@id": `${BASE}/#website` },
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    )
}
