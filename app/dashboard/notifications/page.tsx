"use client"

import { LinearShell } from "@/components/linear/linear-shell"
import { Bell, CheckCircle2, AlertTriangle, Info, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const notifications = [
    {
        id: 1,
        title: "Traffic Spike Detected",
        message: "Your site traffic is up 45% compared to last week. Great job!",
        time: "2 hours ago",
        type: "success",
        read: false,
    },
    {
        id: 2,
        title: "New Feature Available",
        message: "You can now track custom events in the Realtime dashboard.",
        time: "1 day ago",
        type: "info",
        read: false,
    },
    {
        id: 3,
        title: "Weekly Report Ready",
        message: "Your weekly analytics summary for Oct 24 - Oct 30 is ready to view.",
        time: "2 days ago",
        type: "info",
        read: true,
    },
    {
        id: 4,
        title: "API Usage Warning",
        message: "You are approaching 80% of your monthly API quota.",
        time: "3 days ago",
        type: "warning",
        read: true,
    },
]

export default function NotificationsPage() {
    return (
        <LinearShell>
            <div className="flex flex-col gap-8 max-w-2xl">
                <div>
                    <h1 className="text-2xl font-medium tracking-tight text-zinc-100">Notifications</h1>
                    <p className="text-sm text-zinc-400">Stay updated with alerts and insights.</p>
                </div>

                <div className="flex flex-col gap-2">
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={cn(
                                "group flex items-start gap-4 rounded-lg border p-4 transition-all",
                                notification.read
                                    ? "border-transparent bg-transparent hover:bg-white/[0.02]"
                                    : "border-white/5 bg-white/[0.02] hover:border-white/10 hover:bg-white/[0.04]"
                            )}
                        >
                            <div className={cn(
                                "mt-1 flex h-8 w-8 items-center justify-center rounded-full border",
                                notification.type === "success" && "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
                                notification.type === "warning" && "border-amber-500/20 bg-amber-500/10 text-amber-400",
                                notification.type === "info" && "border-blue-500/20 bg-blue-500/10 text-blue-400",
                            )}>
                                {notification.type === "success" && <CheckCircle2 className="h-4 w-4" />}
                                {notification.type === "warning" && <AlertTriangle className="h-4 w-4" />}
                                {notification.type === "info" && <Info className="h-4 w-4" />}
                            </div>
                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <p className={cn("text-sm font-medium", notification.read ? "text-zinc-400" : "text-zinc-200")}>
                                        {notification.title}
                                    </p>
                                    <span className="text-xs text-zinc-500">{notification.time}</span>
                                </div>
                                <p className="text-sm text-zinc-500 leading-relaxed">
                                    {notification.message}
                                </p>
                            </div>
                            {!notification.read && (
                                <div className="h-2 w-2 rounded-full bg-indigo-500 mt-2" />
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex justify-center pt-4">
                    <button className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1">
                        View earlier notifications <ArrowRight className="h-3 w-3" />
                    </button>
                </div>
            </div>
        </LinearShell>
    )
}
