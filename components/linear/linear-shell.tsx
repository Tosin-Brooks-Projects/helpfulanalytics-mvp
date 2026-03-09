import { ReactNode } from "react"
import { LinearSidebar } from "@/components/linear/linear-sidebar"
import { LinearHeader } from "@/components/linear/linear-header"
import { MobileBottomNav } from "@/components/linear/mobile-bottom-nav"
import { useDashboard } from "./dashboard-context"
import { cn } from "@/lib/utils"
import { DashboardTour } from "@/components/dashboard/dashboard-tour"
import { FloatingAiAssistant } from "@/components/ui/glowing-ai-chat-assistant"

interface LinearShellProps {
    children: ReactNode
}

export function LinearShell({ children }: LinearShellProps) {
    const { sidebarCollapsed } = useDashboard()

    return (
        <div className="flex h-screen w-full bg-transparent text-zinc-900 selection:bg-amber-500/30 overflow-hidden">
            <DashboardTour />
            <FloatingAiAssistant />
            {/* Desktop Sidebar */}
            <aside className={cn(
                "fixed left-0 top-0 z-40 h-full border-r border-zinc-200 bg-white hidden lg:block transition-all duration-300 ease-in-out",
                sidebarCollapsed ? "w-16" : "w-64"
            )}>
                <LinearSidebar />
            </aside>

            {/* Main Content Wrapper */}
            <div className={cn(
                "flex-1 flex flex-col h-full transition-all duration-300 ease-in-out",
                sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
            )}>
                <LinearHeader />
                {/* Scrollable Main Area */}
                <main id="main-dashboard-content" className="flex-1 overflow-y-auto p-4 lg:p-10 pt-4 lg:pt-10 pb-24 lg:pb-20 animate-in fade-in duration-500">
                    <div className="max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />
        </div>
    )
}
