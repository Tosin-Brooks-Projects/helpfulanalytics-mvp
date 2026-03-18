"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"

export default function MaintenancePage() {
  const { data: session } = useSession()
  const message =
    (session?.user as any)?.maintenanceMessage ||
    "We’re doing some maintenance right now. Please check back soon."

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
        <div className="text-sm font-semibold text-zinc-900">Maintenance mode</div>
        <div className="text-sm text-zinc-600 mt-2">
          {message}
        </div>
        <div className="mt-5 flex items-center justify-end gap-2">
          <Button asChild variant="outline">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/">Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

