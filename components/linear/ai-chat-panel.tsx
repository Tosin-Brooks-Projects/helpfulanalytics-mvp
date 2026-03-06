"use client"

import { useRef, useEffect, useCallback, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { X, Send, RotateCcw, ChevronDown, Sparkles, Maximize2 } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { useKeaChat } from "@/components/linear/kea-chat-context"
import { cn } from "@/lib/utils"

const SUGGESTED_PROMPTS = [
    "What's working best right now?",
    "Where is my traffic coming from?",
    "Which pages get the most views?",
    "What devices do my visitors use?",
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

export function AIChatPanel() {
    const pathname = usePathname()
    const router = useRouter()
    const { messages, sendMessage, input, setInput, resetChat, isLoading, status } = useKeaChat()
    const [open, setOpen] = useState(false)
    const [showScrollBtn, setShowScrollBtn] = useState(false)
    const [isClient, setIsClient] = useState(false)

    useEffect(() => { setIsClient(true) }, [])

    // Hide floating panel on the full Kea page
    const isOnKeaPage = pathname === "/dashboard/kea"

    useEffect(() => {
        if (typeof window !== "undefined" && window.innerWidth >= 1024 && !isOnKeaPage) {
            setOpen(true)
        }
        if (isOnKeaPage) setOpen(false)
    }, [isOnKeaPage])

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

    const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
        messagesEndRef.current?.scrollIntoView({ behavior })
    }, [])

    useEffect(() => {
        if (open) {
            setTimeout(() => scrollToBottom("instant"), 50)
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [open, scrollToBottom])

    useEffect(() => {
        scrollToBottom()
    }, [messages, scrollToBottom])

    const handleScroll = () => {
        const el = scrollContainerRef.current
        if (!el) return
        setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 120)
    }

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

    const onFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        handleSend()
    }

    if (!isClient || isOnKeaPage) return null

    const statusLabel = (() => {
        if (status === "submitted") return "Kea is thinking…"
        if (status === "streaming") return "Kea is writing…"
        return null
    })()

    return (
        <>
            {/* ─── Floating Toggle ──────────────────────────── */}
            <button
                onClick={() => setOpen((v) => !v)}
                aria-label="Open AI chat"
                className={cn(
                    "fixed right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-300",
                    "bg-gradient-to-br from-amber-400 to-amber-500 text-white hover:from-amber-500 hover:to-amber-600 hover:scale-105",
                    "bottom-[4.5rem] lg:bottom-8 lg:right-8",
                    open && "opacity-0 pointer-events-none scale-75"
                )}
            >
                <img src="/kea.svg" alt="Kea" className="h-12 w-12 rounded-full" />
            </button>

            {/* ─── Chat Panel ───────────────────────────────── */}
            <div
                className={cn(
                    "fixed right-4 z-50 flex flex-col overflow-hidden rounded-2xl border border-zinc-200/80 bg-white/95 backdrop-blur-xl shadow-2xl transition-all duration-300 ease-out",
                    "bottom-[4.5rem] lg:bottom-8 lg:right-8",
                    "w-[calc(100vw-2rem)] max-w-sm sm:w-96",
                    open
                        ? "h-[540px] opacity-100 translate-y-0 scale-100"
                        : "h-0 opacity-0 translate-y-4 scale-95 pointer-events-none"
                )}
            >
                {/* ─── Header ───────────────────────────── */}
                <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 bg-gradient-to-r from-amber-50/80 to-white px-4 py-3">
                    <div className="flex items-center gap-2.5">
                        <div className="relative">
                            <img src="/kea.svg" alt="Kea" className="h-8 w-8 rounded-full shrink-0" />
                            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-zinc-900 leading-tight">Kea</p>
                            <p className="text-[10px] text-zinc-400 leading-tight">Your analytics assistant</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                        <button
                            onClick={() => router.push("/dashboard/kea")}
                            aria-label="Expand to full page"
                            title="Open full page"
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                        >
                            <Maximize2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={resetChat}
                            aria-label="Reset chat"
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() => setOpen(false)}
                            aria-label="Close chat"
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                {/* ─── Messages ──────────────────────────── */}
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="relative flex-1 overflow-y-auto px-4 py-4 space-y-3"
                >
                    {messages.map((rawMsg, i) => {
                        const msg = rawMsg as any
                        return (
                            <div key={msg.id || i} className="flex flex-col gap-1.5">
                                {/* Message bubble */}
                                <div className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
                                    {msg.role === "assistant" && (
                                        <img src="/kea.svg" alt="Kea" className="mr-2 mt-1 h-6 w-6 shrink-0 rounded-full" />
                                    )}
                                    <div
                                        className={cn(
                                            "max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
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
                                        <div key={pi} className="flex justify-start pl-8">
                                            <div className={cn(
                                                "flex items-center gap-2 rounded-xl px-3 py-1.5 text-[10px] font-medium transition-all",
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
                        <div className="grid grid-cols-1 gap-1.5 pt-1">
                            {SUGGESTED_PROMPTS.map((prompt) => (
                                <button
                                    key={prompt}
                                    onClick={() => {
                                        sendMessage({ role: "user", content: prompt } as any)
                                        setInput("")
                                    }}
                                    className="flex items-center gap-2 w-full rounded-xl border border-zinc-200/80 px-3 py-2.5 text-left text-xs text-zinc-600 hover:bg-amber-50/60 hover:border-amber-200 hover:text-amber-700 transition-all"
                                >
                                    <Sparkles className="h-3 w-3 text-amber-400 shrink-0" />
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Typing / status indicator */}
                    {statusLabel && (
                        <div className="flex items-center gap-2 pl-8">
                            <div className="flex items-center gap-2 rounded-xl bg-zinc-50 border border-zinc-100 px-3 py-1.5 text-[10px] text-zinc-500 font-medium">
                                <span className="flex gap-0.5">
                                    <span className="h-1 w-1 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]" />
                                    <span className="h-1 w-1 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" />
                                    <span className="h-1 w-1 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" />
                                </span>
                                {statusLabel}
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* ─── Scroll to bottom ─────────────────── */}
                {showScrollBtn && (
                    <button
                        onClick={() => scrollToBottom()}
                        className="absolute bottom-[72px] right-4 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white border border-zinc-200 shadow-sm text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                        <ChevronDown className="h-4 w-4" />
                    </button>
                )}

                {/* ─── Input ────────────────────────────── */}
                <form onSubmit={onFormSubmit} className="shrink-0 border-t border-zinc-100 bg-white/80 backdrop-blur-sm px-3 py-3">
                    <div className="flex items-end gap-2 rounded-xl border border-zinc-200 bg-zinc-50/80 px-3 py-2 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100 transition-all">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about your analytics…"
                            rows={1}
                            disabled={isLoading}
                            className="flex-1 resize-none bg-transparent text-sm text-zinc-900 placeholder:text-zinc-400 outline-none max-h-28 disabled:opacity-50"
                            style={{ height: "auto", minHeight: "20px" }}
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
                                "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all",
                                "bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700",
                                "disabled:opacity-30 disabled:cursor-not-allowed disabled:from-zinc-400 disabled:to-zinc-400"
                            )}
                        >
                            <Send className="h-3.5 w-3.5" />
                        </button>
                    </div>
                    <p className="mt-1.5 text-center text-[10px] text-zinc-300">
                        Press Enter to send · Shift+Enter for new line
                    </p>
                </form>
            </div>
        </>
    )
}

// ─── Message Content Renderer ────────────────────────────────────

function MessageContent({ msg }: { msg: any }) {
    const textParts = msg.parts?.filter((p: any) => p.type === "text") ?? []

    if (textParts.length > 0) {
        return (
            <div className="prose prose-xs max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-strong:text-zinc-900 prose-headings:text-zinc-900 prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline">
                {textParts.map((part: any, i: number) => (
                    <ReactMarkdown key={i}>{part.text}</ReactMarkdown>
                ))}
            </div>
        )
    }

    if (msg.content) {
        return (
            <div className="prose prose-xs max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-strong:text-zinc-900 prose-headings:text-zinc-900 prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline">
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
