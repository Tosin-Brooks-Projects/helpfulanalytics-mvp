"use client"

import { useEffect, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"

export default function AdminUsersPage() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchUsers() {
            try {
                const res = await fetch("/api/admin/users")
                const data = await res.json()
                setUsers(data.users || [])
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchUsers()
    }, [])

    return (
        <AdminShell>
            <div className="space-y-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-zinc-900 font-outfit">Users</h2>
                    <p className="text-zinc-500 mt-1">Manage users and track subscription status.</p>
                </div>

                <Card className="overflow-hidden border-zinc-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-100">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Created At</th>
                                    <th className="px-6 py-4">Last Seen</th>
                                    <th className="px-6 py-4">Onboarded</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="h-10 w-48 bg-zinc-50 rounded" /></td>
                                            <td className="px-6 py-4"><div className="h-6 w-20 bg-zinc-50 rounded" /></td>
                                            <td className="px-6 py-4"><div className="h-6 w-24 bg-zinc-50 rounded" /></td>
                                            <td className="px-6 py-4"><div className="h-6 w-24 bg-zinc-50 rounded" /></td>
                                            <td className="px-6 py-4"><div className="h-6 w-12 bg-zinc-50 rounded" /></td>
                                        </tr>
                                    ))
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="hover:bg-zinc-50 transition-colors group">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="h-9 w-9 border border-zinc-200 shadow-sm">
                                                        <AvatarImage src={user.image} />
                                                        <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-zinc-900 group-hover:text-amber-600 transition-colors">{user.name}</span>
                                                        <span className="text-xs text-zinc-500">{user.email}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge 
                                                    variant="secondary" 
                                                    className={cn(
                                                        "font-medium uppercase tracking-widest text-[10px]",
                                                        user.status === 'active' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                                                        user.status === 'trialing' ? "bg-amber-50 text-amber-700 border-amber-100" :
                                                        "bg-zinc-100 text-zinc-600 border-zinc-200"
                                                    )}
                                                >
                                                    {user.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-zinc-500">
                                                {user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "N/A"}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-zinc-500">
                                                {user.lastSeen ? format(new Date(user.lastSeen), "MMM d, yyyy") : "N/A"}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={cn(
                                                    "h-2 w-2 rounded-full mx-auto",
                                                    user.isOnboarded ? "bg-emerald-500" : "bg-zinc-300"
                                                )} />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </AdminShell>
    )
}
