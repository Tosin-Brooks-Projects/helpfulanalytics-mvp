import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://helpfulanalytics.com'

    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1,
        },
        {
            url: `${baseUrl}/pricing`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/login`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/blog`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
    ]

    const seoDocsDir = path.join(process.cwd(), 'seo-docs')
    let blogRoutes: MetadataRoute.Sitemap = []

    if (fs.existsSync(seoDocsDir)) {
        const files = fs.readdirSync(seoDocsDir)
        blogRoutes = files
            .filter((file) => file.endsWith('.md'))
            .map((file) => {
                // Strip leading number prefix (e.g. "01-") and ".md" extension
                const slug = file.replace(/^\d+-/, '').replace(/\.md$/, '')
                return {
                    url: `${baseUrl}/blog/${slug}`,
                    lastModified: new Date(),
                    changeFrequency: 'monthly' as const,
                    priority: 0.7,
                }
            })
    }

    return [...staticRoutes, ...blogRoutes]
}
