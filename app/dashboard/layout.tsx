import { LinearDashboardProvider } from "@/components/linear/dashboard-context"

export default function LinearDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <LinearDashboardProvider>
            {children}
        </LinearDashboardProvider>
    )
}
