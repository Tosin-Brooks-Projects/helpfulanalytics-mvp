"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, ChevronRight, Loader2, ShieldCheck, BarChart2, ArrowRight, Zap } from "lucide-react"
import { motion, AnimatePresence, useReducedMotion, useMotionValue, useTransform, animate } from "framer-motion"
import { cn } from "@/lib/utils"
import { signOut, useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"

// ─── ease curve (Emil: strong ease-out) ──────────────────────────────────────
const E = [0.23, 1, 0.32, 1] as const

// ─── SVG: animated data graph for step 1 ─────────────────────────────────────
function GraphSVG() {
    const reduced = useReducedMotion()
    const bars = [28, 52, 38, 70, 45, 88, 62, 94, 73, 100]
    return (
        <svg viewBox="0 0 200 80" className="w-full" aria-hidden>
            {bars.map((h, i) => (
                <motion.rect
                    key={i}
                    x={i * 20 + 4}
                    y={80 - h * 0.7}
                    width="14"
                    height={h * 0.7}
                    rx="3"
                    fill={i === 9 ? "#f59e0b" : i >= 7 ? "#fcd34d" : "#e4e4e7"}
                    initial={{ height: 0, y: 80 }}
                    animate={{ height: h * 0.7, y: 80 - h * 0.7 }}
                    transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : i * 0.06, ease: E }}
                />
            ))}
            {/* Trend line */}
            <motion.polyline
                points="11,60 31,46 51,54 71,28 91,42 111,10 131,24 151,6 171,18 191,2"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: reduced ? 0 : 1.2, delay: reduced ? 0 : 0.3, ease: E }}
            />
            {/* Glow dot at end */}
            <motion.circle
                cx="191" cy="2" r="4"
                fill="#f59e0b"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: reduced ? 0 : 1.5 }}
            />
        </svg>
    )
}

// ─── SVG: rotating orbit rings for step 2 ────────────────────────────────────
function OrbitSVG() {
    const reduced = useReducedMotion()
    return (
        <svg viewBox="0 0 120 120" className="w-28 h-28 mx-auto" aria-hidden>
            {/* Outer orbit */}
            <motion.ellipse
                cx="60" cy="60" rx="54" ry="20"
                fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 6" opacity="0.4"
                animate={reduced ? {} : { rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: "60px 60px" }}
            />
            {/* Inner orbit */}
            <motion.ellipse
                cx="60" cy="60" rx="36" ry="13"
                fill="none" stroke="#fbbf24" strokeWidth="1" strokeDasharray="3 5" opacity="0.5"
                animate={reduced ? {} : { rotate: -360 }}
                transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                style={{ transformOrigin: "60px 60px" }}
            />
            {/* Center */}
            <circle cx="60" cy="60" r="14" fill="#fef3c7" stroke="#f59e0b" strokeWidth="1.5" />
            <BarChart2 color="#d97706" width="14" height="14" x="53" y="53" />
            {/* Orbiting dots */}
            {[0, 120, 240].map((deg, i) => (
                <motion.circle
                    key={i}
                    cx={60 + 54 * Math.cos((deg * Math.PI) / 180)}
                    cy={60 + 20 * Math.sin((deg * Math.PI) / 180)}
                    r="4"
                    fill={["#f59e0b", "#fbbf24", "#fcd34d"][i]}
                    animate={reduced ? {} : { rotate: 360 }}
                    transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: i * 0.3 }}
                    style={{ transformOrigin: "60px 60px" }}
                />
            ))}
        </svg>
    )
}

// ─── SVG: success burst for step 3 ───────────────────────────────────────────
function SuccessBurst() {
    const reduced = useReducedMotion()
    const rays = Array.from({ length: 12 }, (_, i) => i * 30)
    return (
        <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden>
            {rays.map((deg, i) => {
                const rad = (deg * Math.PI) / 180
                const x1 = 100 + 40 * Math.cos(rad), y1 = 100 + 40 * Math.sin(rad)
                const x2 = 100 + 80 * Math.cos(rad), y2 = 100 + 80 * Math.sin(rad)
                return (
                    <motion.line
                        key={i}
                        x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke={i % 3 === 0 ? "#f59e0b" : "#fcd34d"}
                        strokeWidth="2" strokeLinecap="round"
                        initial={{ opacity: 0, pathLength: 0 }}
                        animate={{ opacity: [0, 1, 0], pathLength: 1 }}
                        transition={{ duration: reduced ? 0 : 0.6, delay: reduced ? 0 : i * 0.04, ease: E }}
                    />
                )
            })}
            {/* Confetti circles */}
            {[
                { cx: 60, cy: 50, r: 4, fill: "#f59e0b" },
                { cx: 140, cy: 55, r: 3, fill: "#fbbf24" },
                { cx: 55, cy: 145, r: 5, fill: "#fcd34d" },
                { cx: 148, cy: 148, r: 3, fill: "#f59e0b" },
                { cx: 100, cy: 30, r: 4, fill: "#fbbf24" },
                { cx: 170, cy: 100, r: 3, fill: "#fcd34d" },
            ].map((c, i) => (
                <motion.circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill={c.fill}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: [0, 1.4, 1], opacity: [0, 1, 0.6] }}
                    transition={{ duration: reduced ? 0 : 0.5, delay: reduced ? 0 : 0.3 + i * 0.07, ease: E }}
                />
            ))}
        </svg>
    )
}

// ─── SVG: flowing data stream (property list bg) ─────────────────────────────
function DataStreamBg() {
    const reduced = useReducedMotion()
    return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04]" aria-hidden>
            {[20, 60, 100, 140, 180].map((y, i) => (
                <motion.line
                    key={i}
                    x1="0" y1={y} x2="500" y2={y}
                    stroke="#f59e0b" strokeWidth="1" strokeDasharray="4 8"
                    animate={reduced ? {} : { x1: [0, -24], x2: [500, 476] }}
                    transition={{ duration: 2 + i * 0.4, repeat: Infinity, ease: "linear", delay: i * 0.2 }}
                />
            ))}
        </svg>
    )
}

// ─── SVG: animated checkmark path ────────────────────────────────────────────
function AnimatedCheck({ size = 32 }: { size?: number }) {
    const reduced = useReducedMotion()
    return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden>
            <motion.path
                d="M6 16l7 7L26 9"
                stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: reduced ? 0 : 0.5, ease: E }}
            />
        </svg>
    )
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepDots({ step }: { step: number }) {
    const reduced = useReducedMotion()
    return (
        <div className="flex items-center gap-2 justify-center mb-8">
            {[1, 2, 3].map((i) => (
                <motion.div
                    key={i}
                    animate={{
                        width: step === i ? 24 : 8,
                        backgroundColor: step >= i ? "#f59e0b" : "#e4e4e7",
                    }}
                    transition={{ duration: reduced ? 0 : 0.3, ease: E }}
                    className="h-2 rounded-full"
                />
            ))}
        </div>
    )
}

// ─── Shared card wrapper ──────────────────────────────────────────────────────
const cardCls = "bg-white border border-zinc-100 rounded-2xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08),0_1px_4px_-1px_rgba(0,0,0,0.04)]"

// ─── Main Wizard ──────────────────────────────────────────────────────────────
export function OnboardingWizard() {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [properties, setProperties] = useState<any[]>([])
    const router = useRouter()
    const { toast } = useToast()
    const { update } = useSession()
    const reduced = useReducedMotion()

    const fetchProperties = async () => {
        const res = await fetch("/api/analytics/properties")
        if (!res.ok) {
            const data = await res.json().catch(() => ({}))
            if (data.error === "ReauthRequired") {
                throw Object.assign(new Error("ReauthRequired"), { reauth: true })
            }
            throw new Error(data.error || "Failed to fetch properties")
        }
        const data = await res.json()
        setProperties(data.properties || [])
    }

    const handleConnect = async () => {
        setLoading(true)
        try {
            await fetchProperties()
            setStep(2)
        } catch (e: any) {
            if (e?.reauth) {
                toast({ title: "Session expired", description: "Re-connecting your Google account…", variant: "destructive" })
                await signOut({ callbackUrl: "/api/auth/signin" })
                return
            }
            toast({ title: "Couldn't connect", description: e?.message || "Please try again.", variant: "destructive" })
        } finally { setLoading(false) }
    }

    const handleSelectProperty = async (property: any) => {
        setLoading(true)
        try {
            const res = await fetch("/api/user/properties", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ propertyId: property.id, propertyName: property.name, accountId: property.accountId }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || "Failed to save property")
            setStep(3)
        } catch (e: any) {
            toast({ title: "Error", description: e.message || "Something went wrong.", variant: "destructive" })
        } finally { setLoading(false) }
    }

    const handleFinish = async () => {
        setLoading(true)
        await update({ isOnboarded: true })
        router.push("/dashboard")
        router.refresh()
    }

    const dir = (s: number) => (s < step ? -1 : 1)

    return (
        <div className="relative">
            <StepDots step={step} />

            <div className="mx-auto max-w-lg">
                <AnimatePresence mode="wait">

                    {/* ── Step 1: Connect ───────────────────────────────── */}
                    {step === 1 && (
                        <motion.div
                            key="s1"
                            initial={{ opacity: 0, y: reduced ? 0 : 24, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: reduced ? 0 : -16, scale: 0.98 }}
                            transition={{ duration: 0.35, ease: E }}
                            className={cn(cardCls, "overflow-hidden")}
                        >
                            {/* Chart visualisation */}
                            <div className="relative bg-zinc-50 px-6 pt-8 pb-4 border-b border-zinc-100 overflow-hidden">
                                <DataStreamBg />
                                {/* Floating metric badges */}
                                <motion.div
                                    className="absolute top-4 right-5 bg-white rounded-xl px-3 py-1.5 shadow-sm border border-zinc-100 text-[11px] font-semibold text-zinc-700 flex items-center gap-1.5"
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: reduced ? 0 : 0.6, duration: 0.3 }}
                                >
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                    +24% sessions
                                </motion.div>
                                <motion.div
                                    className="absolute top-12 left-4 bg-amber-500 rounded-xl px-2.5 py-1 shadow-sm text-[10px] font-semibold text-white"
                                    initial={{ opacity: 0, x: -8 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: reduced ? 0 : 0.9, duration: 0.3 }}
                                >
                                    Peak today
                                </motion.div>
                                <GraphSVG />
                            </div>

                            <div className="px-7 py-6">
                                <h2 className="text-[22px] font-semibold tracking-tight text-zinc-900 mb-1">Connect Google Analytics</h2>
                                <p className="text-[13px] text-zinc-500 leading-relaxed mb-5">
                                    Read-only access to your GA4 data. We visualise it — nothing is stored.
                                </p>

                                <div className="space-y-2.5 mb-6">
                                    {[
                                        { icon: ShieldCheck, color: "emerald", label: "Privacy first", detail: "Read-only access. Your visitor data stays in Google." },
                                        { icon: Zap, color: "amber", label: "Instant insights", detail: "See traffic, pages, sources and audience in seconds." },
                                    ].map(({ icon: Icon, color, label, detail }) => (
                                        <div key={label} className="flex items-start gap-3 rounded-xl border border-zinc-100 bg-zinc-50/60 px-4 py-3">
                                            <div className={cn("mt-0.5 rounded-lg p-1.5", color === "emerald" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>
                                                <Icon className="h-3.5 w-3.5" strokeWidth={2} />
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-semibold text-zinc-800">{label}</p>
                                                <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">{detail}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Trial badge */}
                                <div className="flex items-center justify-center gap-2 rounded-xl bg-amber-50 border border-amber-100 py-2 px-4 mb-5">
                                    <motion.span
                                        className="h-1.5 w-1.5 rounded-full bg-amber-400"
                                        animate={reduced ? {} : { scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
                                        transition={{ duration: 1.4, repeat: Infinity }}
                                    />
                                    <span className="text-[11px] font-medium text-amber-700">30-day free trial included</span>
                                </div>

                                <motion.button
                                    onClick={handleConnect}
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-[13px] font-semibold shadow-sm transition-colors duration-150 disabled:opacity-60"
                                    whileTap={reduced ? {} : { scale: 0.98 }}
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                    {loading ? "Connecting…" : "Connect Google Account"}
                                    {!loading && <ArrowRight className="h-4 w-4 ml-0.5" />}
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Step 2: Pick property ─────────────────────────── */}
                    {step === 2 && (
                        <motion.div
                            key="s2"
                            initial={{ opacity: 0, y: reduced ? 0 : 24, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: reduced ? 0 : -16, scale: 0.98 }}
                            transition={{ duration: 0.35, ease: E }}
                            className={cn(cardCls, "overflow-hidden")}
                        >
                            {/* Orbit animation header */}
                            <div className="relative bg-zinc-50 border-b border-zinc-100 py-6 overflow-hidden">
                                <DataStreamBg />
                                <OrbitSVG />
                                <p className="text-center text-[11px] text-zinc-400 mt-2">Your connected properties</p>
                            </div>

                            <div className="px-5 py-5">
                                <h2 className="text-[18px] font-semibold tracking-tight text-zinc-900 mb-1">Choose a property</h2>
                                <p className="text-[12px] text-zinc-500 mb-4">Select the GA4 property to start tracking.</p>

                                <div className="max-h-[280px] overflow-y-auto space-y-1.5 relative">
                                    {loading ? (
                                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                                            {/* Animated dot loader */}
                                            <div className="flex gap-1.5">
                                                {[0, 1, 2].map(i => (
                                                    <motion.div
                                                        key={i}
                                                        className="h-2 w-2 rounded-full bg-amber-400"
                                                        animate={reduced ? {} : { y: [0, -6, 0] }}
                                                        transition={{ duration: 0.6, delay: i * 0.12, repeat: Infinity, ease: "easeInOut" }}
                                                    />
                                                ))}
                                            </div>
                                            <p className="text-[11px] text-zinc-400">Fetching properties…</p>
                                        </div>
                                    ) : properties.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                                            <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center mb-1">
                                                <BarChart2 className="h-5 w-5 text-zinc-400" />
                                            </div>
                                            <p className="text-[13px] font-medium text-zinc-700">No GA4 properties found</p>
                                            <p className="text-[11px] text-zinc-400 max-w-[200px]">Make sure you have a GA4 property in your Google account.</p>
                                            <button onClick={fetchProperties} className="mt-2 text-[11px] font-medium text-amber-600 hover:text-amber-500 transition-colors duration-150">
                                                Try again
                                            </button>
                                        </div>
                                    ) : (
                                        // Clip-path reveal on list — no stagger
                                        <motion.div
                                            initial={reduced ? { opacity: 0 } : { clipPath: "inset(0 0 100% 0 round 12px)", opacity: 0 }}
                                            animate={reduced ? { opacity: 1 } : { clipPath: "inset(0 0 0% 0 round 12px)", opacity: 1 }}
                                            transition={{ duration: 0.3, ease: E }}
                                            className="space-y-1.5"
                                        >
                                            {properties.map((prop: any) => {
                                                const rawId = String(prop.id).replace(/^properties\//, "")
                                                return (
                                                    <button
                                                        key={prop.id}
                                                        onClick={() => !loading && handleSelectProperty(prop)}
                                                        disabled={loading}
                                                        className="group w-full flex items-center gap-3 px-3 py-3 rounded-xl border border-zinc-100 hover:border-amber-200 hover:bg-amber-50/40 text-left transition-[border-color,background-color] duration-150 disabled:opacity-50"
                                                    >
                                                        <span className="h-2 w-2 rounded-full bg-amber-400 shrink-0 mt-0.5" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[13px] font-medium text-zinc-900 truncate group-hover:text-amber-700 transition-colors duration-150">{prop.name}</p>
                                                            <p className="text-[10px] font-mono text-zinc-400 tabular-nums mt-0.5">{rawId}</p>
                                                        </div>
                                                        <ChevronRight className="h-4 w-4 text-zinc-300 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-[color,transform] duration-150 shrink-0" />
                                                    </button>
                                                )
                                            })}
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── Step 3: Done ──────────────────────────────────── */}
                    {step === 3 && (
                        <motion.div
                            key="s3"
                            initial={{ opacity: 0, scale: 0.94 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4, ease: E }}
                            className={cn(cardCls, "overflow-hidden")}
                        >
                            <div className="relative py-10 flex flex-col items-center overflow-hidden">
                                <SuccessBurst />

                                {/* Check circle */}
                                <motion.div
                                    className="relative z-10 h-20 w-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-200 mb-5"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.4, delay: 0.1, ease: E }}
                                >
                                    <AnimatedCheck size={36} />
                                    {/* Ring pulse */}
                                    {!reduced && (
                                        <motion.div
                                            className="absolute inset-0 rounded-full border-2 border-emerald-400"
                                            animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                                            transition={{ duration: 1.2, repeat: 2, ease: "easeOut" }}
                                        />
                                    )}
                                </motion.div>

                                <motion.h2
                                    className="text-[22px] font-semibold tracking-tight text-zinc-900 text-center"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.3, ease: E }}
                                >
                                    You're all set
                                </motion.h2>
                                <motion.p
                                    className="mt-2 text-[13px] text-zinc-500 text-center max-w-xs leading-relaxed px-6"
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4, duration: 0.3, ease: E }}
                                >
                                    Your dashboard is ready. Data sync is running in the background.
                                </motion.p>

                                {/* Mini stat preview */}
                                <motion.div
                                    className="mt-6 grid grid-cols-3 gap-3 w-full max-w-xs px-6"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.55, duration: 0.3, ease: E }}
                                >
                                    {[
                                        { label: "Sessions", value: "—" },
                                        { label: "Users", value: "—" },
                                        { label: "Bounce", value: "—" },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="rounded-xl border border-zinc-100 bg-zinc-50 px-3 py-2.5 text-center">
                                            <p className="text-[16px] font-semibold text-zinc-800 tabular-nums">{value}</p>
                                            <p className="text-[10px] text-zinc-400 mt-0.5">{label}</p>
                                        </div>
                                    ))}
                                </motion.div>
                            </div>

                            <div className="px-6 pb-6">
                                <motion.button
                                    onClick={handleFinish}
                                    disabled={loading}
                                    className="group w-full flex items-center justify-center gap-2 h-11 rounded-xl bg-amber-500 hover:bg-amber-400 text-white text-[13px] font-semibold shadow-sm shadow-amber-500/20 transition-colors duration-150 disabled:opacity-60"
                                    whileTap={reduced ? {} : { scale: 0.98 }}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.7 }}
                                >
                                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                                    {loading ? "Opening dashboard…" : "Explore dashboard"}
                                    {!loading && (
                                        <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5" />
                                    )}
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    )
}
