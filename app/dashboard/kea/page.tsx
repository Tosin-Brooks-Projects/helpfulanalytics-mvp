"use client"

export const dynamic = "force-dynamic"

import { useRef, useEffect, useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { LinearShell } from "@/components/linear/linear-shell"
import { useKeaChat } from "@/components/linear/kea-chat-context"
import { Send, Plus, Sparkles, MessageSquare, Trash2, Menu, Minimize2 } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"

const SUGGESTED_PROMPTS = [
    "What's working best right now?",
    "Where is my traffic coming from?",
    "Which pages get the most views?",
    "What devices do my visitors use?",
    "How many people are on my site right now?",
    "Where are my visitors located?",
]

const TOOL_LABELS: Record<string, { label: string; icon: string }> = {
    getMetricsOverview: { label: "site metrics", icon: "📊" },
    getTrafficSources: { label: "traffic sources", icon: "🔗" },
    getTopPages: { label: "top pages", icon: "📄" },
    getDeviceBreakdown: { label: "device data", icon: "📱" },
    getLocationData: { label: "location data", icon: "🌍" },
    getRealtimeSnapshot: { label: "live visitors", icon: "⚡" },
    getTrafficByState: { label: "state data", icon: "📍" },
    getTrafficByCity: { label: "city data", icon: "🏙️" },
}

function getToolInfo(toolName: string) {
    return TOOL_LABELS[toolName] ?? { label: toolName, icon: "🔧" }
}

function formatSessionDate(ts: number) {
    const d = new Date(ts)
    if (d.toDateString() === new Date().toDateString()) return "Today, " + d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    return d.toLocaleDateString([], { month: "short", day: "numeric" })
}
export default function KeaPage() {
    const router = useRouter()
    const {
        messages, sendMessage, input, setInput, resetChat, isLoading, status,
        sessions, currentSessionId, switchSession, deleteSession
    } = useKeaChat()

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior })
    }, [])

    useEffect(() => {
        setTimeout(() => scrollToBottom("instant"), 50)
        setTimeout(() => inputRef.current?.focus(), 100)
    }, [scrollToBottom])

    useEffect(() => {
        scrollToBottom()
    }, [messages, scrollToBottom])

    const handleSend = () => {
        if (!input || input.trim() === "" || isLoading) return
        sendMessage({ role: "user", content: input.trim() } as any)
        setInput("")
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    const statusLabel = (() => {
        if (status === "submitted") return "Kea is thinking…"
        if (status === "streaming") return "Kea is writing…"
        return null
    })()

    // Group sessions into Today, Previous 7 Days, Older (Optional, for now just sort by date desc)
    const sortedSessions = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt)

    return (
        <LinearShell>
            <div className="flex bg-white h-[calc(100vh-8rem)] rounded-2xl border border-zinc-200 overflow-hidden shadow-sm max-w-6xl mx-auto">

                {/* ─── History Sidebar ──────────────────────── */}
                <div className={cn(
                    "w-64 border-r border-zinc-200 bg-zinc-50/50 flex flex-col shrink-0 transition-transform duration-300 md:translate-x-0 absolute md:static inset-y-0 left-0 z-30 h-full",
                    sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
                )}>
                    <div className="p-4 border-b border-zinc-200 flex items-center justify-between">
                        <button
                            onClick={() => { resetChat(); setSidebarOpen(false); }}
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-4 py-2.5 text-sm font-medium transition-colors shadow-sm"
                        >
                            <Plus className="h-4 w-4" />
                            New chat
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-1">
                        {sortedSessions.length === 0 ? (
                            <div className="py-8 text-center text-xs text-zinc-400">No previous chats</div>
                        ) : (
                            sortedSessions.map(session => (
                                <div
                                    key={session.id}
                                    className={cn(
                                        "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer transition-colors",
                                        currentSessionId === session.id
                                            ? "bg-amber-100/50 text-amber-900 font-medium"
                                            : "hover:bg-zinc-100/80 text-zinc-600"
                                    )}
                                    onClick={() => { switchSession(session.id); setSidebarOpen(false); }}
                                >
                                    <MessageSquare className="h-4 w-4 shrink-0 opacity-50" />
                                    <div className="flex-1 min-w-0">
                                        <div className="truncate text-sm">{session.title}</div>
                                        <div className="text-[10px] opacity-70 mt-0.5">{formatSessionDate(session.updatedAt)}</div>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                                        className="opacity-0 group-hover:opacity-100 hover:text-red-500 rounded p-1 hover:bg-zinc-200/50 transition-all shrink-0"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* ─── Main Chat Area ───────────────────────── */}
                <div className="flex-1 flex flex-col min-w-0 bg-white relative">

                    {/* Header */}
                    <div className="flex flex-col h-full right-0">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 shrink-0">
                            <div className="flex items-center gap-3">
                                <button
                                    className="md:hidden p-2 -ml-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg shrink-0"
                                    onClick={() => setSidebarOpen(true)}
                                >
                                    <Menu className="h-5 w-5" />
                                </button>
                                <div className="relative shrink-0">
                                    <img src="/kea.svg" alt="Kea" className="h-10 w-10 rounded-full" />
                                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-lg font-bold text-zinc-900 font-outfit truncate">Kea</h1>
                                    <p className="text-xs text-zinc-400 hidden sm:block truncate">Your AI analytics assistant · Powered by GA4</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => router.push("/dashboard")}
                                    aria-label="Minimize to dashboard"
                                    title="Back to dashboard"
                                    className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors border border-zinc-100 shadow-sm"
                                >
                                    <Minimize2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div
                            ref={scrollContainerRef}
                            className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
                        >
                            {messages.map((rawMsg, i) => {
                                const msg = rawMsg as any
                                return (
                                    <div key={msg.id || i} className="flex flex-col gap-2">
                                        {/* Message bubble */}
                                        <div className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                                            {msg.role === "assistant" && (
                                                <img src="/kea.svg" alt="Kea" className="mr-3 mt-1 h-7 w-7 shrink-0 rounded-full" />
                                            )}
                                            <div
                                                className={cn(
                                                    "max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
                                                    msg.role === "user"
                                                        ? "bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-tr-md shadow-sm"
                                                        : "bg-zinc-50 border border-zinc-100 text-zinc-800 rounded-tl-md"
                                                )}
                                            >
                                                <MessageContent msg={msg} />
                                            </div>
                                        </div>

                                        {/* Tool invocation cards */}
                                        {msg.parts?.filter((p: any) => p.type === "tool-invocation").map((part: any, pi: number) => {
                                            const toolInfo = getToolInfo(part.toolInvocation?.toolName || part.toolName || "")
                                            const hasResult = part.toolInvocation?.state === "result" || part.state === "result"

                                            return (
                                                <div key={pi} className="flex justify-start pl-10">
                                                    <div className={cn(
                                                        "flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-medium transition-all",
                                                        hasResult
                                                            ? "bg-emerald-50 border border-emerald-100 text-emerald-700"
                                                            : "bg-amber-50 border border-amber-100 text-amber-700"
                                                    )}>
                                                        <span className="text-sm">{toolInfo.icon}</span>
                                                        {hasResult ? (
                                                            <span>✓ Loaded {toolInfo.label}</span>
                                                        ) : (
                                                            <span className="flex items-center gap-1.5">
                                                                <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                                                                Fetching {toolInfo.label}…
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                )
                            })}

                            {/* Suggested prompts (visible until user sends first message) */}
                            {!messages.some(m => m.role === "user") && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-4 max-w-2xl mx-auto">
                                    {SUGGESTED_PROMPTS.map((prompt) => (
                                        <button
                                            key={prompt}
                                            onClick={() => {
                                                sendMessage({ role: "user", content: prompt } as any)
                                                setInput("")
                                            }}
                                            className="flex items-center gap-3 rounded-xl border border-zinc-200/80 px-4 py-3.5 text-left text-sm text-zinc-700 hover:bg-amber-50/60 hover:border-amber-200 hover:text-amber-800 transition-all font-medium"
                                        >
                                            <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
                                            {prompt}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Typing / status indicator */}
                            {statusLabel && (
                                <div className="flex items-center gap-2 pl-10">
                                    <div className="flex items-center gap-2 rounded-xl bg-zinc-50 border border-zinc-100 px-3 py-2 text-xs text-zinc-500 font-medium tracking-wide">
                                        <span className="flex gap-0.5">
                                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]" />
                                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" />
                                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" />
                                        </span>
                                        {statusLabel}
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 sm:p-6 border-t border-zinc-100 bg-white shrink-0">
                            <form onSubmit={(e) => { e.preventDefault(); handleSend() }} className="max-w-4xl mx-auto">
                                <div className="flex items-end gap-3 rounded-2xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 focus-within:border-amber-400 focus-within:ring-4 focus-within:ring-amber-500/10 transition-all">
                                    <textarea
                                        ref={inputRef}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Ask Kea about your analytics..."
                                        rows={1}
                                        disabled={isLoading}
                                        className="flex-1 resize-none bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 outline-none max-h-32 disabled:opacity-50"
                                        style={{ height: "auto", minHeight: "24px" }}
                                        onInput={(e) => {
                                            const el = e.target as HTMLTextAreaElement
                                            el.style.height = "auto"
                                            el.style.height = `${el.scrollHeight}px`
                                        }}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!input || input.trim() === "" || isLoading}
                                        aria-label="Send message"
                                        className={cn(
                                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all shadow-sm",
                                            "bg-amber-500 text-white hover:bg-amber-600",
                                            "disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-zinc-300"
                                        )}
                                    >
                                        <Send className="h-4 w-4" />
                                    </button>
                                </div>
                                <p className="mt-2.5 text-center text-xs text-zinc-400">
                                    Press <kbd className="font-sans px-1 py-0.5 bg-zinc-100 border border-zinc-200 rounded mx-0.5">Enter</kbd> to send · <kbd className="font-sans px-1 py-0.5 bg-zinc-100 border border-zinc-200 rounded mx-0.5">Shift</kbd> + <kbd className="font-sans px-1 py-0.5 bg-zinc-100 border border-zinc-200 rounded mx-0.5">Enter</kbd> for new line
                                </p>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Backdrop for mobile sidebar */}
                {sidebarOpen && (
                    <div
                        className="fixed inset-0 z-20 bg-zinc-900/20 backdrop-blur-sm md:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </div>
        </LinearShell>
    )
}

// ─── Message Content Renderer ────────────────────────────────────

function MessageContent({ msg }: { msg: any }) {
    const textParts = msg.parts?.filter((p: any) => p.type === "text") ?? []

    if (textParts.length > 0) {
        return (
            <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-strong:text-zinc-900 prose-headings:text-zinc-900 prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline">
                {textParts.map((part: any, i: number) => (
                    <ReactMarkdown key={i}>{part.text}</ReactMarkdown>
                ))}
            </div>
        )
    }

    if (msg.content) {
        return (
            <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-strong:text-zinc-900 prose-headings:text-zinc-900 prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
        )
    }

    if (msg.role === "assistant") {
        return (
            <span className="flex gap-1 py-1">
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" />
            </span>
        )
    }

    return null
}
