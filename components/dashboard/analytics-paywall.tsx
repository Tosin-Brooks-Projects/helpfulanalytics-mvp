"use client"

import { Lock } from "lucide-react"
import Link from "next/link"

export function AnalyticsPaywall() {
    return (
        <div className="flex h-[60vh] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white/50 text-center p-8">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 mb-6 shadow-sm border border-amber-500/10">
                <Lock className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">Your trial has ended</h3>
            <p className="text-sm text-zinc-500 max-w-sm mb-8 leading-relaxed">
                Your properties are still connected, but their data is locked until you subscribe — $12 per property, per month.
            </p>
            <Link
                href="/dashboard/settings"
                className="inline-flex items-center justify-center rounded-md bg-amber-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-600 transition-colors"
            >
                Subscribe to unlock
            </Link>
        </div>
    )
}
