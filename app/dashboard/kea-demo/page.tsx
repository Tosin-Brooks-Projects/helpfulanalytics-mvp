"use client"

import { FloatingAiAssistant } from "@/components/ui/glowing-ai-chat-assistant"
import { LinearSidebar } from "@/components/linear/linear-sidebar"
import { LinearHeader } from "@/components/linear/linear-header"

export default function KeaDemoPage() {
    return (
        <div className="flex min-h-screen bg-zinc-50">
            <LinearSidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <LinearHeader />
                <main className="flex-1 p-6 md:p-10 flex flex-col items-center justify-center text-center">
                    <div className="max-w-2xl space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs font-bold uppercase tracking-wider">
                            Preview Mode
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-zinc-900 tracking-tight">
                            Meet <span className="text-amber-500 italic">Kea</span>, Your Floating AI
                        </h1>
                        <p className="text-lg text-zinc-600 leading-relaxed">
                            We've integrated a premium, glowing assistant that stays with you.
                            Ask questions about your GA4 property, traffic spikes, or audience behavior
                            from any screen.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 text-left">
                            {[
                                { title: "Real-time Data", desc: "Kea is connected to your live Analytics API." },
                                { title: "Smart Context", desc: "Remembers your chat history across screens." },
                                { title: "Elegant UI", desc: "Glassmorphic design with custom glowing effects." }
                            ].map((item, i) => (
                                <div key={i} className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-sm">
                                    <h3 className="font-bold text-zinc-900 mb-1">{item.title}</h3>
                                    <p className="text-xs text-zinc-500 leading-normal">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                        <p className="text-sm text-zinc-400 mt-10">
                            Check the bottom right corner to interact with Kea.
                        </p>
                    </div>
                </main>
                <FloatingAiAssistant />
            </div>
        </div>
    )
}
