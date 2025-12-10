"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"

export function Navbar() {
    const { data: session } = useSession()

    return (
        <motion.header
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4"
        >
            <div className="flex h-16 w-full max-w-5xl items-center justify-between rounded-full bg-white/70 px-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.07)] backdrop-blur-xl border border-white/20">
                <div className="flex items-center">
                    <Link href="/" className="mr-8 flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30" />
                        <span className="hidden font-bold text-slate-800 sm:inline-block">
                            HelpfulAnalytics
                        </span>
                    </Link>
                    <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
                        <Link
                            href="#features"
                            className="transition-colors hover:text-indigo-600"
                        >
                            Features
                        </Link>
                        <Link
                            href="#pricing"
                            className="transition-colors hover:text-indigo-600"
                        >
                            Pricing
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center space-x-4">
                    {session ? (
                        <Button asChild className="rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 text-white border-none px-6">
                            <Link href="/dashboard">Dashboard</Link>
                        </Button>
                    ) : (
                        <>
                            <Button asChild variant="ghost" className="hidden sm:inline-flex text-slate-600 hover:text-indigo-600 hover:bg-transparent">
                                <Link href="/login">Login</Link>
                            </Button>
                            <Button asChild className="rounded-full bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-900/20 px-6">
                                <Link href="/login">Get Started</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </motion.header>
    )
}
