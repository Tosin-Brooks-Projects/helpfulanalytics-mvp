"use client"

import { useEffect, useState } from "react"
import { LinearShell } from "@/components/linear/linear-shell"
import { LinearGraphCard } from "@/components/linear/linear-graph-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User } from "lucide-react"
import { useDashboard } from "@/components/linear/dashboard-context"
import { useSession } from "next-auth/react"

interface UserProfile {
    id: string
    name: string
    email: string
    image: string
    lastSeen?: any
    [key: string]: any
}

export default function ProfilePage() {
    const { subscription } = useDashboard()
    const { data: session } = useSession()
    const [user, setUser] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch("/api/user/profile")
                if (res.ok) {
                    const data = await res.json()
                    setUser(data)
                } else {
                    console.error("Failed to fetch profile:", res.status, res.statusText)
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
                <div className="flex items-center justify-center h-96 text-zinc-500 font-medium">
                    Loading profile...
                </div>
            </LinearShell>
        )
    }

    const currentPlan = subscription?.tier || "Starter"
    const displayEmail = user?.email || session?.user?.email || "No email"

    return (
        <LinearShell>
            <div className="flex flex-col gap-8 max-w-2xl px-4 sm:px-0">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">User Profile</h1>
                    <p className="text-sm text-zinc-500">Manage your account information.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 p-4 sm:p-6 rounded-xl border border-zinc-200 bg-white shadow-sm">
                    <div className="h-20 w-20 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center ring-4 ring-white shadow-md overflow-hidden shrink-0">
                        {user?.image ? (
                            <img src={user.image} alt={user.name || "User"} className="h-full w-full object-cover" />
                        ) : (
                            <User className="h-10 w-10 text-white" />
                        )}
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900">{user?.name || "User"}</h2>
                        <p className="text-sm text-zinc-500 font-medium">{displayEmail}</p>
                        <div className="mt-3 flex gap-2">
                            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold uppercase tracking-wider border border-amber-100">
                                {currentPlan} Plan
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-100">Active</span>
                        </div>
                    </div>
                </div>

                <LinearGraphCard title="Personal Information">
                    <div className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Full Name</Label>
                                <Input id="name" defaultValue={user?.name || ""} className="bg-zinc-50 border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:ring-amber-500/20 focus:border-amber-500 h-10" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Email Address</Label>
                                <Input id="email" defaultValue={displayEmail} disabled className="bg-zinc-100 border-zinc-200 text-zinc-500 cursor-not-allowed h-10 opacity-70" />
                            </div>
                        </div>
                        <div className="pt-2">
                            <Button className="bg-zinc-900 text-white hover:bg-zinc-800 transition-colors h-10 px-6 font-medium shadow-sm">Save Changes</Button>
                        </div>
                    </div>
                </LinearGraphCard>
            </div>
        </LinearShell>
    )
}
