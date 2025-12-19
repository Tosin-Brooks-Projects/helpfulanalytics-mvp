"use client"

import { Activity } from "lucide-react"
import { AddPropertyModal } from "@/components/dashboard/add-property-modal"

interface NoPropertyPlaceholderProps {
    title?: string
    description?: string
}

export function NoPropertyPlaceholder({
    title = "No Property Selected",
    description = "Connect a Google Analytics 4 property to start seeing insights."
}: NoPropertyPlaceholderProps) {
    return (
        <div className="flex h-[60vh] flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 bg-white/50 text-center p-8 transition-all hover:bg-white hover:border-zinc-300">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 mb-6 shadow-sm border border-amber-500/10">
                <Activity className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">{title}</h3>
            <p className="text-sm text-zinc-500 max-w-sm mb-8 leading-relaxed">
                {description}
            </p>
            <AddPropertyModal />
        </div>
    )
}
