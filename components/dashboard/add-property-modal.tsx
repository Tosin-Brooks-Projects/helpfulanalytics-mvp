"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, ChevronRight, BarChart2, Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useDashboard } from "@/components/linear/dashboard-context"
import { mutate } from "swr"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"

export function AddPropertyModal({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [submitting, setSubmitting] = useState<string | null>(null)
    const [query, setQuery] = useState("")
    const { availableProperties, loading: contextLoading } = useDashboard()
    const { toast } = useToast()
    const router = useRouter()
    const reduced = useReducedMotion()

    const filtered = availableProperties.filter((p: any) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.id.includes(query)
    )

    const handleSelect = async (property: any) => {
        if (submitting) return
        setSubmitting(property.id)
        try {
            const res = await fetch("/api/user/properties", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    propertyId: property.id,
                    propertyName: property.name,
                    accountId: property.accountId
                })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to save property")

            toast({
                title: "Property added",
                description: `${property.name} is now in your dashboard.`,
            })
            setOpen(false)
            setQuery("")
            await Promise.all([
                mutate("/api/user/properties"),
                mutate("/api/analytics/properties"),
            ])
            router.refresh()

        } catch (error: any) {
            console.error(error)
            toast({
                title: "Couldn't add property",
                description: error.message || "Something went wrong.",
                variant: "destructive"
            })
        } finally {
            setSubmitting(null)
        }
    }

    const itemVariants = {
        hidden: { opacity: 0, y: reduced ? 0 : 6 },
        visible: (i: number) => ({
            opacity: 1,
            y: 0,
            transition: { duration: 0.22, delay: reduced ? 0 : i * 0.045, ease: [0.25, 0.1, 0.25, 1] }
        }),
    }

    return (
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setQuery("") }}>
            <DialogTrigger asChild>{children}</DialogTrigger>

            <DialogContent className="p-0 gap-0 sm:max-w-[420px] bg-white border-zinc-200/80 shadow-xl shadow-zinc-900/8 rounded-2xl overflow-hidden">

                {/* Header */}
                <div className="px-5 pt-5 pb-4 border-b border-zinc-100">
                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10">
                            <BarChart2 className="h-3.5 w-3.5 text-amber-600" strokeWidth={2} />
                        </div>
                        <h2 className="text-[15px] font-semibold text-zinc-900 tracking-tight">Add property</h2>
                    </div>
                    <p className="text-[12px] text-zinc-400 leading-relaxed pl-[calc(1.75rem+10px)]">
                        Connect a GA4 property to start seeing analytics.
                    </p>
                </div>

                {/* Search — only shown when there are properties to filter */}
                {!contextLoading && availableProperties.length > 3 && (
                    <div className="px-4 pt-3 pb-0">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                            <input
                                type="text"
                                placeholder="Search properties…"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                className="w-full pl-8 pr-3 py-2 text-[12px] bg-zinc-50 border border-zinc-200 rounded-lg text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400 transition-colors"
                            />
                        </div>
                    </div>
                )}

                {/* List */}
                <div className="px-3 py-3 max-h-[320px] overflow-y-auto">
                    <AnimatePresence mode="wait">
                        {contextLoading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-10 gap-2.5"
                            >
                                <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
                                <p className="text-[11px] text-zinc-400">Loading your properties…</p>
                            </motion.div>
                        ) : filtered.length === 0 ? (
                            <motion.div
                                key="empty"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex flex-col items-center justify-center py-10 text-center gap-1.5"
                            >
                                <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center mb-1">
                                    <BarChart2 className="h-4 w-4 text-zinc-400" />
                                </div>
                                <p className="text-[13px] font-medium text-zinc-700">
                                    {query ? "No results" : "No properties available"}
                                </p>
                                <p className="text-[11px] text-zinc-400 max-w-[220px]">
                                    {query ? "Try a different search term." : "All your GA4 properties have already been added."}
                                </p>
                            </motion.div>
                        ) : (
                            <motion.div key="list" className="space-y-0.5">
                                {filtered.map((prop: any, i: number) => {
                                    const isLoading = submitting === prop.id
                                    const isDisabled = !!submitting && !isLoading
                                    const rawId = prop.id.replace(/^properties\//, "")

                                    return (
                                        <motion.button
                                            key={prop.id}
                                            custom={i}
                                            variants={itemVariants}
                                            initial="hidden"
                                            animate="visible"
                                            onClick={() => handleSelect(prop)}
                                            disabled={!!submitting}
                                            className={[
                                                "group w-full flex items-center gap-3 px-2.5 py-2.5 rounded-xl text-left",
                                                "transition-colors duration-150",
                                                isLoading
                                                    ? "bg-amber-50"
                                                    : isDisabled
                                                    ? "opacity-40 cursor-not-allowed"
                                                    : "hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400",
                                            ].join(" ")}
                                        >
                                            {/* Dot */}
                                            <div className="shrink-0 h-2 w-2 rounded-full bg-amber-400 mt-0.5" />

                                            {/* Text */}
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[13px] font-medium text-zinc-900 truncate group-hover:text-zinc-900 leading-snug">
                                                    {prop.name}
                                                </div>
                                                <div className="text-[11px] text-zinc-400 font-mono tabular-nums mt-0.5">
                                                    {rawId}
                                                </div>
                                            </div>

                                            {/* Action indicator */}
                                            <div className="shrink-0 ml-1">
                                                {isLoading ? (
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
                                                ) : (
                                                    <ChevronRight className="h-3.5 w-3.5 text-zinc-300 group-hover:text-amber-500 transition-all duration-150 group-hover:translate-x-0.5" />
                                                )}
                                            </div>
                                        </motion.button>
                                    )
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </DialogContent>
        </Dialog>
    )
}
