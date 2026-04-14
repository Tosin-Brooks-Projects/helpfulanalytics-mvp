import dynamic from "next/dynamic"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth-options"
import { db } from "@/lib/firebase-admin"
import { getSubscriptionStatus } from "@/lib/subscription"

const DashboardShell = dynamic(
    () => import("@/components/dashboard/dashboard-shell").then(mod => mod.DashboardShell),
    {
        ssr: false,
        loading: () => <div className="h-screen bg-zinc-50 animate-pulse" />
    }
)

export default async function LinearDashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await getServerSession(authOptions)

    if (session?.user?.id) {
        const doc = await db.collection("users").doc(session.user.id).get()
        if (doc.exists) {
            const data = doc.data()
            const { isPremium } = getSubscriptionStatus(data)
            if (!isPremium) {
                redirect("/pricing?reason=trial_expired")
            }
        }
    }

    return (
        <DashboardShell>
            {children}
        </DashboardShell>
    )
}
