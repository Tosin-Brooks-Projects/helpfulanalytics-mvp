import Link from "next/link"
import type { BlogPost } from "@/lib/blog"

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

interface BlogListProps {
  posts: BlogPost[]
}

export function BlogList({ posts }: BlogListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map((post) => (
        <article
          key={post.slug}
          className="group flex flex-col bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-200 overflow-hidden"
        >
          <div className="flex flex-col flex-1 p-6">
            <div className="mb-3">
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20">
                {post.keyword}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 leading-snug mb-3 group-hover:text-primary transition-colors">
              {post.title}
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed flex-1 mb-4">
              {post.description}
            </p>
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
              <time className="text-xs text-slate-400" dateTime={post.date}>
                {formatDate(post.date)}
              </time>
              <Link
                href={`/blog/${post.slug}`}
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Read article →
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
