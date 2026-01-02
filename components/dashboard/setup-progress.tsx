"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Circle, X, ArrowRight, ListChecks } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useDashboard } from "@/components/linear/dashboard-context"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

export function SetupProgress() {
    const { selectedProperty, subscription } = useDashboard()
    const [isOpen, setIsOpen] = useState(true)
    const [viewedReports, setViewedReports] = useState(false)

    useEffect(() => {
        // Initialize state from local storage
        if (typeof window !== 'undefined') {
            const hasViewedReports = localStorage.getItem('hasViewedReports')
            if (hasViewedReports) {
                setViewedReports(true)
            }

            const storedIsOpen = localStorage.getItem('setupGuideOpen')
            if (storedIsOpen !== null) {
                setIsOpen(storedIsOpen === 'true')
            }
        }
    }, [])

    useEffect(() => {
        // Auto-minimize if everything is done (only if explicitly checked, or maybe we don't want to auto-open if they closed it)
        // If they completed everything, let's close it but respecting manual override is tricky. 
        // Let's just say if everything is done, we close it, but only if we haven't forced a state yet? 
        // Or simpler: Just respect the manual toggle primarily.

        // Original logic: auto-minimize if complete.
        if (selectedProperty && subscription?.status === 'active' && viewedReports) {
            setIsOpen(false)
            if (typeof window !== 'undefined') {
                localStorage.setItem('setupGuideOpen', 'false')
            }
        }
    }, [selectedProperty, subscription, viewedReports])

    const toggleOpen = (open: boolean) => {
        setIsOpen(open)
        if (typeof window !== 'undefined') {
            localStorage.setItem('setupGuideOpen', String(open))
        }
    }

    const handleViewReports = () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('hasViewedReports', 'true')
            setViewedReports(true)
        }
    }

    const steps = [
        {
            id: 1,
            label: "Create account",
            isCompleted: true,
            action: null
        },
        {
            id: 2,
            label: "Connect property",
            isCompleted: !!selectedProperty,
            action: !selectedProperty ? (
                <span className="text-amber-600 text-[10px] font-medium block mt-1">Select property in header ↗</span>
            ) : null
        },
        {
            id: 3,
            label: "View reports",
            isCompleted: viewedReports,
            action: !viewedReports ? (
                <Link href="/dashboard/reports" onClick={handleViewReports} className="block mt-1">
                    <span className="text-amber-600 text-[10px] font-medium hover:underline flex items-center">
                        Go to Reports <ArrowRight className="ml-0.5 h-2.5 w-2.5" />
                    </span>
                </Link>
            ) : null
        },
        {
            id: 4,
            label: "Upgrade to Pro",
            isCompleted: subscription?.status === 'active' || subscription?.status === 'trialing', // Consider trialing as done for setup? Maybe. Let's strictly say Active for "Pro". Or usually Trialing is good enough. Let's say active or trialing is "On Plan".
            action: !(subscription?.status === 'active' || subscription?.status === 'trialing') ? (
                <Link href="/dashboard/settings" className="block mt-1">
                    <span className="text-amber-600 text-[10px] font-medium hover:underline flex items-center">
                        Upgrade Plan <ArrowRight className="ml-0.5 h-2.5 w-2.5" />
                    </span>
                </Link>
            ) : null
        }
    ]

    const completedCount = steps.filter(s => s.isCompleted).length
    const progress = (completedCount / steps.length) * 100
    const isAllComplete = completedCount === steps.length

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            <div className="pointer-events-auto">
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="expanded"
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className="w-[300px] bg-white border border-zinc-200 rounded-lg shadow-xl overflow-hidden"
                        >
                            {/* Header */}
                            <div className="bg-zinc-50/80 p-3 flex items-center justify-between border-b border-zinc-100 backdrop-blur-sm">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-100 text-[10px] font-bold text-amber-600">
                                        {Math.round(progress)}%
                                    </div>
                                    <h3 className="text-xs font-semibold text-zinc-900">Setup Guide</h3>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-zinc-400 hover:text-zinc-600"
                                    onClick={() => toggleOpen(false)}
                                >
                                    <X className="h-3.5 w-3.5" />
                                </Button>
                            </div>

                            {/* Content */}
                            <div className="p-3">
                                <div className="mb-3">
                                    <Progress value={progress} className="h-1.5 bg-zinc-100" indicatorClassName="bg-amber-500" />
                                </div>
                                <div className="space-y-2">
                                    {steps.map((step) => (
                                        <div key={step.id} className={cn("flex items-start gap-2.5 p-1.5 rounded transition-colors", step.isCompleted ? "opacity-50" : "bg-amber-50/30")}>
                                            <div className="mt-0.5 shrink-0">
                                                {step.isCompleted ? (
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                                ) : (
                                                    <Circle className="h-4 w-4 text-zinc-300" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={cn("text-xs font-medium leading-none", step.isCompleted ? "text-zinc-500 line-through" : "text-zinc-900")}>
                                                    {step.label}
                                                </p>
                                                {step.action && !step.isCompleted && step.action}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.button
                            key="collapsed"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => toggleOpen(true)}
                            className="flex h-12 w-12 items-center justify-center rounded-full bg-white border border-zinc-200 shadow-lg text-zinc-600 hover:text-amber-600 transition-colors relative"
                        >
                            {/* Circular Progress Indicator border could go here, but simple icon is cleaner for now */}
                            <ListChecks className="h-6 w-6" />
                            {!isAllComplete && (
                                <span className="absolute top-0 right-0 flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border-2 border-white"></span>
                                </span>
                            )}
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
