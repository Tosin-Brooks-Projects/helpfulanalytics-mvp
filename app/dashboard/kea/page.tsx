"use client"

import { useRef, useEffect, useCallback, useState } from "react"
import { LinearShell } from "@/components/linear/linear-shell"
import { useKeaChat } from "@/components/linear/kea-chat-context"
import { Send, RotateCcw, Sparkles } from "lucide-react"
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

export default function KeaPage() {
    const { messages, sendMessage, input, setInput, resetChat, isLoading, status } = useKeaChat()
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)

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

    return (
        <LinearShell>
            <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto">
                {/* ─── Header ───────────────────────────── */}
                <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <img src="/kea.svg" alt="Kea" className="h-10 w-10 rounded-full" />
                            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-zinc-900 font-outfit">Kea</h1>
                            <p className="text-xs text-zinc-400">Your AI analytics assistant · Powered by GA4</p>
                        </div>
                    </div>
                    <button
                        onClick={resetChat}
                        className="flex items-center gap-1.5 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                    >
                        <RotateCcw className="h-3 w-3" />
                        New chat
                    </button>
                </div>

                {/* ─── Messages ──────────────────────────── */}
                <div
                    ref={scrollContainerRef}
                    className="flex-1 overflow-y-auto space-y-4 pr-2"
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
                                            "max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
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

                    {/* Suggested prompts */}
                    {messages.length === 1 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 max-w-2xl">
                            {SUGGESTED_PROMPTS.map((prompt) => (
                                <button
                                    key={prompt}
                                    onClick={() => {
                                        sendMessage({ role: "user", content: prompt } as any)
                                        setInput("")
                                    }}
                                    className="flex items-center gap-2.5 rounded-xl border border-zinc-200/80 px-4 py-3 text-left text-sm text-zinc-600 hover:bg-amber-50/60 hover:border-amber-200 hover:text-amber-700 transition-all"
                                >
                                    <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Typing / status indicator */}
                    {statusLabel && (
                        <div className="flex items-center gap-2 pl-10">
                            <div className="flex items-center gap-2 rounded-xl bg-zinc-50 border border-zinc-100 px-3 py-2 text-xs text-zinc-500 font-medium">
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

                {/* ─── Input ────────────────────────────── */}
                <form onSubmit={(e) => { e.preventDefault(); handleSend() }} className="shrink-0 border-t border-zinc-100 pt-4 mt-4">
                    <div className="flex items-end gap-3 rounded-xl border border-zinc-200 bg-zinc-50/80 px-4 py-3 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100 transition-all">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask Kea about your analytics…"
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
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-all",
                                "bg-gradient-to-br from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700",
                                "disabled:opacity-30 disabled:cursor-not-allowed disabled:from-zinc-400 disabled:to-zinc-400"
                            )}
                        >
                            <Send className="h-4 w-4" />
                        </button>
                    </div>
                    <p className="mt-2 text-center text-[10px] text-zinc-300">
                        Press Enter to send · Shift+Enter for new line
                    </p>
                </form>
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
