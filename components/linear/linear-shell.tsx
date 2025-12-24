import { ReactNode, useState } from "react"
import { LinearSidebar } from "@/components/linear/linear-sidebar"
import { LinearHeader } from "@/components/linear/linear-header"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDashboard } from "./dashboard-context"
import { cn } from "@/lib/utils"
import { DashboardTour } from "@/components/dashboard/dashboard-tour"
import { SetupProgress } from "@/components/dashboard/setup-progress"

interface LinearShellProps {
    children: ReactNode
}

export function LinearShell({ children }: LinearShellProps) {
    const [open, setOpen] = useState(false)
    const { sidebarCollapsed } = useDashboard()

    return (
        <div className="flex h-screen w-full bg-transparent text-zinc-900 selection:bg-amber-500/30 overflow-hidden">
            <DashboardTour />
            <SetupProgress />
            {/* Desktop Sidebar */}
            <aside className={cn(
                "fixed left-0 top-0 z-40 h-full border-r border-zinc-200 bg-white hidden lg:block transition-all duration-300 ease-in-out",
                sidebarCollapsed ? "w-16" : "w-64"
            )}>
                <LinearSidebar />
            </aside>

            {/* Mobile Sidebar */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="fixed left-4 top-3 z-50 lg:hidden text-zinc-500 hover:text-zinc-900">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 border-r border-zinc-200 bg-white p-0">
                    <LinearSidebar />
                </SheetContent>
            </Sheet>

            {/* Main Content Wrapper */}
            <div className={cn(
                "flex-1 flex flex-col h-full transition-all duration-300 ease-in-out",
                sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
            )}>
                <LinearHeader />
                {/* Scrollable Main Area */}
                <main id="main-dashboard-content" className="flex-1 overflow-y-auto p-4 lg:p-10 pt-16 lg:pt-10 pb-20 animate-in fade-in duration-500">
                    <div className="max-w-[1600px] mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
