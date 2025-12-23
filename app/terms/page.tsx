import fs from 'fs'
import path from 'path'
import ReactMarkdown from 'react-markdown'
import { Navbar } from "@/components/marketing/navbar"
import { Footer } from "@/components/marketing/footer"

export default function TermsPage() {
    const filePath = path.join(process.cwd(), 'docs', 'Terms-of-service.md')
    const content = fs.readFileSync(filePath, 'utf8')

    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 pt-32 pb-24">
                <div className="mx-auto max-w-4xl px-6 lg:px-8">
                    <article className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-li:text-slate-600 prose-strong:text-slate-900 prose-headings:font-bold prose-h1:text-4xl prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-p:leading-8 prose-li:leading-8">
                        <ReactMarkdown>{content}</ReactMarkdown>
                    </article>
                </div>
            </main>
            <Footer />
        </div>
    )
}
