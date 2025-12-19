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
            <div className="mb-10 flex justify-center gap-4">
                {[1, 2, 3].map((i) => (
                    <motion.div
                        key={i}
                        animate={{
                            backgroundColor: step >= i ? "#f59e0b" : "#f4f4f5",
                            color: step >= i ? "#ffffff" : "#a1a1aa",
                            borderColor: step >= i ? "#f59e0b" : "#e4e4e7"
                        }}
                        className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold shadow-sm transition-colors`}
                    >
                        {step > i ? <Check className="h-5 w-5 stroke-[3px]" /> : i}
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
                            className="bg-white border border-zinc-200 rounded-3xl p-10 shadow-xl"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 shadow-inner">
                                    <Sparkles className="h-8 w-8" />
                                </div>

                                <h2 className="text-3xl font-bold tracking-tight text-zinc-900">Connect Google Analytics</h2>
                                <p className="mt-2 text-zinc-500">
                                    We need read-only access to visualize your data insights.
                                </p>

                                <div className="mt-8 grid w-full gap-4 text-left">
                                    <div className="flex items-start gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/50 p-5 transition-colors hover:bg-zinc-50">
                                        <div className="mt-0.5 rounded-full bg-emerald-500/10 p-1.5 text-emerald-600">
                                            <ShieldCheck className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-zinc-900">Privacy First</h3>
                                            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">We never store your personal user data. Read-only access ensures complete security.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 rounded-2xl border border-zinc-100 bg-zinc-50/50 p-5 transition-colors hover:bg-zinc-50">
                                        <div className="mt-0.5 rounded-full bg-blue-500/10 p-1.5 text-blue-600">
                                            <BarChart2 className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-zinc-900">Actionable Insights</h3>
                                            <p className="text-xs text-zinc-500 mt-1 leading-relaxed">Instantly generate high-level reports on your traffic and performance trends.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 w-full">
                                    <div className="mb-6 flex items-center justify-center gap-2 rounded-full border border-amber-200 bg-amber-50 py-2 px-4">
                                        <span className="relative flex h-2 w-2">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                                        </span>
                                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest">Includes 30-Day Free Trial</span>
                                    </div>
                                    <Button
                                        onClick={handleConnect}
                                        disabled={loading}
                                        className="w-full bg-zinc-900 text-white hover:bg-zinc-800 h-12 rounded-2xl font-bold shadow-lg shadow-zinc-200 transition-all active:scale-[0.98]"
                                    >
                                        {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                        Connect Google Account
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
                            className="bg-white border border-zinc-200 rounded-3xl p-8 shadow-xl h-[550px] flex flex-col"
                        >
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold tracking-tight text-zinc-900">Select Property</h2>
                                <p className="text-sm text-zinc-500">Choose the GA4 property you want to track.</p>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                                {properties.length === 0 && !loading ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                                        <div className="mb-4 rounded-full bg-zinc-100 p-4">
                                            <BarChart2 className="h-8 w-8 text-zinc-400" />
                                        </div>
                                        <p className="text-zinc-500 mb-6 font-medium">No GA4 properties found on this account.</p>
                                        <Button variant="outline" onClick={fetchProperties} className="border-zinc-200 text-zinc-600 hover:bg-zinc-50 rounded-xl px-8 font-bold">Try Again</Button>
                                    </div>
                                ) : (
                                    properties.map((prop: any) => (
                                        <motion.div
                                            key={prop.id}
                                            whileHover={{ scale: 1.01, backgroundColor: "#f9fafb", borderColor: "#e4e4e7" }}
                                            whileTap={{ scale: 0.99 }}
                                            className="group flex items-center justify-between rounded-2xl border border-zinc-100 bg-white p-4 cursor-pointer transition-all shadow-sm"
                                            onClick={() => handleSelectProperty(prop)}
                                        >
                                            <div className="flex items-center gap-4 overflow-hidden">
                                                <div className="h-10 w-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm transition-transform group-hover:rotate-3">
                                                    {prop.name.charAt(0)}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-bold truncate text-zinc-900 group-hover:text-amber-600 transition-colors uppercase tracking-tight">{prop.name}</div>
                                                    <div className="text-[10px] text-zinc-400 font-mono tracking-wider">ID: {prop.id.split('/')[1]}</div>
                                                </div>
                                            </div>
                                            <ChevronRight className="h-5 w-5 text-zinc-300 group-hover:text-amber-500 transition-all group-hover:translate-x-1" />
                                        </motion.div>
                                    ))
                                )}
                                {loading && (
                                    <div className="flex flex-col items-center justify-center h-full gap-4">
                                        <div className="relative">
                                            <div className="h-12 w-12 rounded-full border-4 border-zinc-100 animate-pulse"></div>
                                            <Loader2 className="h-12 w-12 animate-spin text-amber-500 absolute inset-0" />
                                        </div>
                                        <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest animate-pulse">Fetching Properties</p>
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
                            className="bg-white border border-zinc-200 rounded-3xl p-10 shadow-xl text-center"
                        >
                            <div className="flex flex-col items-center">
                                <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-100 ring-4 ring-emerald-50">
                                    <Check className="h-12 w-12 stroke-[3px]" />
                                </div>
                                <h2 className="text-3xl font-bold tracking-tight text-zinc-900">You&apos;re All Set!</h2>
                                <p className="mt-3 text-zinc-500 max-w-xs mx-auto leading-relaxed">
                                    Your dashboard is ready to go. We&apos;ve started syncing your data analytics in the background.
                                </p>
                                <div className="mt-10 w-full">
                                    <Button
                                        onClick={handleFinish}
                                        disabled={loading}
                                        className="w-full bg-amber-600 hover:bg-amber-500 text-white h-12 rounded-2xl font-bold shadow-lg shadow-amber-100 group transition-all active:scale-[0.98]"
                                    >
                                        {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                        Explore Dashboard
                                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
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

