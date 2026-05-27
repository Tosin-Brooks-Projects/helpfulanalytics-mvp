"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { Menu, X, ArrowRight } from "lucide-react"

const navLinks = [
    { label: "About", href: "/about", scrollId: undefined },
    { label: "Features", href: "/#features", scrollId: "features" },
    { label: "Pricing", href: "/#pricing", scrollId: "pricing" },
    { label: "Blog", href: "/blog", scrollId: undefined },
]

export function Navbar() {
    const { data: session } = useSession()
    const pathname = usePathname()
    const isHome = pathname === "/"
    const [menuOpen, setMenuOpen] = useState(false)
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 60)
        onScroll()
        window.addEventListener("scroll", onScroll, { passive: true })
        return () => window.removeEventListener("scroll", onScroll)
    }, [])

    useEffect(() => { setMenuOpen(false) }, [pathname])

    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : ""
        return () => { document.body.style.overflow = "" }
    }, [menuOpen])

    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, scrollId?: string) => {
        setMenuOpen(false)
        if (isHome && scrollId) {
            e.preventDefault()
            document.getElementById(scrollId)?.scrollIntoView({ behavior: "smooth" })
        }
    }

    return (
        <>
            {/* ── Floating pill ── */}
            <motion.header
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4"
            >
                <div className={`flex h-14 w-full max-w-5xl items-center justify-between rounded-full px-4 sm:px-6 transition-all duration-300 ${
                    scrolled
                        ? "bg-white/90 backdrop-blur-xl border border-white/40 shadow-[0_4px_24px_0_rgba(0,0,0,0.06)]"
                        : "liquid-glass"
                }`}>

                    {/* Logo */}
                    <Link href="/" className="flex items-center shrink-0" onClick={() => setMenuOpen(false)}>
                        <span className={`font-bold text-lg tracking-tight transition-colors duration-300 ${scrolled ? "text-slate-900" : "text-white"}`}>
                            Helpful<span className="text-primary">Analytics</span>
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                        {navLinks.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                onClick={(e) => handleScroll(e, link.scrollId)}
                                className={`transition-colors duration-150 hover:text-primary ${scrolled ? "text-slate-500" : "text-white/70"}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop actions */}
                    <div className="hidden md:flex items-center gap-3">
                        {session ? (
                            <Button asChild className="rounded-full bg-primary hover:bg-primary/90 text-white border-none px-5 h-9 text-sm shadow-sm shadow-primary/20">
                                <Link href="/dashboard">Dashboard</Link>
                            </Button>
                        ) : (
                            <>
                                <Button asChild variant="ghost" className={`hover:bg-transparent px-4 h-9 text-sm transition-colors duration-150 ${scrolled ? "text-slate-500 hover:text-primary" : "text-white/70 hover:text-white"}`}>
                                    <Link href="/login">Login</Link>
                                </Button>
                                <Button asChild className="rounded-full bg-primary hover:bg-primary/90 text-white border-none px-5 h-9 text-sm shadow-sm shadow-primary/20">
                                    <Link href="/login">Start free trial</Link>
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMenuOpen((v) => !v)}
                        className={`flex md:hidden h-9 w-9 items-center justify-center rounded-full transition-colors duration-150 ${scrolled ? "text-slate-700 hover:bg-slate-100" : "text-white/80 hover:bg-white/10"}`}
                        aria-label={menuOpen ? "Close menu" : "Open menu"}
                        aria-expanded={menuOpen}
                    >
                        <AnimatePresence mode="wait" initial={false}>
                            {menuOpen ? (
                                <motion.span
                                    key="close"
                                    initial={{ opacity: 0, rotate: -90 }}
                                    animate={{ opacity: 1, rotate: 0 }}
                                    exit={{ opacity: 0, rotate: 90 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <X className="h-5 w-5" />
                                </motion.span>
                            ) : (
                                <motion.span
                                    key="open"
                                    initial={{ opacity: 0, rotate: 90 }}
                                    animate={{ opacity: 1, rotate: 0 }}
                                    exit={{ opacity: 0, rotate: -90 }}
                                    transition={{ duration: 0.15 }}
                                >
                                    <Menu className="h-5 w-5" />
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
            </motion.header>

            {/* ── Full-screen mobile menu ── */}
            <AnimatePresence>
                {menuOpen && (
                    <motion.div
                        key="mobile-menu"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="fixed inset-0 z-40 flex flex-col bg-slate-950 md:hidden"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Navigation menu"
                    >
                        {/* Decorative amber glow — top right */}
                        <div
                            className="pointer-events-none absolute top-0 right-0 h-72 w-72 opacity-20"
                            aria-hidden="true"
                            style={{
                                background: "radial-gradient(circle, hsl(36 100% 50%) 0%, transparent 70%)",
                            }}
                        />
                        {/* Decorative amber glow — bottom left */}
                        <div
                            className="pointer-events-none absolute bottom-0 left-0 h-48 w-48 opacity-10"
                            aria-hidden="true"
                            style={{
                                background: "radial-gradient(circle, hsl(36 100% 50%) 0%, transparent 70%)",
                            }}
                        />

                        {/* Nav links — center of screen */}
                        <nav className="flex flex-1 flex-col justify-center px-8">
                            <ul className="space-y-1">
                                {navLinks.map((link, index) => (
                                    <motion.li
                                        key={link.label}
                                        initial={{ opacity: 0, x: -24 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -16 }}
                                        transition={{
                                            duration: 0.3,
                                            delay: index * 0.06,
                                            ease: [0.22, 1, 0.36, 1],
                                        }}
                                    >
                                        <Link
                                            href={link.href}
                                            onClick={(e) => handleScroll(e, link.scrollId)}
                                            className="group flex items-center justify-between py-4 border-b border-white/5 last:border-0"
                                        >
                                            <span className="text-3xl font-bold text-white/80 group-hover:text-white transition-colors duration-150">
                                                {link.label}
                                            </span>
                                            <ArrowRight className="h-5 w-5 text-white/20 group-hover:text-primary group-hover:translate-x-1 transition-all duration-150" aria-hidden="true" />
                                        </Link>
                                    </motion.li>
                                ))}
                            </ul>
                        </nav>

                        {/* Bottom CTA area */}
                        <motion.div
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 8 }}
                            transition={{ duration: 0.3, delay: 0.22, ease: "easeOut" }}
                            className="px-8 pb-12 pt-6 border-t border-white/8"
                        >
                            {session ? (
                                <Button asChild className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white border-none text-base font-semibold shadow-lg shadow-primary/20">
                                    <Link href="/dashboard">Go to dashboard</Link>
                                </Button>
                            ) : (
                                <div className="flex flex-col gap-3">
                                    <Button asChild className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-white border-none text-base font-semibold shadow-lg shadow-primary/20">
                                        <Link href="/login">Start free trial</Link>
                                    </Button>
                                    <Button asChild variant="ghost" className="w-full h-12 rounded-2xl text-white/50 hover:text-white hover:bg-white/5 text-sm">
                                        <Link href="/login">Login to your account</Link>
                                    </Button>
                                </div>
                            )}
                            <p className="mt-4 text-center text-xs text-white/20">
                                No credit card required · 30-day free trial
                            </p>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
