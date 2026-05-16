"use client"

export const dynamic = "force-dynamic"

import { useRef, useEffect, useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { LinearShell } from "@/components/linear/linear-shell"
import { useKeaChat } from "@/components/linear/kea-chat-context"
import { Send, Plus, Sparkles, MessageSquare, Trash2, Menu, Minimize2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
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
    getMetricsOverview: { label: "Site metrics", icon: "📊" },
    getTrafficSources: { label: "Traffic sources", icon: "🔗" },
    getTopPages: { label: "Top pages", icon: "📄" },
    getDeviceBreakdown: { label: "Device data", icon: "📱" },
    getLocationData: { label: "Location data", icon: "🌍" },
    getRealtimeSnapshot: { label: "Live visitors", icon: "⚡" },
    getTrafficByState: { label: "State data", icon: "📍" },
    getTrafficByCity: { label: "City data", icon: "🏙️" },
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

    const sortedSessions = [...sessions].sort((a, b) => b.updatedAt - a.updatedAt)

    return (
        <LinearShell>
            <div className="flex bg-white h-[calc(100vh-8rem)] rounded-[24px] border border-zinc-200/80 overflow-hidden shadow-sm shadow-zinc-900/5 max-w-6xl mx-auto">
                
                {/* ─── History Sidebar ──────────────────────── */}
                <div className={cn(
                    "w-64 border-r border-zinc-200/60 bg-zinc-50/30 flex flex-col shrink-0 transition-transform duration-300 md:translate-x-0 absolute md:static inset-y-0 left-0 z-30 h-full backdrop-blur-xl",
                    sidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
                )}>
                    <div className="p-5 border-b border-zinc-200/60 flex items-center justify-between">
                        <button
                            onClick={() => { resetChat(); setSidebarOpen(false); }}
                            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-white border border-zinc-200 hover:border-amber-300 hover:bg-amber-50/50 text-zinc-700 hover:text-amber-900 px-4 py-2.5 text-[13px] font-medium transition-all shadow-sm"
                        >
                            <Plus className="h-4 w-4" />
                            New chat
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-3 space-y-0.5">
                        {sortedSessions.length === 0 ? (
                            <div className="py-8 text-center text-xs text-zinc-400 font-medium">No previous chats</div>
                        ) : (
                            sortedSessions.map(session => (
                                <div
                                    key={session.id}
                                    className={cn(
                                        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] cursor-pointer transition-all",
                                        currentSessionId === session.id
                                            ? "bg-amber-50/80 text-amber-900 font-medium border border-amber-200/60 shadow-sm"
                                            : "hover:bg-white text-zinc-600 border border-transparent hover:border-zinc-200 hover:shadow-sm"
                                    )}
                                    onClick={() => { switchSession(session.id); setSidebarOpen(false); }}
                                >
                                    <MessageSquare className={cn("h-4 w-4 shrink-0 transition-opacity", currentSessionId === session.id ? "opacity-100 text-amber-500" : "opacity-40")} />
                                    <div className="flex-1 min-w-0">
                                        <div className="truncate tracking-tight">{session.title}</div>
                                        <div className={cn("text-[10px] mt-0.5 font-medium tracking-wide", currentSessionId === session.id ? "text-amber-600/70" : "text-zinc-400")}>
                                            {formatSessionDate(session.updatedAt)}
                                        </div>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }}
                                        className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 rounded p-1 hover:bg-red-50 transition-all shrink-0"
                                        title="Delete chat"
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
                        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 shrink-0 bg-white/80 backdrop-blur-md">
                            <div className="flex items-center gap-3.5">
                                <button
                                    className="md:hidden p-2 -ml-2 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg shrink-0 transition-colors"
                                    onClick={() => setSidebarOpen(true)}
                                >
                                    <Menu className="h-5 w-5" />
                                </button>
                                <div className="relative shrink-0">
                                    <img src="/kea.svg" alt="Kea" className="h-10 w-10 rounded-full shadow-sm border border-zinc-100" />
                                    <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-[2.5px] border-white bg-emerald-500" />
                                </div>
                                <div className="min-w-0">
                                    <h1 className="text-[17px] font-semibold text-zinc-900 tracking-tight leading-none mb-1">Kea</h1>
                                    <p className="text-[12px] font-medium text-zinc-500 hidden sm:block truncate leading-none tracking-wide">Your AI analytics assistant</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => router.push("/dashboard")}
                                    aria-label="Minimize to dashboard"
                                    title="Back to dashboard"
                                    className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100/80 hover:text-zinc-700 transition-colors"
                                >
                                    <Minimize2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div
                            ref={scrollContainerRef}
                            className="flex-1 overflow-y-auto p-4 sm:p-8 flex flex-col items-center"
                        >
                            <div className="w-full max-w-3xl space-y-6">
                                {messages.map((rawMsg, i) => {
                                    const msg = rawMsg as any
                                    return (
                                        <div key={msg.id || i} className="flex flex-col gap-2.5">
                                            {/* Message bubble */}
                                            <div className={cn("flex items-end gap-3", msg.role === "user" ? "justify-end" : "justify-start")}>
                                                {msg.role === "assistant" && (
                                                    <img src="/kea.svg" alt="Kea" className="h-8 w-8 shrink-0 rounded-full shadow-sm border border-zinc-100" />
                                                )}
                                                <div
                                                    className={cn(
                                                        "max-w-[85%] px-5 py-3.5 text-[14px] leading-relaxed transition-all",
                                                        msg.role === "user"
                                                            ? "bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-md shadow-amber-500/15 rounded-[24px] rounded-br-[6px]"
                                                            : "bg-white border border-zinc-100 shadow-sm text-zinc-800 rounded-[24px] rounded-bl-[6px]"
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
                                                    <div key={pi} className="flex justify-start pl-[44px]">
                                                        <div className={cn(
                                                            "flex items-center gap-3 rounded-xl px-4 py-2.5 text-[12px] font-medium transition-all shadow-sm",
                                                            hasResult
                                                                ? "bg-white border border-zinc-200 text-zinc-600"
                                                                : "bg-amber-50/50 border border-amber-200 text-amber-700"
                                                        )}>
                                                            <span className="text-[14px]">{toolInfo.icon}</span>
                                                            {hasResult ? (
                                                                <span className="tracking-tight">Loaded {toolInfo.label}</span>
                                                            ) : (
                                                                <span className="flex items-center gap-2.5 tracking-tight">
                                                                    <span className="relative flex h-2 w-2">
                                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                                                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6">
                                        {SUGGESTED_PROMPTS.map((prompt, idx) => (
                                            <motion.button
                                                initial={{ opacity: 0, y: 15 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05, duration: 0.4, ease: "easeOut" }}
                                                key={prompt}
                                                onClick={() => {
                                                    sendMessage({ role: "user", content: prompt } as any)
                                                    setInput("")
                                                }}
                                                className="flex items-center gap-3 rounded-[20px] border border-zinc-200 bg-white/50 px-5 py-4 text-left text-[14px] font-medium text-zinc-600 hover:bg-white hover:text-zinc-900 hover:border-zinc-300 hover:shadow-sm transition-all"
                                            >
                                                <Sparkles className="h-4 w-4 text-amber-400 shrink-0" />
                                                <span className="tracking-tight">{prompt}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                )}

                                {/* Typing / status indicator */}
                                {statusLabel && (
                                    <div className="flex items-end gap-3 pl-1">
                                        <img src="/kea.svg" alt="Kea" className="h-8 w-8 shrink-0 rounded-full shadow-sm border border-zinc-100 grayscale-[30%] opacity-70" />
                                        <div className="flex items-center gap-3 rounded-[20px] rounded-bl-[6px] bg-white border border-zinc-100 shadow-sm px-4 py-3 text-[12px] text-zinc-500 font-medium tracking-wide">
                                            <span className="flex gap-1.5">
                                                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]" />
                                                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" />
                                                <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" />
                                            </span>
                                            {statusLabel}
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} className="h-4" />
                            </div>
                        </div>

                        {/* Input Area */}
                        <div className="px-4 sm:px-8 py-5 border-t border-zinc-100 bg-white/80 backdrop-blur-md shrink-0 flex justify-center">
                            <form onSubmit={(e) => { e.preventDefault(); handleSend() }} className="w-full max-w-3xl">
                                <div className="flex items-end gap-3 rounded-[24px] border border-zinc-200 bg-white px-4 py-3 shadow-sm focus-within:border-amber-400 focus-within:ring-[4px] focus-within:ring-amber-500/10 transition-all duration-200">
                                    <textarea
                                        ref={inputRef}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Ask Kea about your traffic and metrics..."
                                        rows={1}
                                        disabled={isLoading}
                                        className="flex-1 resize-none bg-transparent text-[14px] tracking-tight text-zinc-900 placeholder:text-zinc-400 outline-none max-h-32 disabled:opacity-50 my-1 ml-1"
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
                                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-200",
                                            "bg-zinc-900 text-white hover:bg-zinc-800 hover:scale-105 active:scale-95 shadow-md",
                                            "disabled:opacity-100 disabled:cursor-not-allowed disabled:bg-zinc-100 disabled:text-zinc-400 disabled:hover:scale-100 disabled:shadow-none"
                                        )}
                                    >
                                        <Send className="h-4 w-4 ml-0.5" />
                                    </button>
                                </div>
                                <div className="mt-3 flex justify-center items-center gap-1.5 text-[11px] text-zinc-400 font-medium">
                                    <span>Press</span>
                                    <kbd className="px-1.5 py-0.5 bg-zinc-100 rounded-md text-zinc-500 border border-zinc-200/60 font-sans shadow-sm">Enter</kbd>
                                    <span>to send</span>
                                    <span className="mx-1 opacity-50">·</span>
                                    <kbd className="px-1.5 py-0.5 bg-zinc-100 rounded-md text-zinc-500 border border-zinc-200/60 font-sans shadow-sm">Shift</kbd>
                                    <span>+</span>
                                    <kbd className="px-1.5 py-0.5 bg-zinc-100 rounded-md text-zinc-500 border border-zinc-200/60 font-sans shadow-sm">Enter</kbd>
                                    <span>for new line</span>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* Backdrop for mobile sidebar */}
                <AnimatePresence>
                    {sidebarOpen && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-20 bg-zinc-900/20 backdrop-blur-sm md:hidden"
                            onClick={() => setSidebarOpen(false)}
                        />
                    )}
                </AnimatePresence>
            </div>
        </LinearShell>
    )
}

// ─── Message Content Renderer ────────────────────────────────────

function MessageContent({ msg }: { msg: any }) {
    const textParts = msg.parts?.filter((p: any) => p.type === "text") ?? []

    if (textParts.length > 0) {
        return (
            <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-strong:font-semibold prose-strong:text-current prose-headings:text-current prose-a:text-inherit prose-a:underline hover:prose-a:opacity-80">
                {textParts.map((part: any, i: number) => (
                    <ReactMarkdown key={i}>{part.text}</ReactMarkdown>
                ))}
            </div>
        )
    }

    if (msg.content) {
        return (
            <div className="prose prose-sm max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0.5 prose-strong:font-semibold prose-strong:text-current prose-headings:text-current prose-a:text-inherit prose-a:underline hover:prose-a:opacity-80">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
        )
    }

    return null
}
