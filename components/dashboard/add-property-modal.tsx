"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, ChevronRight, Plus } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { useDashboard } from "@/components/linear/dashboard-context"

export function AddPropertyModal({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false) // local loading for saving
    const { availableProperties, loading: contextLoading } = useDashboard()
    const { toast } = useToast()
    const router = useRouter()

    const handleSelect = async (property: any) => {
        setSubmitting(true)
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

            toast({
                title: "Property added",
                description: `${property.name} has been added to your dashboard.`,
            })
            setOpen(false)
            // Trigger a reload to refresh context data (since we don't have a re-fetch method exposed yet)
            // Ideally we'd expose a refresh function from context
            window.location.reload()

        } catch (error: any) {
            console.error(error)
            toast({
                title: "Error adding property",
                description: error.message || "Something went wrong.",
                variant: "destructive"
            })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white border-zinc-200 text-zinc-900 shadow-lg">
                <DialogHeader>
                    <DialogTitle className="font-bold">Add Property</DialogTitle>
                    <DialogDescription className="text-zinc-500">
                        Select a Google Analytics 4 property to add to your dashboard.
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-2 mt-4">
                    {contextLoading ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-2">
                            <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
                            <p className="text-xs text-zinc-500">Loading properties...</p>
                        </div>
                    ) : availableProperties.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-center">
                            <p className="text-zinc-500 mb-4 text-sm">No new properties found.</p>
                            <p className="text-xs text-zinc-400">All available GA4 properties have been added.</p>
                        </div>
                    ) : (
                        availableProperties.map((prop: any) => (
                            <div
                                key={prop.id}
                                onClick={() => !submitting && handleSelect(prop)}
                                className={`group flex items-center justify-between rounded-md border border-zinc-100 bg-zinc-50 p-3 cursor-pointer transition-colors hover:bg-zinc-100 ${submitting ? 'opacity-50 pointer-events-none' : ''} shadow-sm`}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="h-8 w-8 rounded bg-amber-500 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                                        {prop.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="font-bold truncate text-sm text-zinc-900 group-hover:text-amber-600 transition-colors uppercase tracking-tight">{prop.name}</div>
                                        <div className="text-[10px] text-zinc-400 font-mono">ID: {prop.id.split('/')[1]}</div>
                                    </div>
                                </div>
                                {submitting ? <Loader2 className="h-4 w-4 animate-spin text-zinc-400" /> : <ChevronRight className="h-4 w-4 text-zinc-300 group-hover:text-amber-500 transition-all group-hover:translate-x-0.5" />}
                            </div>
                        ))
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
