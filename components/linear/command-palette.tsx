"use client"

import * as React from "react"
import {
    Settings,
    LayoutDashboard,
    Zap,
    Users,
    Globe,
    FileText,
    Check,
    Search
} from "lucide-react"

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"
import { useDashboard } from "./dashboard-context"
import { useRouter } from "next/navigation"
import { motion, useReducedMotion } from "framer-motion"

const E = [0.23, 1, 0.32, 1] as const

export function CommandPalette() {
    const [open, setOpen] = React.useState(false)
    const [isMac, setIsMac] = React.useState(true)
    const [hovered, setHovered] = React.useState(false)
    const { properties, setSelectedProperty, selectedProperty } = useDashboard()
    const router = useRouter()
    const reduced = useReducedMotion()

    React.useEffect(() => {
        if (typeof window !== "undefined") {
            setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0)
        }

        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [])

    const runCommand = (command: () => void) => {
        setOpen(false)
        command()
    }

    return (
        <>
            <motion.button
                onClick={() => setOpen(true)}
                onHoverStart={() => setHovered(true)}
                onHoverEnd={() => setHovered(false)}
                whileTap={reduced ? undefined : { scale: 0.96 }}
                transition={{ duration: 0.14, ease: E }}
                className="relative flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-400 border border-zinc-200 rounded-lg bg-zinc-50/50 shadow-sm md:w-40 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 transition-colors duration-150 hover:border-zinc-300 hover:text-zinc-700 hover:bg-white"
            >
                {/* Sweep highlight */}
                {!reduced && (
                    <motion.div
                        className="absolute inset-0 pointer-events-none"
                        animate={hovered ? { x: ["−100%", "200%"], opacity: [0, 0.1, 0] } : { opacity: 0 }}
                        transition={{ duration: 0.5, ease: "linear" }}
                        style={{ background: "linear-gradient(90deg, transparent, rgba(245,158,11,0.25), transparent)" }}
                    />
                )}
                <motion.span
                    animate={reduced ? {} : { x: hovered ? -1 : 0 }}
                    transition={{ duration: 0.15, ease: E }}
                >
                    <Search className="h-3 w-3 shrink-0" />
                </motion.span>
                <span className="flex-1 text-left hidden md:inline">Search...</span>
                <kbd className="pointer-events-none hidden h-4 select-none items-center gap-1 rounded border border-zinc-200 bg-zinc-100 px-1.5 font-mono text-[10px] font-medium sm:flex transition-colors duration-150 group-hover:border-zinc-300">
                    <span className="text-[10px]">{isMac ? "⌘" : "Ctrl"}</span>K
                </kbd>
            </motion.button>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList className="custom-scrollbar">
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Navigation">
                        <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
                            <LayoutDashboard className="mr-2 h-4 w-4" />
                            <span>Overview</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/realtime"))}>
                            <Zap className="mr-2 h-4 w-4" />
                            <span>Realtime</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/reports"))}>
                            <FileText className="mr-2 h-4 w-4" />
                            <span>Reports</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/audience"))}>
                            <Users className="mr-2 h-4 w-4" />
                            <span>Audience</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/sources"))}>
                            <Globe className="mr-2 h-4 w-4" />
                            <span>Sources</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Properties">
                        {properties.map((prop) => (
                            <CommandItem
                                key={prop.id}
                                onSelect={() => runCommand(() => setSelectedProperty(prop.id))}
                            >
                                <div className={`mr-2 flex h-4 w-4 items-center justify-center rounded-sm text-[10px] font-bold ${selectedProperty === prop.id ? 'bg-amber-500 text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                                    {prop.name.charAt(0)}
                                </div>
                                <span>{prop.name}</span>
                                {selectedProperty === prop.id && (
                                    <div className="ml-auto text-[10px] font-bold text-amber-500">ACTIVE</div>
                                )}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Date Range">
                        <CommandItem onSelect={() => runCommand(() => document.dispatchEvent(new CustomEvent("set-date-preset", { detail: 7 })))}>
                            <div className="mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-zinc-200 text-[10px] font-bold text-zinc-500">7</div>
                            <span>Last 7 Days</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => document.dispatchEvent(new CustomEvent("set-date-preset", { detail: 30 })))}>
                            <div className="mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-zinc-200 text-[10px] font-bold text-zinc-500">30</div>
                            <span>Last 30 Days</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => document.dispatchEvent(new CustomEvent("set-date-preset", { detail: 90 })))}>
                            <div className="mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-zinc-200 text-[10px] font-bold text-zinc-500">90</div>
                            <span>Last 90 Days</span>
                        </CommandItem>
                        <CommandItem onSelect={() => runCommand(() => document.dispatchEvent(new CustomEvent("set-date-preset", { detail: "year" })))}>
                            <div className="mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-zinc-200 text-[10px] font-bold text-zinc-500">Y</div>
                            <span>Year to Date</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Settings">
                        <CommandItem onSelect={() => runCommand(() => router.push("/dashboard/settings"))}>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                            <CommandShortcut>{isMac ? "⌘" : "Ctrl"}S</CommandShortcut>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    )
}
