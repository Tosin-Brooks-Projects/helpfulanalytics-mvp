"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function DisabledPage() {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-zinc-200 rounded-xl p-6 shadow-sm">
        <div className="text-sm font-semibold text-zinc-900">Account disabled</div>
        <div className="text-sm text-zinc-600 mt-2">
          Your account has been temporarily disabled by an administrator. If you think this is a mistake, contact support.
        </div>
        <div className="mt-5 flex items-center justify-between">
          <Button asChild variant="outline">
            <Link href="/login">Back to login</Link>
          </Button>
          <Button asChild>
            <Link href="/">Home</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

