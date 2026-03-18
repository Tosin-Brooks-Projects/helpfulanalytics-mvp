"use client"

import { useEffect, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Card } from "@/components/ui/card"
import { toast } from "sonner"
import { format } from "date-fns"

type AuditEvent = {
  id: string
  actorEmail?: string
  actorId?: string
  action: string
  targetType?: string
  targetId?: string
  meta?: any
  createdAt?: string
}

export default function AdminActivityPage() {
  const [events, setEvents] = useState<AuditEvent[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/audit")
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to load audit log")
      setEvents(data.events || [])
    } catch (e: any) {
      toast.error(e?.message || "Failed to load audit log")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  return (
    <AdminShell>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 font-outfit">Activity</h2>
          <p className="text-zinc-500 mt-1">Recent admin actions (settings, users, emails).</p>
        </div>

        <Card className="overflow-hidden border-zinc-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-zinc-50 text-xs font-semibold uppercase tracking-wider text-zinc-500 border-b border-zinc-100">
                <tr>
                  <th className="px-6 py-4">When</th>
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Target</th>
                  <th className="px-6 py-4">Meta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-sm">
                {loading ? (
                  [...Array(8)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 w-28 bg-zinc-50 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-44 bg-zinc-50 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-40 bg-zinc-50 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-40 bg-zinc-50 rounded" /></td>
                      <td className="px-6 py-4"><div className="h-4 w-56 bg-zinc-50 rounded" /></td>
                    </tr>
                  ))
                ) : events.length === 0 ? (
                  <tr>
                    <td className="px-6 py-10 text-zinc-500" colSpan={5}>
                      No audit events yet.
                    </td>
                  </tr>
                ) : (
                  events.map((e) => (
                    <tr key={e.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="px-6 py-4 text-xs text-zinc-500">
                        {e.createdAt ? format(new Date(e.createdAt), "MMM d, yyyy HH:mm") : "—"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs text-zinc-900">{e.actorEmail || "—"}</div>
                        <div className="text-[11px] text-zinc-500 font-mono">{e.actorId || ""}</div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-zinc-800">{e.action}</td>
                      <td className="px-6 py-4 text-xs text-zinc-700">
                        {(e.targetType || "—") + (e.targetId ? `:${e.targetId}` : "")}
                      </td>
                      <td className="px-6 py-4 text-xs text-zinc-500">
                        <pre className="whitespace-pre-wrap break-words font-mono text-[11px]">
                          {e.meta ? JSON.stringify(e.meta) : "—"}
                        </pre>
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

