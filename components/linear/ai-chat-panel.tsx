"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { X, Send, RotateCcw, ChevronDown } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { useDashboard } from "@/components/linear/dashboard-context"
import { useChat } from "@ai-sdk/react"
import type { Message } from "ai"
import type { ChatMessage } from "@/types/chat"
import { cn } from "@/lib/utils"

const SUGGESTED_PROMPTS = [
    "What's working best right now?",
    "Where is my traffic actually coming from?",
    "Which pages should I be paying attention to?",
    "Anything I should be worried about?",
]

const WELCOME_MESSAGE: ChatMessage = {
    role: "assistant",
    content:
        "Hey — I'm Kea. I've taken a look at your analytics and I'm ready to dig in with you. What do you want to understand about your site today?",
}

const INITIAL_MESSAGES: Message[] = [
    { id: "welcome-message", role: "assistant", content: WELCOME_MESSAGE.content }
]

export function AIChatPanel() {
    const { selectedProperty, dateRange } = useDashboard()
    const [open, setOpen] = useState(false)
    const [showScrollBtn, setShowScrollBtn] = useState(false)

    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    const startDate = isClient && dateRange?.from ? dateRange.from.toISOString().split("T")[0] : "30daysAgo"
    const endDate = isClient && dateRange?.to ? dateRange.to.toISOString().split("T")[0] : "today"

    const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading, stop } = useChat({
        api: "/api/ai/chat",
        initialMessages: INITIAL_MESSAGES,
        body: {
            propertyId: selectedProperty || "demo-property",
            startDate,
            endDate
        },
        onError: (err) => {
            console.error("Chat error:", err)
        }
    })

    // On desktop, open by default; on mobile, stay closed
    useEffect(() => {
        if (typeof window !== "undefined") {
            if (window.innerWidth >= 1024) setOpen(true)
        }
    }, [])

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const scrollContainerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLTextAreaElement>(null)
    const abortRef = useRef<AbortController | null>(null)

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
        if (isLoading) scrollToBottom()
    }, [messages, isLoading, scrollToBottom])

    const handleScroll = () => {
        const el = scrollContainerRef.current
        if (!el) return
        const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
        setShowScrollBtn(distFromBottom > 120)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e)
        }
    }

    const resetChat = () => {
        stop()
        setMessages([{ id: "welcome", role: "assistant", content: WELCOME_MESSAGE.content }])
    }

    if (!isClient) return null

    return (
        <>
            {/* Floating Toggle Button */}
            <button
                onClick={() => toggleOpen((v) => !v)}
                aria-label="Open AI chat"
                className={cn(
                    "fixed right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-all duration-300",
                    "bg-gradient-to-br from-amber-400 to-amber-500 text-white hover:from-amber-500 hover:to-amber-600",
                    // Mobile: sit above bottom nav (h-14 = 56px), desktop: bottom-8
                    "bottom-[4.5rem] lg:bottom-8 lg:right-8",
                    open && "opacity-0 pointer-events-none scale-75"
                )}
            >
                <img
                    src="/kea.svg"
                    alt="Kea"
                    className="h-12 w-12 rounded-full"
                />
            </button>

            {/* Chat Panel */}
            <div
                className={cn(
                    "fixed right-4 z-50 flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-2xl transition-all duration-300 ease-out",
                    // Mobile: sit above bottom nav + leave gap; desktop: bottom-8
                    "bottom-[4.5rem] lg:bottom-8 lg:right-8",
                    "w-[calc(100vw-2rem)] max-w-sm sm:w-96",
                    open
                        ? "h-[520px] opacity-100 translate-y-0 scale-100"
                        : "h-0 opacity-0 translate-y-4 scale-95 pointer-events-none"
                )}
            >
                {/* Header */}
                <div className="flex shrink-0 items-center justify-between border-b border-zinc-100 bg-gradient-to-r from-amber-50 to-white px-4 py-3">
                    <div className="flex items-center gap-2">
                        <img
                            src="/kea.svg"
                            alt="Kea"
                            className="h-8 w-8 rounded-full shrink-0"
                        />
                        <div>
                            <p className="text-sm font-semibold text-zinc-900">Kea</p>
                            {/*<p className="text-[10px] text-zinc-400">Powered by Kea Marketing</p>*/}
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={resetChat}
                            aria-label="Reset chat"
                            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() => toggleOpen(false)}
                            aria-label="Close chat"
                            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="relative flex-1 overflow-y-auto px-4 py-4 space-y-4"
                >
                    {messages.map((msg, i) => (
                        <div key={msg.id || i} className="flex flex-col gap-2">
                            <div
                                className={cn(
                                    "flex",
                                    msg.role === "user" ? "justify-end" : "justify-start"
                                )}
                            >
                                {msg.role === "assistant" && (
                                    <img
                                        src="/kea.svg"
                                        alt="Kea"
                                        className="mr-2 mt-1 h-7 w-7 shrink-0 rounded-full shadow-sm"
                                    />
                                )}
                                <div
                                    className={cn(
                                        "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm",
                                        msg.role === "user"
                                            ? "bg-amber-500 text-white rounded-tr-sm"
                                            : "bg-white border border-zinc-100 text-zinc-800 rounded-tl-sm"
                                    )}
                                >
                                    {msg.role === "assistant" && msg.content === "" && !msg.toolInvocations ? (
                                        <span className="flex gap-1 py-1">
                                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]" />
                                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" />
                                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" />
                                        </span>
                                    ) : (
                                        <div className="prose prose-xs max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 prose-strong:text-zinc-900 prose-headings:text-zinc-900 prose-a:text-amber-600">
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tool Invocations UI */}
                            {msg.toolInvocations?.map((toolInv) => (
                                <div key={toolInv.toolCallId} className="flex justify-start pl-9">
                                    <div className="flex items-center gap-2 rounded-xl bg-zinc-50 border border-zinc-100 px-3 py-1.5 text-[10px] text-zinc-500 font-medium">
                                        {'result' in toolInv ? (
                                            <span className="flex items-center gap-1.5">
                                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                                ✓ Fetched {toolInv.toolName === 'getTrafficSources' ? 'traffic data' : 'metrics'}
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1.5">
                                                <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                                                Fetching {toolInv.toolName === 'getTrafficSources' ? 'traffic data' : 'metrics'} from GA4...
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}

                    {/* Suggested prompts (only when just welcome message) */}
                    {messages.length === 1 && (
                        <div className="space-y-2">
                            {SUGGESTED_PROMPTS.map((prompt) => (
                                <button
                                    key={prompt}
                                    onClick={() => handleInputChange({ target: { value: prompt } } as any)}
                                    className="block w-full rounded-xl border border-zinc-200 px-3 py-2 text-left text-xs text-zinc-600 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-700 transition-colors"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Scroll to bottom button */}
                {showScrollBtn && (
                    <button
                        onClick={() => scrollToBottom()}
                        className="absolute bottom-[72px] right-4 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-white border border-zinc-200 shadow-sm text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                        <ChevronDown className="h-4 w-4" />
                    </button>
                )}

                {/* Input */}
                <form onSubmit={handleSubmit} className="shrink-0 border-t border-zinc-100 bg-white px-3 py-3">
                    <div className="flex items-end gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 focus-within:border-amber-400 focus-within:ring-2 focus-within:ring-amber-100 transition-all">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={handleInputChange}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about your analytics..."
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
                            disabled={!input?.trim() || isLoading}
                            aria-label="Send message"
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
