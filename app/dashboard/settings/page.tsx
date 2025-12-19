"use client"

import { useEffect, useState } from "react"
import { LinearShell } from "@/components/linear/linear-shell"
import { LinearGraphCard, BillingSettings } from "@/components/linear"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useDashboard } from "@/components/linear/dashboard-context"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export default function SettingsPage() {
    const { properties, selectedProperty, loading: initialLoading } = useDashboard()
    const { toast } = useToast()

    // Find absolute active property object (safe if properties update)
    const activeProp = properties.find(p => p.id === selectedProperty)

    const [name, setName] = useState("")
    const [timezone, setTimezone] = useState("")
    const [saving, setSaving] = useState(false)
    const [deleting, setDeleting] = useState(false)

    // Sync state with active property
    useEffect(() => {
        if (activeProp) {
            setName(activeProp.name || "")
            setTimezone(activeProp.timezone || activeProp.timeZone || "") // Handle inconsistencies
        }
    }, [activeProp])

    const handleSave = async () => {
        if (!selectedProperty) return
        setSaving(true)
        try {
            const res = await fetch("/api/user/properties", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    propertyId: selectedProperty,
                    name,
                    timezone
                })
            })

            if (!res.ok) throw new Error("Failed to update settings")

            toast({
                title: "Settings saved",
                description: "Your property settings have been updated.",
            })
            // Ideally trigger a context refresh here, simpler is to reload or let SWR handle it if we used it.
            // For now, simple alert.
            window.location.reload() // Quick refresh to update context
        } catch (error) {
            toast({
                title: "Error",
                description: "Could not save settings. Please try again.",
                variant: "destructive"
            })
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async () => {
        if (!selectedProperty || !confirm("Are you sure you want to delete this property configuration? This won't delete data from Google Analytics.")) return

        setDeleting(true)
        try {
            const res = await fetch(`/api/user/properties?propertyId=${selectedProperty}`, {
                method: "DELETE",
            })

            if (!res.ok) throw new Error("Failed to delete property")

            toast({
                title: "Property deleted",
                description: "The property has been removed from your dashboard.",
            })
            window.location.href = "/dashboard"
        } catch (error) {
            toast({
                title: "Error",
                description: "Could not delete property.",
                variant: "destructive"
            })
        } finally {
            setDeleting(false)
        }
    }

    if (initialLoading) return <div className="p-8 text-zinc-500">Loading settings...</div>

    return (
        <LinearShell>
            <div className="flex flex-col gap-8 max-w-5xl">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Settings</h1>
                    <p className="text-sm text-zinc-500">Manage your dashboard preferences.</p>
                </div>

                <LinearGraphCard title="Billing & Subscription">
                    <BillingSettings />
                </LinearGraphCard>

                {activeProp ? (
                    <>
                        <LinearGraphCard title="General Settings">
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="prop-name" className="text-zinc-600 font-medium">Property Name</Label>
                                    <Input
                                        id="prop-name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-amber-500/50"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="timezone" className="text-zinc-600 font-medium">Timezone (Display only)</Label>
                                    <Input
                                        id="timezone"
                                        value={timezone}
                                        onChange={(e) => setTimezone(e.target.value)}
                                        placeholder="e.g. America/New_York"
                                        className="bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-amber-500/50"
                                    />
                                    <p className="text-[10px] text-zinc-400">Changing this overrides the dashboard display timezone.</p>
                                </div>
                                <div className="pt-2">
                                    <Button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="bg-amber-600 hover:bg-amber-500 text-white min-w-[100px] shadow-sm"
                                    >
                                        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                                    </Button>
                                </div>
                            </div>
                        </LinearGraphCard>

                        <LinearGraphCard title="Danger Zone" className="border-rose-100 bg-rose-50/30">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-semibold text-rose-600">Remove Property</h4>
                                    <p className="text-xs text-zinc-500 mt-1">Remove this property from your dashboard view.</p>
                                </div>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleDelete}
                                    disabled={deleting}
                                    className="bg-rose-600 hover:bg-rose-500 shadow-sm"
                                >
                                    {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : "Remove"}
                                </Button>
                            </div>
                        </LinearGraphCard>
                    </>
                ) : (
                    <div className="rounded-xl border border-dashed border-zinc-200 bg-white p-8 text-center text-zinc-500 shadow-sm">
                        No property selected. Go to specific settings to configure.
                    </div>
                )}
            </div>
        </LinearShell>
    )
}
