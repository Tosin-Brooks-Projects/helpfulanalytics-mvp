import { LinearDashboardProvider } from "@/components/linear/dashboard-context"
import { AIProvider } from "@/components/linear/ai-context"

export default function LinearDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <LinearDashboardProvider>
            <AIProvider>
                {children}
            </AIProvider>
        </LinearDashboardProvider>
    )
}
