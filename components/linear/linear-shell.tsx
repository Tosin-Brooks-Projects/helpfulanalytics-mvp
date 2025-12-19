import { ReactNode, useState } from "react"
import { LinearSidebar } from "@/components/linear/linear-sidebar"
import { LinearHeader } from "@/components/linear/linear-header"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDashboard } from "./dashboard-context"
import { cn } from "@/lib/utils"

interface LinearShellProps {
    children: ReactNode
}

export function LinearShell({ children }: LinearShellProps) {
    const [open, setOpen] = useState(false)
    const { sidebarCollapsed } = useDashboard()

    return (
        <div className="flex min-h-screen bg-zinc-50 text-zinc-900 selection:bg-amber-500/30">
            {/* Desktop Sidebar */}
            <aside className={cn(
                "fixed left-0 top-0 z-40 h-screen border-r border-zinc-200 bg-white hidden lg:block transition-all duration-300 ease-in-out",
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

            {/* Main Content */}
            <div className={cn(
                "flex-1 transition-all duration-300 ease-in-out",
                sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
            )}>
                <LinearHeader />
                <main id="main-dashboard-content" className="p-4 lg:p-10 max-w-[1600px] mx-auto animate-in fade-in duration-500 pt-16 lg:pt-10">
                    {children}
                </main>
            </div>
        </div>
    )
}
