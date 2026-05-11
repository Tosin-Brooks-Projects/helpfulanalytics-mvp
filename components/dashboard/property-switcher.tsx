"use client"

import { useRef, useState, useEffect } from "react"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { ChevronDown, Check, Plus, Lock, BarChart2 } from "lucide-react"
import Link from "next/link"
import { AddPropertyModal } from "./add-property-modal"
import { cn } from "@/lib/utils"

interface Property {
    id: string
    name: string
    [key: string]: any
}

interface PropertySwitcherProps {
    properties: Property[]
    selectedProperty: string
    setSelectedProperty: (id: string) => void
    freeSlots: number
    showUpgrade: boolean
}

// Marching ants SVG border for the Add row
function MarchingBorder({ visible }: { visible: boolean }) {
    const reduced = useReducedMotion()
    if (reduced || !visible) return null
    return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <motion.rect
                x="0.5" y="0.5" width="99" height="99" rx="6" ry="6"
                fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5 4"
                animate={{ strokeDashoffset: [0, -18] }}
                transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
            />
        </svg>
    )
}

// Animated amber dot with pulse for active property
function ActiveDot({ active }: { active: boolean }) {
    const reduced = useReducedMotion()
    return (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
            <span className={cn("relative inline-flex rounded-full h-1.5 w-1.5", active ? "bg-amber-400" : "bg-zinc-300")} />
            {active && !reduced && (
                <motion.span
                    className="absolute inset-0 rounded-full bg-amber-400"
                    animate={{ scale: [1, 2.2], opacity: [0.5, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                />
            )}
        </span>
    )
}

export function PropertySwitcher({ properties, selectedProperty, setSelectedProperty, freeSlots, showUpgrade }: PropertySwitcherProps) {
    const [open, setOpen] = useState(false)
    const [addHovered, setAddHovered] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const reduced = useReducedMotion()

    const current = properties.find(p => p.id === selectedProperty)

    // Click outside to close
    useEffect(() => {
        if (!open) return
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [open])

    return (
        <div ref={ref} className="relative">
            {/* Trigger */}
            <motion.button
                onClick={() => setOpen(v => !v)}
                className={cn(
                    "flex items-center gap-1.5 h-8 px-2.5 rounded-md text-[11px] font-medium",
                    "bg-white/50 hover:bg-white/80 border border-white/20 shadow-sm backdrop-blur-sm",
                    "text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
                    "transition-colors duration-150",
                    open && "bg-white/80"
                )}
                whileTap={{ scale: 0.97 }}
            >
                <ActiveDot active={true} />
                <span className="max-w-[120px] truncate">{current?.name ?? "Select property"}</span>
                <motion.span
                    animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                >
                    <ChevronDown className="h-3 w-3 text-zinc-400" />
                </motion.span>
            </motion.button>

            {/* Dropdown */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -6 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -6 }}
                        transition={{ duration: reduced ? 0 : 0.18, ease: [0.25, 0.1, 0.25, 1] }}
                        className="absolute right-0 top-[calc(100%+6px)] z-50 w-[220px] rounded-xl bg-white border border-zinc-200/80 shadow-xl shadow-zinc-900/8 overflow-hidden"
                        style={{ transformOrigin: "top right" }}
                    >
                        {/* Property list — clip-path reveal, no per-item stagger */}
                        <div className="p-1.5">
                            <p className="text-[10px] font-medium text-zinc-400 px-2 pt-1 pb-1.5 tracking-wide">
                                Properties
                            </p>
                            <motion.div
                                initial={reduced ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0 round 8px)", opacity: 0 }}
                                animate={reduced ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0 round 8px)", opacity: 1 }}
                                transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                            >
                                {properties.map((prop) => {
                                    const isActive = prop.id === selectedProperty
                                    return (
                                        <button
                                            key={prop.id}
                                            onClick={() => { setSelectedProperty(prop.id); setOpen(false) }}
                                            className={cn(
                                                "group w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left",
                                                "transition-colors duration-150",
                                                isActive ? "bg-amber-50" : "hover:bg-zinc-50"
                                            )}
                                        >
                                            <ActiveDot active={isActive} />
                                            <span className={cn(
                                                "flex-1 truncate text-[12px] font-medium",
                                                isActive ? "text-amber-700" : "text-zinc-700 group-hover:text-zinc-900"
                                            )}>
                                                {prop.name}
                                            </span>
                                            <AnimatePresence>
                                                {isActive && (
                                                    <motion.span
                                                        initial={{ scale: 0, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        exit={{ scale: 0, opacity: 0 }}
                                                        transition={{ duration: 0.15 }}
                                                    >
                                                        <Check className="h-3 w-3 text-amber-500 shrink-0" />
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                        </button>
                                    )
                                })}
                            </motion.div>
                        </div>

                        {/* Footer actions */}
                        <div className="border-t border-zinc-100 p-1.5 space-y-0.5">
                            {freeSlots > 0 && (
                                <AddPropertyModal>
                                    <motion.div
                                        className="relative group flex items-center gap-2 w-full px-2 py-2 rounded-lg text-[12px] font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors duration-150 cursor-pointer overflow-hidden"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ duration: 0.18, delay: 0.08 }}
                                        onMouseEnter={() => setAddHovered(true)}
                                        onMouseLeave={() => setAddHovered(false)}
                                    >
                                        <MarchingBorder visible={addHovered} />
                                        <div className="flex h-4 w-4 items-center justify-center rounded-md border border-zinc-200 group-hover:border-amber-300 transition-colors">
                                            <Plus className="h-2.5 w-2.5 text-zinc-400 group-hover:text-amber-500 transition-colors" />
                                        </div>
                                        <span>Add property</span>
                                        <span className="ml-auto text-[10px] text-zinc-400 bg-zinc-100 group-hover:bg-amber-50 group-hover:text-amber-600 px-1.5 py-0.5 rounded-md tabular-nums transition-colors">
                                            {freeSlots} left
                                        </span>
                                    </motion.div>
                                </AddPropertyModal>
                            )}

                            {showUpgrade && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.18, delay: 0.12 }}
                                >
                                    <Link
                                        href="/dashboard/settings"
                                        onClick={() => setOpen(false)}
                                        className="flex items-center gap-2 w-full px-2 py-2 rounded-lg text-[12px] font-medium text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition-colors"
                                    >
                                        <Lock className="h-3.5 w-3.5" />
                                        <span>Upgrade plan</span>
                                    </Link>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
