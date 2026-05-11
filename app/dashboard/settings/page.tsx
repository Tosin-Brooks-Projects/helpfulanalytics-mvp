"use client"

import { useEffect, useState, useRef } from "react"
import { LinearShell } from "@/components/linear/linear-shell"
import { BillingSettings } from "@/components/linear"
import { LinearGraphCard } from "@/components/linear/linear-graph-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDashboard } from "@/components/linear/dashboard-context"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Plus, Check, Trash2, BarChart2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { mutate } from "swr"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { AddPropertyModal } from "@/components/dashboard/add-property-modal"
import { cn } from "@/lib/utils"

// ─── Animated SVG: orbiting ring on active card ───────────────────────────────
function OrbitRing({ active }: { active: boolean }) {
    const reduced = useReducedMotion()
    if (reduced) return null
    return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <motion.rect
                x="1" y="1" width="98" height="98" rx="10" ry="10"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="6 4"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={active ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
            />
            {active && (
                <motion.rect
                    x="1" y="1" width="98" height="98" rx="10" ry="10"
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="0.5"
                    strokeDasharray="6 4"
                    strokeDashoffset={0}
                    animate={{ strokeDashoffset: [0, -20] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                    opacity={0.5}
                />
            )}
        </svg>
    )
}

// ─── Animated SVG: marching ants on "add" card ────────────────────────────────
function MarchingAnts() {
    const reduced = useReducedMotion()
    return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <rect
                x="1" y="1" width="98" height="98" rx="10" ry="10"
                fill="none"
                stroke="#d4d4d8"
                strokeWidth="1.5"
                strokeDasharray="5 4"
            />
            {!reduced && (
                <motion.rect
                    x="1" y="1" width="98" height="98" rx="10" ry="10"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="1"
                    strokeDasharray="5 4"
                    strokeDashoffset={0}
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    animate={{ strokeDashoffset: [0, -18] }}
                    transition={{
                        strokeDashoffset: { duration: 1.2, repeat: Infinity, ease: "linear" },
                        opacity: { duration: 0.2 },
                    }}
                />
            )}
        </svg>
    )
}

// ─── Animated SVG: breaking bond for delete zone ─────────────────────────────
function BreakBond({ hovered }: { hovered: boolean }) {
    const reduced = useReducedMotion()
    const split = !reduced && hovered
    return (
        <svg width="48" height="24" viewBox="0 0 48 24" fill="none" className="shrink-0">
            {/* Left node */}
            <motion.circle
                cx="8" cy="12" r="4"
                fill="#fef2f2"
                stroke="#fca5a5"
                strokeWidth="1.5"
                animate={split ? { cx: 5 } : { cx: 8 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
            />
            {/* Right node */}
            <motion.circle
                cx="40" cy="12" r="4"
                fill="#fef2f2"
                stroke="#fca5a5"
                strokeWidth="1.5"
                animate={split ? { cx: 43 } : { cx: 40 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
            />
            {/* Left half of link */}
            <motion.line
                x1="12" y1="12" x2="22" y2="12"
                stroke="#fca5a5"
                strokeWidth="1.5"
                strokeLinecap="round"
                animate={split ? { x2: 19, opacity: 0.4 } : { x2: 22, opacity: 1 }}
                transition={{ duration: 0.25 }}
            />
            {/* Right half of link */}
            <motion.line
                x1="26" y1="12" x2="36" y2="12"
                stroke="#fca5a5"
                strokeWidth="1.5"
                strokeLinecap="round"
                animate={split ? { x1: 29, opacity: 0.4 } : { x1: 26, opacity: 1 }}
                transition={{ duration: 0.25 }}
            />
            {/* Gap sparks */}
            <AnimatePresence>
                {split && !reduced && (
                    <>
                        <motion.circle key="s1" cx="24" cy="10" r="1" fill="#f87171"
                            initial={{ opacity: 0, cy: 12 }} animate={{ opacity: [1, 0], cy: 7 }}
                            exit={{ opacity: 0 }} transition={{ duration: 0.4, repeat: Infinity }} />
                        <motion.circle key="s2" cx="23" cy="14" r="0.8" fill="#fca5a5"
                            initial={{ opacity: 0, cy: 12 }} animate={{ opacity: [1, 0], cy: 16 }}
                            exit={{ opacity: 0 }} transition={{ duration: 0.4, delay: 0.1, repeat: Infinity }} />
                    </>
                )}
            </AnimatePresence>
        </svg>
    )
}

// ─── Save success checkmark ───────────────────────────────────────────────────
function SaveCheckmark() {
    return (
        <motion.svg width="16" height="16" viewBox="0 0 16 16" fill="none"
            initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.2 }}>
            <motion.path d="M3 8l3.5 3.5L13 4.5" stroke="white" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }} />
        </motion.svg>
    )
}

// ─── Property card ────────────────────────────────────────────────────────────
function PropertyCard({
    prop, isActive, isManaged, isGlobal, onClick, index,
}: {
    prop: any; isActive: boolean; isManaged: boolean; isGlobal: boolean; onClick: () => void; index: number
}) {
    const reduced = useReducedMotion()
    const rawId = String(prop.id).replace(/^properties\//, "")

    return (
        <motion.button
            onClick={onClick}
            className="relative w-full sm:w-[140px] shrink-0 rounded-xl bg-white border border-zinc-200 p-3.5 text-left cursor-pointer overflow-hidden transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            initial={{ opacity: 0, y: reduced ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: reduced ? 0 : index * 0.06, ease: "easeOut" }}
            whileTap={{ scale: 0.97 }}
        >
            <OrbitRing active={isManaged} />

            {/* Global active badge */}
            {isGlobal && (
                <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-amber-400">
                    {!reduced && (
                        <motion.span
                            className="absolute inset-0 rounded-full bg-amber-400"
                            animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                            transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                        />
                    )}
                </span>
            )}

            <BarChart2 className={cn("h-4 w-4 mb-2", isManaged ? "text-amber-500" : "text-zinc-400")} strokeWidth={1.8} />
            <div className={cn("text-[12px] font-medium leading-snug truncate", isManaged ? "text-zinc-900" : "text-zinc-700")}>
                {prop.name}
            </div>
            <div className="text-[10px] font-mono text-zinc-400 tabular-nums mt-0.5">{rawId}</div>
        </motion.button>
    )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
    const { properties, selectedProperty, setSelectedProperty, loading: initialLoading, deletionUsage, propertyLimit } = useDashboard()
    const { toast } = useToast()
    const router = useRouter()
    const reduced = useReducedMotion()

    const [managedId, setManagedId] = useState<string>("")
    const [name, setName] = useState("")
    const [timezone, setTimezone] = useState("")
    const [saving, setSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [deleteHovered, setDeleteHovered] = useState(false)
    const [confirmDelete, setConfirmDelete] = useState(false)
    const detailRef = useRef<HTMLDivElement>(null)

    const managedProp = properties.find((p: any) => p.id === managedId)

    // Initialise to currently selected property
    useEffect(() => {
        if (!managedId && selectedProperty) setManagedId(selectedProperty)
    }, [selectedProperty])

    useEffect(() => {
        if (managedProp) {
            setName(managedProp.name || "")
            setTimezone(managedProp.timezone || managedProp.timeZone || "")
            setConfirmDelete(false)
        }
    }, [managedId])

    const handleSave = async () => {
        if (!managedId) return
        setSaving(true)
        try {
            const res = await fetch("/api/user/properties", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ propertyId: managedId, name, timezone })
            })
            if (!res.ok) throw new Error("Failed to update settings")
            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 2000)
            await mutate("/api/user/properties")
            router.refresh()
        } catch {
            toast({ title: "Error", description: "Could not save settings.", variant: "destructive" })
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!managedId) return
        setDeleting(true)
        try {
            const res = await fetch(`/api/user/properties?propertyId=${encodeURIComponent(managedId)}`, { method: "DELETE" })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to delete property")
            toast({ title: "Property removed", description: "It's been disconnected from your dashboard." })
            await mutate("/api/user/properties")
            await mutate("/api/analytics/properties")
            if (data.activeProperty?.id) {
                setSelectedProperty(data.activeProperty.id)
                setManagedId(data.activeProperty.id)
                localStorage.setItem("linear_selected_property", data.activeProperty.id)
            } else {
                setSelectedProperty("")
                setManagedId("")
                localStorage.removeItem("linear_selected_property")
            }
            router.push("/dashboard")
            router.refresh()
        } catch (error) {
            toast({ title: "Error", description: error instanceof Error ? error.message : "Could not delete.", variant: "destructive" })
        } finally {
            setDeleting(false)
            setConfirmDelete(false)
        }
    }

    const deletionsLeft = Math.max(0, 5 - ((deletionUsage && Date.now() < deletionUsage.resetAt) ? deletionUsage.count : 0))

    if (initialLoading) {
        return (
            <LinearShell>
                <div className="flex items-center gap-2.5 text-zinc-400 p-8">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Loading…</span>
                </div>
            </LinearShell>
        )
    }

    return (
        <LinearShell>
            <div className="flex flex-col gap-8 max-w-3xl">

                {/* Page header */}
                <div>
                    <h1 className="text-xl font-semibold tracking-tight text-zinc-900">Settings</h1>
                    <p className="text-sm text-zinc-400 mt-0.5">Manage properties and billing preferences.</p>
                </div>

                {/* Billing */}
                <LinearGraphCard title="Billing & Subscription">
                    <BillingSettings />
                </LinearGraphCard>

                {/* Properties section */}
                <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
                    {/* Section header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-100">
                        <div>
                            <h3 className="text-sm font-semibold text-zinc-900">Properties</h3>
                            <p className="text-[11px] text-zinc-400 mt-0.5 tabular-nums">
                                {properties.length} connected{propertyLimit ? ` · ${propertyLimit - properties.length} slot${propertyLimit - properties.length !== 1 ? "s" : ""} remaining` : ""}
                            </p>
                        </div>
                        <AddPropertyModal>
                            <motion.button
                                className="relative group flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium text-zinc-500 border border-zinc-200 hover:border-amber-400 hover:text-amber-600 transition-colors overflow-hidden"
                                whileTap={{ scale: 0.96 }}
                            >
                                {/* marching ants only on hover */}
                                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 100 100" preserveAspectRatio="none">
                                    {!reduced && (
                                        <motion.rect x="0.5" y="0.5" width="99" height="99" rx="6" ry="6"
                                            fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="5 4"
                                            animate={{ strokeDashoffset: [0, -18] }}
                                            transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                                        />
                                    )}
                                </svg>
                                <Plus className="h-3 w-3" />
                                Add property
                            </motion.button>
                        </AddPropertyModal>
                    </div>

                    {/* Property cards scroll row */}
                    <div className="px-5 py-4 flex gap-3 flex-wrap sm:flex-nowrap sm:overflow-x-auto">
                        {properties.length === 0 ? (
                            <p className="text-sm text-zinc-400 py-2">No properties connected yet.</p>
                        ) : (
                            properties.map((prop: any, i: number) => (
                                <PropertyCard
                                    key={prop.id}
                                    prop={prop}
                                    index={i}
                                    isManaged={managedId === prop.id}
                                    isGlobal={selectedProperty === prop.id}
                                    isActive={selectedProperty === prop.id}
                                    onClick={() => setManagedId(prop.id)}
                                />
                            ))
                        )}
                    </div>

                    {/* Expandable detail panel */}
                    <AnimatePresence initial={false}>
                        {managedProp && (
                            <motion.div
                                key={managedId}
                                ref={detailRef}
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: reduced ? 0 : 0.3, ease: [0.4, 0, 0.2, 1] }}
                                className="overflow-hidden border-t border-zinc-100"
                            >
                                <div className="px-5 py-5 space-y-5">

                                    {/* Property name badge */}
                                    <div className="flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-amber-400" />
                                        <span className="text-[12px] font-medium text-zinc-600">{managedProp.name}</span>
                                        {selectedProperty === managedId && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200 font-medium">
                                                active view
                                            </span>
                                        )}
                                    </div>

                                    {/* Edit fields */}
                                    <div className="grid sm:grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label htmlFor="prop-name" className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Display name</Label>
                                            <Input
                                                id="prop-name"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                className="h-9 text-[13px] bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-lg"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label htmlFor="timezone" className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">Timezone</Label>
                                            <Input
                                                id="timezone"
                                                value={timezone}
                                                onChange={e => setTimezone(e.target.value)}
                                                placeholder="e.g. America/New_York"
                                                className="h-9 text-[13px] bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 rounded-lg"
                                            />
                                        </div>
                                    </div>

                                    <motion.button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex items-center gap-2 rounded-lg px-4 py-2 text-[12px] font-medium bg-amber-500 hover:bg-amber-400 text-white shadow-sm shadow-amber-500/25 transition-colors disabled:opacity-60"
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        <AnimatePresence mode="wait">
                                            {saving ? (
                                                <motion.span key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                </motion.span>
                                            ) : saveSuccess ? (
                                                <motion.span key="check" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                    <SaveCheckmark />
                                                </motion.span>
                                            ) : null}
                                        </AnimatePresence>
                                        {saveSuccess ? "Saved" : "Save changes"}
                                    </motion.button>

                                    {/* Danger zone */}
                                    <div className="rounded-xl border border-rose-100 bg-rose-50/40 p-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3">
                                                <BreakBond hovered={deleteHovered} />
                                                <div>
                                                    <p className="text-[12px] font-semibold text-rose-600">Remove property</p>
                                                    <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
                                                        Disconnects this property from your dashboard. Your GA4 data is untouched.
                                                    </p>
                                                    <p className="text-[10px] text-zinc-400 mt-1 tabular-nums">
                                                        {deletionsLeft} removal{deletionsLeft !== 1 ? "s" : ""} remaining this month
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="shrink-0">
                                                <AnimatePresence mode="wait">
                                                    {!confirmDelete ? (
                                                        <motion.button
                                                            key="arm"
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.95 }}
                                                            onClick={() => setConfirmDelete(true)}
                                                            onMouseEnter={() => setDeleteHovered(true)}
                                                            onMouseLeave={() => setDeleteHovered(false)}
                                                            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-medium text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors"
                                                            whileTap={{ scale: 0.96 }}
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            Remove
                                                        </motion.button>
                                                    ) : (
                                                        <motion.div
                                                            key="confirm"
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            exit={{ opacity: 0, scale: 0.95 }}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <button
                                                                onClick={() => setConfirmDelete(false)}
                                                                className="text-[11px] text-zinc-500 hover:text-zinc-700 px-2 py-1.5"
                                                            >
                                                                Cancel
                                                            </button>
                                                            <motion.button
                                                                onClick={handleDelete}
                                                                disabled={deleting}
                                                                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[11px] font-semibold text-white bg-rose-600 hover:bg-rose-500 shadow-sm disabled:opacity-60 transition-colors"
                                                                whileTap={{ scale: 0.96 }}
                                                                animate={{ scale: [1, 1.03, 1] }}
                                                                transition={{ duration: 0.4, repeat: 1 }}
                                                            >
                                                                {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                                                                Confirm
                                                            </motion.button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>
        </LinearShell>
    )
}
