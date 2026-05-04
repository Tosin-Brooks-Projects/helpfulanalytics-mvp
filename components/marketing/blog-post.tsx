"use client"

import Link from "next/link"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import type { BlogPostWithContent, BlogPost } from "@/lib/blog"

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  } catch {
    return dateStr
  }
}

interface BlogPostProps {
  post: BlogPostWithContent
  relatedPosts: BlogPost[]
}

export function BlogPostContent({ post, relatedPosts }: BlogPostProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex-1 pt-28 pb-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-8">
          {/* Back link */}
          <div className="mb-10">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-primary transition-colors"
            >
              <span>←</span>
              <span>Back to blog</span>
            </Link>
          </div>

          {/* Article header */}
          <header className="mb-12">
            <div className="mb-4">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary ring-1 ring-inset ring-primary/20">
                {post.keyword}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl leading-tight mb-4">
              {post.title}
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed mb-6">
              {post.description}
            </p>
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <time dateTime={post.date}>{formatDate(post.date)}</time>
            </div>
            <div className="mt-8 h-px bg-slate-100" />
          </header>

          {/* Article body */}
          <div className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-900 prose-code:text-primary prose-code:bg-primary/5 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-normal prose-table:w-full prose-th:text-left prose-th:font-semibold prose-td:align-top">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.content}</ReactMarkdown>
          </div>

          {/* CTA section */}
          <div className="mt-16 rounded-2xl bg-slate-900 p-8 sm:p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 h-48 w-48 rounded-full bg-primary/20 blur-[60px]" />
            <div className="relative z-10">
              <h2 className="text-2xl font-bold mb-3">Stop wrestling with GA4</h2>
              <p className="text-slate-300 mb-6 leading-relaxed">
                Helpful Analytics gives your agency a clean, simple view of all your client analytics — no GA4 headaches, no hours wasted on reports.
              </p>
              <a
                href="https://helpfulanalytics.com"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/30 hover:bg-primary/90 transition-colors"
              >
                Try Helpful Analytics free →
              </a>
            </div>
          </div>

          {/* Related articles */}
          {relatedPosts.length > 0 && (
            <div className="mt-16">
              <h2 className="text-xl font-bold text-slate-900 mb-6">Related articles</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedPosts.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/blog/${related.slug}`}
                    className="group block rounded-xl border border-slate-100 p-5 hover:border-slate-200 hover:shadow-sm transition-all duration-200"
                  >
                    <p className="text-sm font-semibold text-slate-800 leading-snug group-hover:text-primary transition-colors mb-2">
                      {related.title}
                    </p>
                    <p className="text-xs text-slate-400 line-clamp-2">{related.description}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
