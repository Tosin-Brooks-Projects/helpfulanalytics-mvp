"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Check, ChevronRight, Loader2, Sparkles, BarChart2, ShieldCheck, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"

export function OnboardingWizard() {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [properties, setProperties] = useState([])
    const router = useRouter()
    const { toast } = useToast()
    const { update } = useSession()

    const fetchProperties = async () => {
        try {
            const res = await fetch("/api/analytics/properties")
            if (res.ok) {
                const data = await res.json()
                setProperties(data.properties || [])
            } else {
                throw new Error("Failed to fetch properties from Google.")
            }
        } catch (error) {
            console.error("Failed to fetch properties", error)
            toast({
                title: "Error fetching properties",
                description: "Could not retrieve GA4 properties. Please try again.",
                variant: "destructive"
            })
        }
    }

    const handleConnect = async () => {
        setLoading(true)
        // Sign in flow should have happened already or we trigger it. 
        // Assuming user is signed in but just needs to "connect" (fetch properties).
        await fetchProperties()
        setLoading(false)
        setStep(2)
    }

    const handleSelectProperty = async (property: any) => {
        setLoading(true)
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

            if (!res.ok) {
                throw new Error(data.error || "Failed to save property")
            }

            setStep(3)
        } catch (error: any) {
            console.error(error)
            toast({
                title: "Error saving property",
                description: error.message || "Something went wrong. Please try again.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const handleFinish = async () => {
        setLoading(true)
        // Force session update so strict middleware lets us through to dashboard
        await update({ isOnboarded: true })
        router.push("/dashboard")
        router.refresh()
    }

    return (
        <div className="relative">
            {/* Steps Indicator */}
            <div className="mb-8 flex justify-center gap-4">
                {[1, 2, 3].map((i) => (
                    <motion.div
                        key={i}
                        animate={{
                            backgroundColor: step >= i ? "#6366f1" : "rgba(255,255,255,0.05)",
                            color: step >= i ? "#ffffff" : "rgba(255,255,255,0.4)",
                            borderColor: step >= i ? "#6366f1" : "rgba(255,255,255,0.1)"
                        }}
                        className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-medium transition-colors`}
                    >
                        {step > i ? <Check className="h-4 w-4" /> : i}
                    </motion.div>
                ))}
            </div>

            <div className="mx-auto max-w-xl">
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 shadow-inner">
                                    <Sparkles className="h-8 w-8" />
                                </div>

                                <h2 className="text-2xl font-medium text-white">Connect Google Analytics</h2>
                                <p className="mt-2 text-zinc-400">
                                    We need read-only access to visualize your data.
                                </p>

                                <div className="mt-8 grid w-full gap-4 text-left">
                                    <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-4">
                                        <div className="mt-0.5 rounded-full bg-emerald-500/10 p-1 text-emerald-400">
                                            <ShieldCheck className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-zinc-200">Privacy First</h3>
                                            <p className="text-xs text-zinc-500 mt-0.5">We never store your personal user data. Read-only access.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-4">
                                        <div className="mt-0.5 rounded-full bg-blue-500/10 p-1 text-blue-400">
                                            <BarChart2 className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-medium text-zinc-200">Actionable Insights</h3>
                                            <p className="text-xs text-zinc-500 mt-0.5">Instantly get reports on your traffic and performance.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 w-full">
                                    <div className="mb-4 flex items-center justify-center gap-2 rounded-full border border-indigo-500/20 bg-indigo-500/10 py-1.5 px-3">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                                        </span>
                                        <span className="text-[10px] font-medium text-indigo-300 uppercase tracking-wide">Includes 30-Day Free Trial</span>
                                    </div>
                                    <Button
                                        onClick={handleConnect}
                                        disabled={loading}
                                        className="w-full bg-white text-black hover:bg-zinc-200 h-10 font-medium"
                                    >
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Connect Account
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl h-[500px] flex flex-col"
                        >
                            <div className="mb-4">
                                <h2 className="text-xl font-medium text-white">Select Property</h2>
                                <p className="text-sm text-zinc-400">Choose the GA4 property to track.</p>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                                {properties.length === 0 && !loading ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <p className="text-zinc-500 mb-4">No GA4 properties found.</p>
                                        <Button variant="outline" onClick={fetchProperties} className="border-white/10 text-zinc-300 hover:bg-white/5">Retry</Button>
                                    </div>
                                ) : (
                                    properties.map((prop: any) => (
                                        <motion.div
                                            key={prop.id}
                                            whileHover={{ scale: 1.01, backgroundColor: "rgba(255,255,255,0.08)" }}
                                            whileTap={{ scale: 0.99 }}
                                            className="group flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3 cursor-pointer transition-all"
                                            onClick={() => handleSelectProperty(prop)}
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className="h-8 w-8 rounded-lg bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold text-sm shrink-0">
                                                    {prop.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-medium truncate text-zinc-200 group-hover:text-white transition-colors">{prop.name}</div>
                                                    <div className="text-[10px] text-zinc-500">ID: {prop.id.split('/')[1]}</div>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-zinc-300 transition-colors" />
                                        </motion.div>
                                    ))
                                )}
                                {loading && (
                                    <div className="flex flex-col items-center justify-center h-full gap-2">
                                        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
                                        <p className="text-xs text-zinc-500">Loading properties...</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl text-center"
                        >
                            <div className="flex flex-col items-center">
                                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40">
                                    <Check className="h-10 w-10" />
                                </div>
                                <h2 className="text-2xl font-medium text-white">You&apos;re All Set!</h2>
                                <p className="mt-2 text-zinc-400 max-w-xs mx-auto">
                                    Your dashboard is ready. We&apos;ve started syncing your data in the background.
                                </p>
                                <div className="mt-8">
                                    <Button onClick={handleFinish} disabled={loading} className="w-full bg-white text-black hover:bg-zinc-200 h-10 group">
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Go to Dashboard
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

