import { MetadataRoute } from 'next'
import fs from 'fs'
import path from 'path'

const BASE = 'https://helpfulanalytics.com'

export default function sitemap(): MetadataRoute.Sitemap {
    const staticRoutes: MetadataRoute.Sitemap = [
        {
            url: BASE,
            lastModified: new Date('2025-05-01'),
            changeFrequency: 'weekly',
            priority: 1.0,
        },
        {
            url: `${BASE}/pricing`,
            lastModified: new Date('2025-05-01'),
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${BASE}/blog`,
            lastModified: new Date('2025-05-01'),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${BASE}/about`,
            lastModified: new Date('2025-04-01'),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${BASE}/login`,
            lastModified: new Date('2025-01-01'),
            changeFrequency: 'yearly',
            priority: 0.6,
        },
        {
            url: `${BASE}/privacy`,
            lastModified: new Date('2025-01-01'),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${BASE}/terms`,
            lastModified: new Date('2025-01-01'),
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ]

    // Blog posts from seo-docs directory
    const seoDocsDir = path.join(process.cwd(), 'seo-docs')
    let blogRoutes: MetadataRoute.Sitemap = []

    if (fs.existsSync(seoDocsDir)) {
        const files = fs.readdirSync(seoDocsDir)
        blogRoutes = files
            .filter((file) => file.endsWith('.md'))
            .map((file) => {
                const slug = file.replace(/^\d+-/, '').replace(/\.md$/, '')
                // Use file mtime for accurate lastModified
                const stat = fs.statSync(path.join(seoDocsDir, file))
                return {
                    url: `${BASE}/blog/${slug}`,
                    lastModified: stat.mtime,
                    changeFrequency: 'monthly' as const,
                    priority: 0.7,
                }
            })
    }

    return [...staticRoutes, ...blogRoutes]
}
