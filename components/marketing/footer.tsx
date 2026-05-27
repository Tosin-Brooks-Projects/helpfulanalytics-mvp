import Link from "next/link"

const navigation = {
    product: [
        { name: "Features", href: "/#features" },
        { name: "Pricing", href: "/#pricing" },
        { name: "Blog", href: "/blog" },
    ],
    company: [
        { name: "About", href: "/about" },
        { name: "Login", href: "/login" },
    ],
    legal: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
    ],
}

export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="bg-slate-900 border-t border-white/5">
            <div className="mx-auto max-w-7xl px-6 lg:px-8 pt-16 pb-10">

                {/* Main grid */}
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-[2fr_1fr_1fr_1fr]">

                    {/* Brand block */}
                    <div className="max-w-xs">
                        <Link href="/" className="inline-flex items-center">
                            <span className="font-bold text-white text-xl tracking-tight">
                                Helpful<span className="text-primary">Analytics</span>
                            </span>
                        </Link>
                        <p className="mt-4 text-sm leading-6 text-slate-400">
                            The clear dashboard for Google Analytics 4. Connect in 60 seconds and finally understand your website traffic.
                        </p>
                        {/* Social links */}
                        <div className="mt-6 flex items-center gap-4">
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-500 hover:text-slate-300 transition-colors duration-200"
                                aria-label="Follow on X (Twitter)"
                            >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                            <a
                                href="https://linkedin.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-slate-500 hover:text-slate-300 transition-colors duration-200"
                                aria-label="Follow on LinkedIn"
                            >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    {/* Product */}
                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                            Product
                        </h3>
                        <ul className="mt-4 space-y-3">
                            {navigation.product.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="text-sm text-slate-500 hover:text-slate-200 transition-colors duration-200"
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                            Company
                        </h3>
                        <ul className="mt-4 space-y-3">
                            {navigation.company.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="text-sm text-slate-500 hover:text-slate-200 transition-colors duration-200"
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
                            Legal
                        </h3>
                        <ul className="mt-4 space-y-3">
                            {navigation.legal.map((item) => (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className="text-sm text-slate-500 hover:text-slate-200 transition-colors duration-200"
                                    >
                                        {item.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="mt-14 border-t border-white/5 pt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <p className="text-xs text-slate-600">
                        &copy; {currentYear} Helpful Analytics. All rights reserved.
                    </p>
                    <p className="text-xs text-slate-600">
                        Not affiliated with Google LLC. Google Analytics is a trademark of Google LLC.
                    </p>
                </div>
            </div>
        </footer>
    )
}
