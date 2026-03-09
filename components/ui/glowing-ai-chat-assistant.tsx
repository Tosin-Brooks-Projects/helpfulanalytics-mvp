"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Paperclip, Link, Code, Mic, Send, Info, Bot, X, Sparkles } from 'lucide-react'
import { useKeaChat } from "@/components/linear/kea-chat-context"
import { motion, AnimatePresence } from "framer-motion"
import ReactMarkdown from "react-markdown"
import { cn } from "@/lib/utils"

const FloatingAiAssistant = () => {
    const [isChatOpen, setIsChatOpen] = useState(false)
    const { messages, sendMessage, input, setInput, resetChat, isLoading, status } = useKeaChat()
    const chatRef = useRef<HTMLDivElement>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const maxChars = 2000

    const charCount = input.length

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value)
    }

    const handleSend = () => {
        if (input.trim() && !isLoading) {
            sendMessage({ role: "user", content: input.trim() } as any)
            setInput('')
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    // Close chat when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
                if (!(event.target as HTMLElement).closest('.floating-ai-button')) {
                    setIsChatOpen(false)
                }
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    useEffect(() => {
        if (isChatOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages, isChatOpen])

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Floating 3D Glowing AI Logo with Kea Theme */}
            <button
                className={`floating-ai-button relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 transform ${isChatOpen ? 'rotate-90' : 'rotate-0'
                    }`}
                onClick={() => setIsChatOpen(!isChatOpen)}
                style={{
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.9) 0%, rgba(217, 119, 6, 0.9) 100%)',
                    boxShadow: '0 0 20px rgba(245, 158, 11, 0.7), 0 0 40px rgba(217, 119, 6, 0.5), 0 0 60px rgba(180, 83, 9, 0.3)',
                    border: '2px solid rgba(255, 255, 255, 0.2)',
                }}
            >
                <div className="absolute inset-0 rounded-full bg-gradient-to-b from-white/20 to-transparent opacity-30"></div>
                <div className="absolute inset-0 rounded-full border-2 border-white/10"></div>

                <div className="relative z-10">
                    {isChatOpen ? <X className="text-white" /> : <img src="/kea.svg" alt="Kea" className="w-10 h-10 rounded-full" />}
                </div>

                <div className="absolute inset-0 rounded-full animate-ping opacity-20 bg-amber-500"></div>
            </button>

            {/* Chat Interface */}
            <AnimatePresence>
                {isChatOpen && (
                    <motion.div
                        ref={chatRef}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="absolute bottom-20 right-0 w-[450px] max-w-[calc(100vw-2rem)] shadow-2xl"
                    >
                        <div className="relative flex flex-col rounded-3xl bg-zinc-900/95 border border-white/10 backdrop-blur-3xl overflow-hidden">

                            {/* Header */}
                            <div className="flex items-center justify-between px-6 pt-5 pb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-xs font-semibold text-zinc-300 tracking-wide uppercase">Kea Assistant</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-0.5 text-[10px] font-bold bg-white/10 text-zinc-300 rounded-full border border-white/5">
                                        GA4-GPT
                                    </span>
                                    <span className="px-2.5 py-0.5 text-[10px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full">
                                        Active
                                    </span>
                                    <button
                                        onClick={() => setIsChatOpen(false)}
                                        className="p-1.5 rounded-full hover:bg-white/10 transition-colors"
                                    >
                                        <X className="w-4 h-4 text-zinc-500" />
                                    </button>
                                </div>
                            </div>

                            {/* Chat Messages Section */}
                            <div className="flex-1 max-h-[400px] min-h-[150px] overflow-y-auto px-6 py-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700">
                                {messages.map((msg, idx) => (
                                    <div key={idx} className={cn(
                                        "flex flex-col gap-1",
                                        msg.role === 'user' ? "items-end" : "items-start"
                                    )}>
                                        <div className={cn(
                                            "max-w-[85%] px-4 py-2.5 rounded-2xl text-sm",
                                            msg.role === 'user'
                                                ? "bg-amber-600 text-white rounded-tr-none"
                                                : "bg-zinc-800 text-zinc-200 rounded-tl-none border border-white/5"
                                        )}>
                                            <div className="prose prose-invert prose-xs max-w-none">
                                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {status === "submitted" && (
                                    <div className="flex items-center gap-1.5 px-4 py-2 bg-zinc-800/50 rounded-2xl w-fit border border-white/5">
                                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"></span>
                                        <span className="text-[10px] text-zinc-400 font-medium ml-1">Kea is thinking...</span>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            {/* Input Section */}
                            <div className="relative border-t border-white/5 px-4 py-4">
                                <textarea
                                    value={input}
                                    onChange={handleInputChange}
                                    onKeyDown={handleKeyDown}
                                    rows={2}
                                    className="w-full px-4 py-3 bg-zinc-800/40 border-zinc-700/50 rounded-2xl outline-none resize-none text-sm leading-relaxed text-zinc-100 placeholder-zinc-500 focus:border-amber-500/50 transition-colors"
                                    placeholder="Ask Kea about your analytics data..."
                                />

                                <div className="flex items-center justify-between mt-3 px-1">
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-xl transition-all">
                                            <Paperclip className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 text-zinc-500 hover:text-amber-500 hover:bg-white/5 rounded-xl transition-all">
                                            <Mic className="w-4 h-4" />
                                        </button>
                                        <button onClick={resetChat} className="p-2 text-zinc-500 hover:text-red-500 hover:bg-white/5 rounded-xl transition-all" title="Clear Chat">
                                            <RotateCcw className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-medium text-zinc-600">
                                            {charCount}/{maxChars}
                                        </span>
                                        <button
                                            onClick={handleSend}
                                            disabled={!input.trim() || isLoading}
                                            className="p-2.5 bg-amber-600 rounded-xl text-white shadow-lg shadow-amber-600/20 hover:bg-amber-500 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
                                        >
                                            <Send className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Status bar */}
                            <div className="px-6 py-2 bg-black/20 flex items-center justify-between text-[10px] text-zinc-600 border-t border-white/5">
                                <div className="flex items-center gap-1.5">
                                    <Info className="w-3 h-3" />
                                    <span>Kea is analyzing GA4 data in real-time</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                    <span>Secure Connection</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx>{`
        .floating-ai-button:hover {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 0 30px rgba(245, 158, 11, 0.9), 0 0 50px rgba(217, 119, 6, 0.7), 0 0 70px rgba(180, 83, 9, 0.5);
        }
      `}</style>
        </div>
    )
}

const RotateCcw = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24" height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
    </svg>
)

export { FloatingAiAssistant }
