import type { Metadata } from "next"
import { getAllPosts } from "@/lib/blog"
import { BlogList } from "@/components/marketing/blog-list"
import { Navbar } from "@/components/marketing/navbar"
import { Footer } from "@/components/marketing/footer"

export const metadata: Metadata = {
  title: "Analytics Blog for Marketing Agencies | Helpful Analytics",
  description:
    "GA4 tips, agency reporting guides, and analytics strategies to help marketing agencies save time and deliver better results for clients.",
  openGraph: {
    title: "Analytics Blog for Marketing Agencies | Helpful Analytics",
    description:
      "GA4 tips, agency reporting guides, and analytics strategies to help marketing agencies save time and deliver better results for clients.",
  },
}

export default function BlogPage() {
  const posts = getAllPosts()

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />
      <main className="flex-1 pt-32 pb-24">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20 mb-6">
              Resources
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl mb-6">
              GA4 &amp; Agency Analytics Resources
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
              Practical guides to help marketing agencies master Google Analytics 4, streamline client reporting, and prove ROI — without the GA4 headaches.
            </p>
          </div>

          {/* Article grid */}
          <BlogList posts={posts} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
