import fs from "fs"
import path from "path"

const DOCS_DIR = path.join(process.cwd(), "seo-docs")

export interface BlogPost {
  slug: string
  title: string
  description: string
  keyword: string
  date: string
  phase: number
}

export interface BlogPostWithContent extends BlogPost {
  content: string
}

function parseFrontmatter(raw: string): { data: Record<string, string | number>; content: string } {
  const fmMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!fmMatch) return { data: {}, content: raw }

  const fmBlock = fmMatch[1]
  const content = fmMatch[2]

  const data: Record<string, string | number> = {}
  for (const line of fmBlock.split("\n")) {
    const colonIdx = line.indexOf(":")
    if (colonIdx === -1) continue
    const key = line.slice(0, colonIdx).trim()
    const val = line.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, "")
    data[key] = key === "phase" ? parseInt(val, 10) : val
  }

  return { data, content: content.trim() }
}

function filenameToSlug(filename: string): string {
  // e.g. "01-ga4-problems-marketing-agencies.md" -> "ga4-problems-marketing-agencies"
  return filename.replace(/^\d+-/, "").replace(/\.md$/, "")
}

export function getAllPosts(): BlogPost[] {
  if (!fs.existsSync(DOCS_DIR)) return []

  const files = fs.readdirSync(DOCS_DIR).filter((f) => f.endsWith(".md")).sort()

  return files.map((filename) => {
    const raw = fs.readFileSync(path.join(DOCS_DIR, filename), "utf-8")
    const { data } = parseFrontmatter(raw)
    return {
      slug: filenameToSlug(filename),
      title: String(data.title ?? ""),
      description: String(data.description ?? ""),
      keyword: String(data.keyword ?? ""),
      date: String(data.date ?? ""),
      phase: Number(data.phase ?? 0),
    }
  })
}

export function getPostBySlug(slug: string): BlogPostWithContent | null {
  if (!fs.existsSync(DOCS_DIR)) return null

  const files = fs.readdirSync(DOCS_DIR).filter((f) => f.endsWith(".md"))
  const match = files.find((f) => filenameToSlug(f) === slug)
  if (!match) return null

  const raw = fs.readFileSync(path.join(DOCS_DIR, match), "utf-8")
  const { data, content } = parseFrontmatter(raw)

  return {
    slug,
    title: String(data.title ?? ""),
    description: String(data.description ?? ""),
    keyword: String(data.keyword ?? ""),
    date: String(data.date ?? ""),
    phase: Number(data.phase ?? 0),
    content,
  }
}
