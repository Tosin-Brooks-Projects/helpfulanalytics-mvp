"use client"

import { useEffect, useState } from "react"
import { LinearShell } from "@/components/linear/linear-shell"
import { LinearGraphCard } from "@/components/linear"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User } from "lucide-react"

interface UserProfile {
    id: string
    name: string
    email: string
    image: string
    lastSeen?: any
    [key: string]: any
}

export default function ProfilePage() {
    const [user, setUser] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch("/api/user/profile")
                if (res.ok) {
                    const data = await res.json()
                    console.log("DEBUG: Profile Page - Received Data:", data)
                    setUser(data)
                } else {
                    console.error("DEBUG: Profile Page - Fetch Failed:", res.status, res.statusText)
                }
            } catch (error) {
                console.error("Failed to fetch profile", error)
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [])

    if (loading) {
        return (
            <LinearShell>
                <div className="flex items-center justify-center h-96 text-zinc-500">
                    Loading profile...
                </div>
            </LinearShell>
        )
    }

    return (
        <LinearShell>
            <div className="flex flex-col gap-8 max-w-2xl">
                <div>
                    <h1 className="text-2xl font-medium tracking-tight text-zinc-100">User Profile</h1>
                    <p className="text-sm text-zinc-400">Manage your account information.</p>
                </div>

                <div className="flex items-center gap-6 p-6 rounded-lg border border-white/5 bg-white/[0.02]">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center ring-4 ring-[#09090b] overflow-hidden">
                        {user?.image ? (
                            <img src={user.image} alt={user.name || "User"} className="h-full w-full object-cover" />
                        ) : (
                            <User className="h-10 w-10 text-white" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-medium text-zinc-100">{user?.name || "User"}</h2>
                        <p className="text-zinc-500">{user?.email || "No email"}</p>
                        <div className="mt-2 flex gap-2">
                            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs border border-indigo-500/20">Pro Plan</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">Active</span>
                        </div>
                    </div>
                </div>

                <LinearGraphCard title="Personal Information">
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-zinc-300">Full Name</Label>
                                <Input id="name" defaultValue={user?.name || ""} className="bg-white/5 border-white/10 text-zinc-200" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-zinc-300">Email Address</Label>
                                <Input id="email" defaultValue={user?.email || ""} disabled className="bg-white/5 border-white/10 text-zinc-500 cursor-not-allowed" />
                            </div>
                        </div>
                        <div className="pt-2">
                            <Button className="bg-zinc-100 text-zinc-900 hover:bg-zinc-200">Update Profile</Button>
                        </div>
                    </div>
                </LinearGraphCard>
            </div>
        </LinearShell>
    )
}
