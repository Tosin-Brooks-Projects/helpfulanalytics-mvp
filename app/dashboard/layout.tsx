import dynamic from "next/dynamic"

const DashboardShell = dynamic(
    () => import("@/components/dashboard/dashboard-shell").then(mod => mod.DashboardShell),
    {
        ssr: false,
        loading: () => <div className="h-screen bg-zinc-50 animate-pulse" />
    }
)

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
