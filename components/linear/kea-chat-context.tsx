"use client"

import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useRef } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useDashboard } from "@/components/linear/dashboard-context"

const STORAGE_KEY = "kea_chat_sessions" // Changed key for new data structure
const STORAGE_VERSION_KEY = "kea_chat_session_version"
const CURRENT_VERSION = "v1"

type InitialMessage = {
    id: string
    role: "assistant"
    content: string
    parts: Array<{ type: "text"; text: string }>
}

const INITIAL_MESSAGES: InitialMessage[] = [
    {
        id: "welcome-message",
        role: "assistant",
        content: "Hey — I'm Kea. I'm plugged directly into your GA4 data and ready to dig in. Ask me anything about your traffic, pages, audience, or performance.",
        parts: [{ type: "text", text: "Hey — I'm Kea. I'm plugged directly into your GA4 data and ready to dig in. Ask me anything about your traffic, pages, audience, or performance." }],
    },
]

export type ChatSession = {
    id: string
    title: string
    updatedAt: number
    messages: any[]
}

interface KeaChatContextType {
    messages: any[]
    sendMessage: (msg: any) => void
    setMessages: (msgs: any) => void
    stop: () => void
    status: string
    input: string
    setInput: (val: string) => void
    resetChat: () => void
    isLoading: boolean
    // Session management
    sessions: ChatSession[]
    currentSessionId: string
    switchSession: (id: string) => void
    deleteSession: (id: string) => void
}

const KeaChatContext = createContext<KeaChatContextType | undefined>(undefined)

function generateSessionId() {
    return Math.random().toString(36).substring(2, 9)
}

function getFirstUserMessage(messages: any[]): string | undefined {
    return messages.find((m) => m.role === "user")?.content
}

export function KeaChatProvider({ children }: { children: ReactNode }) {
    const { selectedProperty, dateRange } = useDashboard()
    const [isClient, setIsClient] = useState(false)
    const [input, setInput] = useState("")
    const hasMounted = useRef(false)

    const [sessions, setSessions] = useState<ChatSession[]>([])
    const [currentSessionId, setCurrentSessionId] = useState<string>("")

    useEffect(() => { setIsClient(true) }, [])

    const startDate = isClient && dateRange?.from ? dateRange.from.toISOString().split("T")[0] : "30daysAgo"
    const endDate = isClient && dateRange?.to ? dateRange.to.toISOString().split("T")[0] : "today"

    // Load saved sessions from localStorage (with version check)
    const loadSavedSessions = useCallback((): ChatSession[] => {
        if (typeof window === "undefined") return []
        try {
            const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY)
            if (storedVersion !== CURRENT_VERSION) {
                // Old format or old single-chat storage — clear and start fresh
                localStorage.removeItem(STORAGE_KEY)
                localStorage.removeItem("kea_chat_history") // Clean up old single-chat key
                localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION)
                return []
            }
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
                const parsed = JSON.parse(saved)
                if (Array.isArray(parsed)) return parsed
            }
        } catch {
            // ignore parse errors
        }
        return []
    }, [])

    const { messages, sendMessage, setMessages, stop, status } = useChat({
        initialMessages: INITIAL_MESSAGES as any,
        transport: new DefaultChatTransport({
            api: "/api/ai/chat",
            body: {
                propertyId: selectedProperty || "demo-property",
                startDate,
                endDate,
            },
        }),
        onError: (err) => {
            console.error("Kea chat error:", err)
        },
    })

    const isLoading = status === "submitted" || status === "streaming"

    // Initial Hydration
    useEffect(() => {
        if (!hasMounted.current && typeof window !== "undefined") {
            hasMounted.current = true
            const savedSessions = loadSavedSessions()
            setSessions(savedSessions)

            if (savedSessions.length > 0) {
                // Load the most recently updated session
                const mostRecent = savedSessions.reduce((prev, current) =>
                    (prev.updatedAt > current.updatedAt) ? prev : current
                )
                setCurrentSessionId(mostRecent.id)
                setMessages(mostRecent.messages as any)
            } else {
                // Initialize a new clear session
                const newId = generateSessionId()
                setCurrentSessionId(newId)
                setSessions([{
                    id: newId,
                    title: "New Chat",
                    updatedAt: Date.now(),
                    messages: INITIAL_MESSAGES,
                }])
            }
        }
    }, [loadSavedSessions, setMessages])

    // Sync messages to the current session whenever messages change
    useEffect(() => {
        if (!hasMounted.current || !currentSessionId) return

        setSessions((prev) => {
            const sessionIndex = prev.findIndex((s) => s.id === currentSessionId)
            let updatedSessions = [...prev]

            // Derive title from first user message, fallback to "New Chat"
            const firstUserMsg = getFirstUserMessage(messages)
            const title = firstUserMsg ? (firstUserMsg.length > 30 ? firstUserMsg.slice(0, 30) + "..." : firstUserMsg) : "New Chat"

            if (sessionIndex >= 0) {
                updatedSessions[sessionIndex] = {
                    ...updatedSessions[sessionIndex],
                    messages,
                    title,
                    updatedAt: Date.now(),
                }
            } else {
                // Failsafe: session got deleted but messages updated? Create it.
                updatedSessions.push({
                    id: currentSessionId,
                    title,
                    updatedAt: Date.now(),
                    messages,
                })
            }

            // Save to local storage
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions))
                localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION)
            } catch { }

            return updatedSessions
        })
    }, [messages, currentSessionId])

    const switchSession = useCallback((id: string) => {
        stop()
        const target = sessions.find((s) => s.id === id)
        if (target) {
            setCurrentSessionId(id)
            setMessages(target.messages as any)
        }
    }, [sessions, stop, setMessages])

    const deleteSession = useCallback((id: string) => {
        setSessions((prev) => {
            const filtered = prev.filter((s) => s.id !== id)
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
            } catch { }

            // If we deleted the active session, switch to another or create new
            if (id === currentSessionId) {
                if (filtered.length > 0) {
                    const mostRecent = filtered.reduce((p, c) => (p.updatedAt > c.updatedAt) ? p : c)
                    setCurrentSessionId(mostRecent.id)
                    setMessages(mostRecent.messages as any)
                } else {
                    const newId = generateSessionId()
                    setCurrentSessionId(newId)
                    setMessages(INITIAL_MESSAGES as any)
                    return [{
                        id: newId,
                        title: "New Chat",
                        updatedAt: Date.now(),
                        messages: INITIAL_MESSAGES,
                    }]
                }
            }

            return filtered
        })
    }, [currentSessionId, setMessages])

    const resetChat = useCallback(() => {
        stop()

        // Only create a new session if the current one actually has user messages
        const firstUserMsg = getFirstUserMessage(messages)
        if (!firstUserMsg) {
            // Already an empty chat, don't spam sessions
            return
        }

        const newId = generateSessionId()
        // We defer adding it to `sessions` list until messages are generated (or pre-add it)
        setSessions((prev) => [
            { id: newId, title: "New Chat", updatedAt: Date.now(), messages: INITIAL_MESSAGES },
            ...prev
        ])
        setCurrentSessionId(newId)
        setMessages(INITIAL_MESSAGES as any)
        setInput("")
    }, [stop, setMessages, messages])

    return (
        <KeaChatContext.Provider value={{
            messages,
            sendMessage,
            setMessages,
            stop,
            status,
            input,
            setInput,
            resetChat,
            isLoading,
            sessions,
            currentSessionId,
            switchSession,
            deleteSession,
        }}>
            {children}
        </KeaChatContext.Provider>
    )
}

export function useKeaChat() {
    const context = useContext(KeaChatContext)
    if (context === undefined) {
        throw new Error("useKeaChat must be used within a KeaChatProvider")
    }
    return context
}
