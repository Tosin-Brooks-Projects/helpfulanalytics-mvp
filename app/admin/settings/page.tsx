"use client"

import { useEffect, useMemo, useState } from "react"
import { AdminShell } from "@/components/admin/admin-shell"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

type AdminSettings = {
  maintenanceMode: boolean
  maintenanceMessage: string
  supportEmail: string
  reportFromEmail: string
  adminFromEmail: string
  adminReplyToEmail: string
  blockNewUsers: boolean
  signupAllowlist: string[]
  enableAdvancedReports: boolean
  allowAdminBootstrap: boolean
  updatedAt?: string
}

export default function AdminSettingsPage() {
  const { data: session } = useSession()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<AdminSettings>({
    maintenanceMode: false,
    maintenanceMessage: "",
    supportEmail: "",
    reportFromEmail: "Analytics Report <no-reply@helpfulanalytics.com>",
    adminFromEmail: "",
    adminReplyToEmail: "",
    blockNewUsers: false,
    signupAllowlist: [],
    enableAdvancedReports: true,
    allowAdminBootstrap: false,
  })

  const [testEmailTo, setTestEmailTo] = useState("")
  const [testSubject, setTestSubject] = useState("Helpful Analytics — Test Email")
  const [testHtml, setTestHtml] = useState(
    `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif">\n  <h2>Test email</h2>\n  <p>If you received this, your admin email tool is working.</p>\n</div>`,
  )
  const [sending, setSending] = useState(false)

  const defaultTo = useMemo(() => session?.user?.email || "", [session?.user?.email])

  async function loadSettings() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/settings")
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Failed to load settings")
      setSettings(data.settings)
      if (!testEmailTo) setTestEmailTo(data.settings.supportEmail || defaultTo)
    } catch (e: any) {
      toast.error(e?.message || "Failed to load settings")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSettings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function saveSettings() {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "Failed to save settings")
      toast.success("Settings saved")
      await loadSettings()
    } catch (e: any) {
      toast.error(e?.message || "Failed to save settings")
    } finally {
      setSaving(false)
    }
  }

  async function sendTestEmail() {
    setSending(true)
    try {
      const res = await fetch("/api/admin/email/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: testEmailTo || defaultTo,
          subject: testSubject,
          html: testHtml,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error || "Failed to send email")
      toast.success("Email sent")
    } catch (e: any) {
      toast.error(e?.message || "Failed to send email")
    } finally {
      setSending(false)
    }
  }

  return (
    <AdminShell>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 font-outfit">Settings</h2>
          <p className="text-zinc-500 mt-1">Global controls for the app and admin tooling.</p>
        </div>

        <Card className="p-6 border-zinc-200 bg-white shadow-sm">
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="text-sm font-semibold text-zinc-900">Maintenance mode</div>
              <div className="text-xs text-zinc-500">If enabled, non-admin users are redirected to `/maintenance`.</div>
            </div>
            <Switch
              checked={settings.maintenanceMode}
              onCheckedChange={(v) => setSettings((s) => ({ ...s, maintenanceMode: v }))}
              disabled={loading}
            />
          </div>

          <div className="mt-4 space-y-2">
            <div className="text-xs font-semibold text-zinc-700">Maintenance message</div>
            <Textarea
              value={settings.maintenanceMessage}
              onChange={(e) => setSettings((s) => ({ ...s, maintenanceMessage: e.target.value }))}
              placeholder="Optional message shown to users during maintenance."
              className="min-h-[90px]"
              disabled={loading}
            />
          </div>
        </Card>

        <Card className="p-6 border-zinc-200 bg-white shadow-sm space-y-4">
          <div className="text-sm font-semibold text-zinc-900">Contact + email defaults</div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-zinc-700">Support email</div>
              <Input
                value={settings.supportEmail}
                onChange={(e) => setSettings((s) => ({ ...s, supportEmail: e.target.value }))}
                placeholder="support@yourdomain.com"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-zinc-700">Report “from”</div>
              <Input
                value={settings.reportFromEmail}
                onChange={(e) => setSettings((s) => ({ ...s, reportFromEmail: e.target.value }))}
                placeholder='Helpful Analytics <no-reply@helpfulanalytics.com>'
                disabled={loading}
              />
              <div className="text-[11px] text-zinc-500">Used by `/api/email/send-report`.</div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-zinc-700">Admin email “from”</div>
              <Input
                value={settings.adminFromEmail}
                onChange={(e) => setSettings((s) => ({ ...s, adminFromEmail: e.target.value }))}
                placeholder='Admin <no-reply@helpfulanalytics.com>'
                disabled={loading}
              />
              <div className="text-[11px] text-zinc-500">Used by `/api/admin/email/send`.</div>
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-zinc-700">Reply-to email</div>
              <Input
                value={settings.adminReplyToEmail}
                onChange={(e) => setSettings((s) => ({ ...s, adminReplyToEmail: e.target.value }))}
                placeholder="support@yourdomain.com"
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={loadSettings} disabled={loading || saving}>
              Refresh
            </Button>
            <Button onClick={saveSettings} disabled={loading || saving}>
              {saving ? "Saving..." : "Save settings"}
            </Button>
          </div>
        </Card>

        <Card className="p-6 border-zinc-200 bg-white shadow-sm space-y-4">
          <div className="text-sm font-semibold text-zinc-900">Signup controls</div>
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="text-sm font-medium text-zinc-900">Block new users</div>
              <div className="text-xs text-zinc-500">If enabled, only allowlisted emails can sign up (existing users can still sign in).</div>
            </div>
            <Switch
              checked={settings.blockNewUsers}
              onCheckedChange={(v) => setSettings((s) => ({ ...s, blockNewUsers: v }))}
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-zinc-700">Signup allowlist (one email per line)</div>
            <Textarea
              value={settings.signupAllowlist.join("\n")}
              onChange={(e) =>
                setSettings((s) => ({
                  ...s,
                  signupAllowlist: e.target.value
                    .split("\n")
                    .map((x) => x.trim())
                    .filter(Boolean),
                }))
              }
              placeholder={"owner@domain.com\nteammate@domain.com"}
              className="min-h-[120px]"
              disabled={loading}
            />
          </div>
        </Card>

        <Card className="p-6 border-zinc-200 bg-white shadow-sm space-y-4">
          <div className="text-sm font-semibold text-zinc-900">Feature flags</div>
          <div className="flex items-start justify-between gap-6">
            <div>
              <div className="text-sm font-medium text-zinc-900">Advanced GA4 reports</div>
              <div className="text-xs text-zinc-500">
                Controls Events, Conversions, Landing Pages, and States drilldown in the dashboard.
              </div>
            </div>
            <Switch
              checked={settings.enableAdvancedReports}
              onCheckedChange={(v) => setSettings((s) => ({ ...s, enableAdvancedReports: v }))}
              disabled={loading}
            />
          </div>
        </Card>

        <Card className="p-6 border-zinc-200 bg-white shadow-sm space-y-4">
          <div className="text-sm font-semibold text-zinc-900">Admin email tools</div>
          <div className="text-xs text-zinc-500">
            Sends via Resend using `RESEND_API_KEY`. This endpoint is admin-only.
          </div>

          <div className="grid gap-4">
            <div className="space-y-2">
              <div className="text-xs font-semibold text-zinc-700">To</div>
              <Input
                value={testEmailTo}
                onChange={(e) => setTestEmailTo(e.target.value)}
                placeholder={defaultTo || "you@domain.com"}
              />
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-zinc-700">Subject</div>
              <Input value={testSubject} onChange={(e) => setTestSubject(e.target.value)} />
            </div>
            <div className="space-y-2">
              <div className="text-xs font-semibold text-zinc-700">HTML</div>
              <Textarea value={testHtml} onChange={(e) => setTestHtml(e.target.value)} className="min-h-[140px]" />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={sendTestEmail} disabled={sending}>
              {sending ? "Sending..." : "Send test email"}
            </Button>
          </div>
        </Card>
      </div>
    </AdminShell>
  )
}

