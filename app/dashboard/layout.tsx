import dynamic from "next/dynamic"

const DashboardShell = dynamic(
    () => import("@/components/dashboard/dashboard-shell").then(mod => mod.DashboardShell),
    {
        ssr: false,
        loading: () => <div className="h-screen bg-zinc-50 animate-pulse" />
    }
)

// Trial/subscription enforcement happens per-page in LinearShell (the
// AnalyticsPaywall), not here — Settings/Profile stay reachable past trial
// expiry so users can actually subscribe.
export default function LinearDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <DashboardShell>
            {children}
        </DashboardShell>
    )
}
