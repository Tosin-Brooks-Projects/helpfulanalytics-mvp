import { ReactNode, useState } from "react"
import { LinearSidebar } from "@/components/linear/linear-sidebar"
import { LinearHeader } from "@/components/linear/linear-header"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LinearShellProps {
    children: ReactNode
}

export function LinearShell({ children }: LinearShellProps) {
    const [open, setOpen] = useState(false)

    return (
        <div className="flex min-h-screen bg-[#09090b] text-zinc-100 selection:bg-indigo-500/30">
            {/* Desktop Sidebar */}
            <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/5 bg-[#09090b]/80 backdrop-blur-xl hidden lg:block">
                <LinearSidebar />
            </aside>

            {/* Mobile Sidebar */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="fixed left-4 top-3 z-50 lg:hidden text-zinc-400 hover:text-zinc-100">
                        <Menu className="h-5 w-5" />
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-64 border-r border-white/5 bg-[#09090b] p-0">
                    <LinearSidebar />
                </SheetContent>
            </Sheet>

            {/* Main Content */}
            <div className="flex-1 lg:pl-64">
                <LinearHeader />
                <main id="main-dashboard-content" className="p-4 lg:p-10 max-w-[1600px] mx-auto animate-in fade-in duration-500 pt-16 lg:pt-10">
                    {children}
                </main>
            </div>
        </div>
    )
}
