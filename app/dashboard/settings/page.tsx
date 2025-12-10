"use client"

import { LinearShell } from "@/components/linear/linear-shell"
import { LinearGraphCard } from "@/components/linear"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SettingsPage() {
    return (
        <LinearShell>
            <div className="flex flex-col gap-8 max-w-2xl">
                <div>
                    <h1 className="text-2xl font-medium tracking-tight text-zinc-100">Settings</h1>
                    <p className="text-sm text-zinc-400">Manage your dashboard preferences.</p>
                </div>

                <LinearGraphCard title="General Settings">
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="prop-name" className="text-zinc-300">Property Name</Label>
                            <Input id="prop-name" defaultValue="My SaaS Project" className="bg-white/5 border-white/10 text-zinc-200 focus:border-indigo-500/50" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="timezone" className="text-zinc-300">Timezone</Label>
                            <Input id="timezone" defaultValue="UTC-5 (Eastern Time)" className="bg-white/5 border-white/10 text-zinc-200 focus:border-indigo-500/50" />
                        </div>
                        <div className="pt-2">
                            <Button className="bg-indigo-600 hover:bg-indigo-500 text-white">Save Changes</Button>
                        </div>
                    </div>
                </LinearGraphCard>

                <LinearGraphCard title="Danger Zone" className="border-rose-500/20 bg-rose-500/[0.02]">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-rose-400">Delete Property</h4>
                            <p className="text-xs text-zinc-500 mt-1">This action cannot be undone.</p>
                        </div>
                        <Button variant="destructive" size="sm">Delete</Button>
                    </div>
                </LinearGraphCard>
            </div>
        </LinearShell>
    )
}
