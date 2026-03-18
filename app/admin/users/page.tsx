"use client"

import { useEffect, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

type AdminUserRow = {
    id: string
    email?: string
    name?: string
    image?: string
    role?: "admin" | "user"
    disabled?: boolean
    tier?: string
    status?: string
    createdAt?: string
    lastSeen?: string
    isOnboarded?: boolean
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<AdminUserRow[]>([])
    const [loading, setLoading] = useState(true)
    const [savingUserId, setSavingUserId] = useState<string | null>(null)

    async function fetchUsers() {
        setLoading(true)
        try {
            const res = await fetch("/api/admin/users")
            const data = await res.json()
            setUsers(data.users || [])
        } catch (err) {
            console.error(err)
            toast.error("Failed to load users")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    async function saveUserEdits(userId: string, payload: any) {
        setSavingUserId(userId)
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            const data = await res.json().catch(() => ({}))
            if (!res.ok) {
                throw new Error(data?.error || "Failed to update user")
            }
            toast.success("User updated")
            await fetchUsers()
        } catch (e: any) {
            toast.error(e?.message || "Failed to update user")
        } finally {
            setSavingUserId(null)
        }
    }

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
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Plan</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Created At</th>
                                    <th className="px-6 py-4">Last Seen</th>
                                    <th className="px-6 py-4">Onboarded</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                                {loading ? (
                                    [...Array(5)].map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="px-6 py-4 whitespace-nowrap"><div className="h-10 w-48 bg-zinc-50 rounded" /></td>
                                            <td className="px-6 py-4"><div className="h-6 w-16 bg-zinc-50 rounded" /></td>
                                            <td className="px-6 py-4"><div className="h-6 w-20 bg-zinc-50 rounded" /></td>
                                            <td className="px-6 py-4"><div className="h-6 w-20 bg-zinc-50 rounded" /></td>
                                            <td className="px-6 py-4"><div className="h-6 w-24 bg-zinc-50 rounded" /></td>
                                            <td className="px-6 py-4"><div className="h-6 w-24 bg-zinc-50 rounded" /></td>
                                            <td className="px-6 py-4"><div className="h-6 w-12 bg-zinc-50 rounded" /></td>
                                            <td className="px-6 py-4"><div className="h-9 w-20 bg-zinc-50 rounded" /></td>
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
                                                        user.role === "admin"
                                                            ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                                                            : "bg-zinc-100 text-zinc-600 border-zinc-200",
                                                    )}
                                                >
                                                    {user.role || "user"}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 text-xs text-zinc-600">
                                                {(user.tier || "starter").toString()}
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
                                            <td className="px-6 py-4 text-right">
                                                <EditUserDialog
                                                    user={user}
                                                    saving={savingUserId === user.id}
                                                    onSave={(payload) => saveUserEdits(user.id, payload)}
                                                />
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

function EditUserDialog({
    user,
    saving,
    onSave,
}: {
    user: AdminUserRow
    saving: boolean
    onSave: (payload: any) => Promise<void>
}) {
    const [open, setOpen] = useState(false)
    const [role, setRole] = useState<"admin" | "user">((user.role as any) || "user")
    const [tier, setTier] = useState<string>((user.tier as any) || "starter")
    const [status, setStatus] = useState<string>((user.status as any) || "free")
    const [isOnboarded, setIsOnboarded] = useState<boolean>(!!user.isOnboarded)
    const [disabled, setDisabled] = useState<boolean>(!!user.disabled)
    const [resetTrialStart, setResetTrialStart] = useState(false)

    // Re-sync when opening for a different user row (or after list refresh).
    useEffect(() => {
        setRole((user.role as any) || "user")
        setTier((user.tier as any) || "starter")
        setStatus((user.status as any) || "free")
        setIsOnboarded(!!user.isOnboarded)
        setDisabled(!!user.disabled)
        setResetTrialStart(false)
    }, [user.id, user.role, user.tier, user.status, user.isOnboarded, user.disabled])

    async function handleSave() {
        const payload: any = {
            role,
            isOnboarded,
            disabled,
            subscription: { tier, status },
            ...(resetTrialStart ? { resetTrialStart: true } : {}),
        }
        await onSave(payload)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    Edit
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit user</DialogTitle>
                    <DialogDescription>
                        Update role, onboarding, plan tier/status, or reset trial start.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="text-xs text-zinc-500">
                        <div className="font-medium text-zinc-900">{user.name || "Unnamed user"}</div>
                        <div>{user.email}</div>
                        <div className="mt-1 font-mono">{user.id}</div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <div className="text-xs font-semibold text-zinc-700">Role</div>
                            <Select value={role} onValueChange={(v) => setRole(v as any)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="user">user</SelectItem>
                                    <SelectItem value="admin">admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <div className="text-xs font-semibold text-zinc-700">Tier</div>
                            <Select value={tier} onValueChange={setTier}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select tier" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="starter">starter</SelectItem>
                                    <SelectItem value="pro">pro</SelectItem>
                                    <SelectItem value="agency">agency</SelectItem>
                                    <SelectItem value="custom">custom</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-2">
                            <div className="text-xs font-semibold text-zinc-700">Subscription status</div>
                            <Select value={status} onValueChange={setStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="free">free</SelectItem>
                                    <SelectItem value="trialing">trialing</SelectItem>
                                    <SelectItem value="active">active</SelectItem>
                                    <SelectItem value="past_due">past_due</SelectItem>
                                    <SelectItem value="unpaid">unpaid</SelectItem>
                                    <SelectItem value="canceled">canceled</SelectItem>
                                    <SelectItem value="incomplete">incomplete</SelectItem>
                                    <SelectItem value="incomplete_expired">incomplete_expired</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <div className="text-xs font-semibold text-zinc-700">Onboarding</div>
                            <div className="flex items-center justify-between rounded-md border border-zinc-200 px-3 py-2">
                                <div className="text-xs text-zinc-600">Is onboarded</div>
                                <Switch checked={isOnboarded} onCheckedChange={setIsOnboarded} />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-md border border-zinc-200 px-3 py-2">
                        <div>
                            <div className="text-xs font-semibold text-zinc-700">Disable access</div>
                            <div className="text-xs text-zinc-500">If enabled, the user is redirected to `/disabled` and cannot sign in.</div>
                        </div>
                        <Switch checked={disabled} onCheckedChange={setDisabled} />
                    </div>

                    <div className="flex items-center justify-between rounded-md border border-zinc-200 px-3 py-2">
                        <div>
                            <div className="text-xs font-semibold text-zinc-700">Reset trial start</div>
                            <div className="text-xs text-zinc-500">Sets `createdAt` to now (affects trial enforcement).</div>
                        </div>
                        <Switch checked={resetTrialStart} onCheckedChange={setResetTrialStart} />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
