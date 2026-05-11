"use client"

import { motion, useReducedMotion } from "framer-motion"
import { AddPropertyModal } from "./add-property-modal"
import { Plus } from "lucide-react"

export function EmptyPropertyCTA() {
    const reduced = useReducedMotion()

    return (
        <div className="relative flex items-center">
            {/* Curved arrow pointing right toward the button */}
            {!reduced && (
                <div className="relative mr-1 hidden sm:block">
                    <svg
                        width="48"
                        height="36"
                        viewBox="0 0 48 36"
                        fill="none"
                        className="overflow-visible"
                    >
                        {/* Curved dashed path */}
                        <motion.path
                            d="M4 28 C8 28, 12 8, 36 14"
                            stroke="#f59e0b"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeDasharray="3 3"
                            fill="none"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        />
                        {/* Arrowhead */}
                        <motion.path
                            d="M33 10 L37 14 L32 17"
                            stroke="#f59e0b"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2, delay: 0.95 }}
                        />
                        {/* Small sparkles */}
                        <motion.circle
                            cx="6"
                            cy="26"
                            r="1.5"
                            fill="#f59e0b"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 0.7] }}
                            transition={{ delay: 0.1, duration: 0.4 }}
                        />
                        <motion.circle
                            cx="14"
                            cy="12"
                            r="1"
                            fill="#fbbf24"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 0] }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                        />
                    </svg>
                    {/* "start here" label */}
                    <motion.span
                        className="absolute -bottom-0.5 left-0 text-[9px] font-medium text-amber-500/80 whitespace-nowrap tracking-wide"
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.1, duration: 0.3 }}
                    >
                        start here
                    </motion.span>
                </div>
            )}

            {/* The button with pulse ring */}
            <AddPropertyModal>
                <motion.div
                    className="relative flex items-center gap-1.5 cursor-pointer rounded-md px-2.5 py-1.5 text-[11px] font-medium text-amber-600 bg-amber-500/10 hover:bg-amber-500/20 transition-colors"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15, duration: 0.35, ease: "easeOut" }}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                >
                    {/* Pulse ring */}
                    {!reduced && (
                        <motion.span
                            className="absolute inset-0 rounded-md border border-amber-400"
                            initial={{ opacity: 0.7, scale: 1 }}
                            animate={{ opacity: 0, scale: 1.35 }}
                            transition={{
                                duration: 1.4,
                                repeat: Infinity,
                                repeatDelay: 1.2,
                                ease: "easeOut",
                                delay: 1.2,
                            }}
                        />
                    )}
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Property</span>
                </motion.div>
            </AddPropertyModal>
        </div>
    )
}
