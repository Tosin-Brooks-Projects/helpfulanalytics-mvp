"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export const useTypewriter = (text: string, speed = 30) => {
    const [displayedText, setDisplayedText] = useState("")

    useEffect(() => {
        let i = 0
        setDisplayedText("")

        const intervalId = setInterval(() => {
            if (i < text.length) {
                // Use substring to ensure we never get "drect" instead of "direct"
                // This is deterministic regardless of render timing.
                i++
                setDisplayedText(text.substring(0, i))
            } else {
                clearInterval(intervalId)
            }
        }, speed)

        return () => clearInterval(intervalId)
    }, [text, speed])

    return displayedText
}

interface TypewriterProps {
    text: string
    speed?: number
    className?: string
    cursor?: boolean
}

export function Typewriter({ text, speed = 30, className, cursor = true }: TypewriterProps) {
    const displayedText = useTypewriter(text, speed)

    return (
        <span className={className}>
            {displayedText}
            {cursor && (
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                    className="inline-block w-[2px] h-[1em] bg-amber-500 ml-0.5 align-middle"
                />
            )}
        </span>
    )
}
