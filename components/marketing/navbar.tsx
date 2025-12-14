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
            <div className="flex h-16 w-full max-w-5xl items-center justify-between rounded-full bg-white/70 px-6 shadow-[0_8px_32px_0_rgba(249,171,0,0.07)] backdrop-blur-xl border border-white/20">
                <div className="flex items-center">
                    <Link href="/" className="mr-8 flex items-center space-x-2">
                        {/* GA Logo Style: Rainbow gradient */}
                        <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-white shadow-lg shadow-gray-200 ring-1 ring-gray-100 overflow-hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5">
                                <path fill="#F9AB00" d="M3.5 13.5h5v5h-5z" />
                                <path fill="#E37400" d="M10.5 8.5h5v10h-5z" />
                                <path fill="#F9AB00" d="M17.5 3.5h5v15h-5z" /> {/* Using amber/orange for the bars */}
                            </svg>
                        </div>
                        <span className="hidden font-bold text-slate-800 sm:inline-block text-lg tracking-tight">
                            <span className="bg-gradient-to-r from-[#4285F4] via-[#EA4335] via-[#FBBC05] to-[#34A853] text-transparent bg-clip-text">Helpful</span>
                            <span>Analytics</span>
                        </span>
                    </Link>
                    <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
                        <Link
                            href="#features"
                            className="transition-colors hover:text-primary"
                        >
                            Features
                        </Link>
                        <Link
                            href="#pricing"
                            className="transition-colors hover:text-primary"
                        >
                            Pricing
                        </Link>
                    </nav>
                </div>
                <div className="flex items-center space-x-4">
                    {session ? (
                        <Button asChild className="rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 text-white border-none px-6">
                            <Link href="/dashboard">Dashboard</Link>
                        </Button>
                    ) : (
                        <>
                            <Button asChild variant="ghost" className="hidden sm:inline-flex text-slate-600 hover:text-primary hover:bg-transparent">
                                <Link href="/login">Login</Link>
                            </Button>
                            <Button asChild className="rounded-full bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 px-6">
                                <Link href="/login">Get Started</Link>
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </motion.header>
    )
}
