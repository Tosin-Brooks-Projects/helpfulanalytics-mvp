"use client"

import { createContext, useContext, useEffect, useState, useCallback, ReactNode, useRef } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { useDashboard } from "@/components/linear/dashboard-context"

const STORAGE_KEY = "kea_chat_history"
const STORAGE_VERSION_KEY = "kea_chat_version"
const CURRENT_VERSION = "v4"

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
}

const KeaChatContext = createContext<KeaChatContextType | undefined>(undefined)

export function KeaChatProvider({ children }: { children: ReactNode }) {
    const { selectedProperty, dateRange } = useDashboard()
    const [isClient, setIsClient] = useState(false)
    const [input, setInput] = useState("")
    const hasMounted = useRef(false)

    useEffect(() => { setIsClient(true) }, [])

    const startDate = isClient && dateRange?.from ? dateRange.from.toISOString().split("T")[0] : "30daysAgo"
    const endDate = isClient && dateRange?.to ? dateRange.to.toISOString().split("T")[0] : "today"

    // Load saved messages from localStorage (with version check)
    const loadSavedMessages = (): any[] => {
        if (typeof window === "undefined") return INITIAL_MESSAGES
        try {
            const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY)
            if (storedVersion !== CURRENT_VERSION) {
                // Old format — clear and start fresh
                localStorage.removeItem(STORAGE_KEY)
                localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION)
                return INITIAL_MESSAGES
            }
            const saved = localStorage.getItem(STORAGE_KEY)
            if (saved) {
                const parsed = JSON.parse(saved)
                if (Array.isArray(parsed) && parsed.length > 0) return parsed
            }
        } catch {
            // ignore parse errors
        }
        return INITIAL_MESSAGES
    }

    const { messages, sendMessage, setMessages, stop, status } = useChat({
        initialMessages: loadSavedMessages() as any,
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

    // Persist messages to localStorage whenever they change
    useEffect(() => {
        if (!hasMounted.current) {
            hasMounted.current = true
            // Hydrate saved messages from localStorage *after* mount to avoid SSR mismatch
            if (typeof window !== "undefined") {
                const saved = loadSavedMessages()
                // If we found saved messages (and not just the default welcome message), set them
                if (saved.length > 1 || (saved.length === 1 && saved[0].id !== "welcome-message")) {
                    setMessages(saved as any)
                }
            }
            return
        }

        if (messages.length > 0) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
                localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION)
            } catch {
                // storage full or unavailable
            }
        }
    }, [messages, setMessages])

    const resetChat = useCallback(() => {
        stop()
        setMessages(INITIAL_MESSAGES as any)
        localStorage.removeItem(STORAGE_KEY)
    }, [stop, setMessages])

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
