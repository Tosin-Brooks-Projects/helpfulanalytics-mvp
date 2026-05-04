import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getAllPosts, getPostBySlug } from "@/lib/blog"
import { BlogPostContent } from "@/components/marketing/blog-post"
import { Navbar } from "@/components/marketing/navbar"
import { Footer } from "@/components/marketing/footer"

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug(params.slug)
  if (!post) return {}

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      url: `https://helpfulanalytics.com/blog/${post.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  }
}

export default function BlogPostPage({ params }: Props) {
  const post = getPostBySlug(params.slug)
  if (!post) notFound()

  const allPosts = getAllPosts()

  // Related posts: same phase first, then nearby phases, exclude current
  const others = allPosts.filter((p) => p.slug !== post.slug)
  const samePhase = others.filter((p) => p.phase === post.phase)
  const nearbyPhase = others.filter((p) => Math.abs(p.phase - post.phase) === 1)
  const rest = others.filter((p) => Math.abs(p.phase - post.phase) > 1)
  const related = [...samePhase, ...nearbyPhase, ...rest].slice(0, 3)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: "Brooks Conkle",
      url: "https://x.com/brooksconkle",
    },
    publisher: {
      "@type": "Organization",
      name: "Helpful Analytics",
      url: "https://helpfulanalytics.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://helpfulanalytics.com/blog/${post.slug}`,
    },
    keywords: post.keyword,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <BlogPostContent post={post} relatedPosts={related} />
      <Footer />
    </>
  )
}
