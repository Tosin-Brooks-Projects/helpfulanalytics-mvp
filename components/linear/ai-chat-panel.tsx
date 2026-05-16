"use client"

import { useRef, useEffect, useCallback, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { X, Send, RotateCcw, ChevronDown, Sparkles, Maximize2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
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
    getMetricsOverview: { label: "Site metrics", icon: "📊" },
    getTrafficSources: { label: "Traffic sources", icon: "🔗" },
    getTopPages: { label: "Top pages", icon: "📄" },
    getDeviceBreakdown: { label: "Device data", icon: "📱" },
    getLocationData: { label: "Location data", icon: "🌍" },
    getRealtimeSnapshot: { label: "Live visitors", icon: "⚡" },
    getTrafficByState: { label: "State data", icon: "📍" },
    getTrafficByCity: { label: "City data", icon: "🏙️" },
}

const BIRD_MESSAGES = [
    "Caw! Look at that traffic soar!",
    "Tweet! Your bounce rate is fluttering down!",
    "Squawk! Who are these new visitors?",
    "Coo... Your retention is looking peaceful.",
    "Hoot! Wise move checkin' the top pages.",
    "Chirp! Mobile users are flocking in!",
    "Peep! Look at those real-time visitors!",
    "Caw! Time to preen those landing pages!",
    "Squawk! Organic search is flying high!",
    "Chirp! Social traffic is migrating your way.",
]

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
    const [bubbleIndex, setBubbleIndex] = useState(0)
    const [showBubble, setShowBubble] = useState(false)

    useEffect(() => { setIsClient(true) }, [])

    // Hide floating panel on the full Kea page
    const isOnKeaPage = pathname === "/dashboard/kea"

    // Load persisted open/closed state on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("kea_panel_open")
            if (saved !== null && !isOnKeaPage) {
                setOpen(saved === "true")
            } else if (window.innerWidth >= 1024 && !isOnKeaPage) {
                setOpen(true)
            }
        }
    }, [isOnKeaPage])

    // Persist open/closed state whenever it changes
    useEffect(() => {
        if (isClient && !isOnKeaPage) {
            localStorage.setItem("kea_panel_open", open.toString())
        }
    }, [open, isClient, isOnKeaPage])

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

    // Bird Bubble logic
    useEffect(() => {
        if (!isClient || open || isOnKeaPage) {
            setShowBubble(false)
            return
        }

        const cycleBubble = () => {
            const nextIndex = Math.floor(Math.random() * BIRD_MESSAGES.length)
            setBubbleIndex(nextIndex)
            setShowBubble(true)
            setTimeout(() => {
                setShowBubble(false)
            }, 5000)
        }

        const interval = setInterval(cycleBubble, 12000)
        const initialTimeout = setTimeout(cycleBubble, 4000)

        return () => {
            clearInterval(interval)
            clearTimeout(initialTimeout)
        }
    }, [isClient, open, isOnKeaPage])

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
            {/* ─── Floating Toggle & Bubble ─────────────────── */}
            <div className={cn(
                "fixed right-4 z-50 flex flex-col items-end gap-4 transition-all duration-300",
                "bottom-[4.5rem] lg:bottom-8 lg:right-8",
                open && "opacity-0 pointer-events-none scale-75"
            )}>
                <AnimatePresence>
                    {showBubble && !open && (
                        <motion.button
                            initial={{ opacity: 0, y: 10, scale: 0.95, x: 10 }}
                            animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
                            exit={{ opacity: 0, y: 5, scale: 0.95, x: 10 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            onClick={() => setOpen(true)}
                            className="relative mb-1 max-w-[220px] rounded-2xl bg-white/95 backdrop-blur-md border border-amber-200/60 p-3.5 shadow-xl shadow-amber-500/10 text-[13px] text-zinc-700 font-medium leading-relaxed group hover:border-amber-300 transition-all cursor-pointer"
                        >
                            <div className="absolute bottom-[-6px] right-7 h-3 w-3 rotate-45 border-b border-r border-amber-200/60 bg-white group-hover:border-amber-300 transition-colors" />
                            <Sparkles className="h-3.5 w-3.5 text-amber-500 mb-0.5 inline mr-1.5" />
                            {BIRD_MESSAGES[bubbleIndex]}
                        </motion.button>
                    )}
                </AnimatePresence>

                <button
                    onClick={() => setOpen((v) => !v)}
                    aria-label="Open AI chat"
                    className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-full shadow-2xl shadow-amber-500/30 transition-transform duration-300 hover:scale-105 active:scale-95 bg-white border border-zinc-200/50"
                    )}
                >
                    <img src="/kea.svg" alt="Kea" className="h-14 w-14 rounded-full" />
                </button>
            </div>

            {/* ─── Chat Panel ───────────────────────────────── */}
            <div
                className={cn(
                    "fixed right-4 z-50 flex flex-col overflow-hidden rounded-[24px] border border-zinc-200/60 bg-white/85 backdrop-blur-2xl shadow-2xl shadow-zinc-900/10 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    "bottom-[4.5rem] lg:bottom-8 lg:right-8",
                    "w-[calc(100vw-2rem)] max-w-[380px]",
                    open
                        ? "h-[600px] max-h-[85vh] opacity-100 translate-y-0 scale-100"
                        : "h-0 opacity-0 translate-y-4 scale-95 pointer-events-none"
                )}
            >
                {/* ─── Header ───────────────────────────── */}
                <div className="flex shrink-0 items-center justify-between px-5 py-4 bg-white/50 border-b border-zinc-100/50">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <img src="/kea.svg" alt="Kea" className="h-9 w-9 rounded-full shrink-0 shadow-sm border border-zinc-100" />
                            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-[2.5px] border-white bg-emerald-500" />
                        </div>
                        <div>
                            <h2 className="text-[15px] font-semibold text-zinc-900 tracking-tight leading-none mb-0.5">Kea</h2>
                            <p className="text-[11px] font-medium text-zinc-500 leading-none tracking-wide">Your analytics assistant</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => router.push("/dashboard/kea")}
                            aria-label="Expand to full page"
                            title="Open full page"
                            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100/80 hover:text-zinc-700 transition-colors"
                        >
                            <Maximize2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={resetChat}
                            aria-label="Reset chat"
                            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100/80 hover:text-zinc-700 transition-colors"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                        <button
                            onClick={() => setOpen(false)}
                            aria-label="Close chat"
                            className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100/80 hover:text-zinc-700 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {/* ─── Messages ──────────────────────────── */}
                <div
                    ref={scrollContainerRef}
                    onScroll={handleScroll}
                    className="relative flex-1 overflow-y-auto px-5 py-5 space-y-4"
                >
                    {messages.map((rawMsg, i) => {
                        const msg = rawMsg as any
                        return (
                            <div key={msg.id || i} className="flex flex-col gap-2">
                                {/* Message bubble */}
                                <div className={cn("flex items-end gap-2.5", msg.role === "user" ? "justify-end" : "justify-start")}>
                                    {msg.role === "assistant" && (
                                        <img src="/kea.svg" alt="Kea" className="h-6 w-6 shrink-0 rounded-full shadow-sm border border-zinc-100" />
                                    )}
                                    <div
                                        className={cn(
                                            "max-w-[82%] px-4 py-2.5 text-[13px] leading-relaxed transition-all",
                                            msg.role === "user"
                                                ? "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/15 rounded-[20px] rounded-br-[4px]"
                                                : "bg-white border border-zinc-100 shadow-sm text-zinc-800 rounded-[20px] rounded-bl-[4px]"
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
                                                "flex items-center gap-2.5 rounded-xl px-3.5 py-2 text-[11px] font-medium transition-all shadow-sm",
                                                hasResult
                                                    ? "bg-white border border-zinc-200 text-zinc-600"
                                                    : "bg-amber-50/50 border border-amber-200 text-amber-700"
                                            )}>
                                                <span className="text-xs">{toolInfo.icon}</span>
                                                {hasResult ? (
                                                    <span className="tracking-tight">Loaded {toolInfo.label}</span>
                                                ) : (
                                                    <span className="flex items-center gap-2 tracking-tight">
                                                        <span className="relative flex h-1.5 w-1.5">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-500"></span>
                                                        </span>
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
                        <div className="grid grid-cols-1 gap-2 pt-2">
                            {SUGGESTED_PROMPTS.map((prompt, idx) => (
                                <motion.button
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05, duration: 0.3, ease: "easeOut" }}
                                    key={prompt}
                                    onClick={() => {
                                        sendMessage({ role: "user", content: prompt } as any)
                                        setInput("")
                                    }}
                                    className="flex items-center gap-2.5 w-full rounded-[16px] border border-zinc-200 bg-white/50 px-4 py-3 text-left text-[13px] font-medium text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 hover:border-zinc-300 hover:shadow-sm transition-all"
                                >
                                    <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                                    {prompt}
                                </motion.button>
                            ))}
                        </div>
                    )}

                    {/* Typing / status indicator */}
                    {statusLabel && (
                        <div className="flex items-end gap-2.5 pl-1">
                            <img src="/kea.svg" alt="Kea" className="h-6 w-6 shrink-0 rounded-full shadow-sm border border-zinc-100 grayscale-[30%] opacity-70" />
                            <div className="flex items-center gap-2.5 rounded-[16px] rounded-bl-[4px] bg-white border border-zinc-100 shadow-sm px-3.5 py-2.5 text-[11px] text-zinc-500 font-medium tracking-wide">
                                <span className="flex gap-1">
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
                <AnimatePresence>
                    {showScrollBtn && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={() => scrollToBottom()}
                            className="absolute bottom-[88px] right-6 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white border border-zinc-200 shadow-md text-zinc-500 hover:text-zinc-900 transition-colors"
                        >
                            <ChevronDown className="h-4 w-4" />
                        </motion.button>
                    )}
                </AnimatePresence>

                {/* ─── Input ────────────────────────────── */}
                <form onSubmit={onFormSubmit} className="shrink-0 bg-white/80 backdrop-blur-md px-4 py-4 pt-2">
                    <div className="flex items-end gap-2.5 rounded-[20px] border border-zinc-200 bg-white px-3.5 py-2.5 shadow-sm focus-within:border-amber-400 focus-within:ring-[3px] focus-within:ring-amber-500/10 transition-all duration-200">
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask Kea about your traffic…"
                            rows={1}
                            disabled={isLoading}
                            className="flex-1 resize-none bg-transparent text-[13px] tracking-tight text-zinc-900 placeholder:text-zinc-400 outline-none max-h-28 disabled:opacity-50 my-1 ml-1"
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
                                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-200",
                                "bg-zinc-900 text-white hover:bg-zinc-800 hover:scale-105 active:scale-95 shadow-md",
                                "disabled:opacity-100 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 disabled:hover:scale-100 disabled:shadow-none"
                            )}
                        >
                            <Send className="h-3.5 w-3.5 ml-0.5" />
                        </button>
                    </div>
                    <div className="mt-2.5 flex justify-center items-center gap-1.5 text-[10px] text-zinc-400 font-medium">
                        <span>Press</span>
                        <kbd className="px-1.5 py-0.5 bg-zinc-100 rounded text-zinc-500 border border-zinc-200/60 font-sans">Enter</kbd>
                        <span>to send</span>
                    </div>
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
            <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-strong:font-semibold prose-strong:text-current prose-headings:text-current prose-a:text-inherit prose-a:underline hover:prose-a:opacity-80">
                {textParts.map((part: any, i: number) => (
                    <ReactMarkdown key={i}>{part.text}</ReactMarkdown>
                ))}
            </div>
        )
    }

    if (msg.content) {
        return (
            <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-strong:font-semibold prose-strong:text-current prose-headings:text-current prose-a:text-inherit prose-a:underline hover:prose-a:opacity-80">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
        )
    }

    return null
}
