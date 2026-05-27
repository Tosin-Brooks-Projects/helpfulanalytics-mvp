"use client";

import "./velorah.css";

const VIDEO_URL =
    "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4";

const navLinks = [
    { label: "Home", active: true },
    { label: "Studio" },
    { label: "About" },
    { label: "Journal" },
    { label: "Reach Us" },
];

export default function VelorahDemo() {
    return (
        <div className="velorah-root relative min-h-dvh overflow-hidden">

            {/* ── Video background ── */}
            <video
                autoPlay
                loop
                muted
                playsInline
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover z-0"
            >
                <source src={VIDEO_URL} type="video/mp4" />
            </video>

            {/* ── Content layer ── */}
            <div className="relative z-10 flex flex-col min-h-dvh">

                {/* ── Navigation ── */}
                <header className="w-full px-8 py-6">
                    <div className="max-w-7xl mx-auto flex items-center justify-between">

                        {/* Logo */}
                        <span
                            className="text-3xl tracking-tight text-white select-none"
                            style={{ fontFamily: "'Instrument Serif', serif" }}
                        >
                            Velorah<sup className="text-xs align-super ml-[1px]">®</sup>
                        </span>

                        {/* Desktop nav links */}
                        <nav className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <a
                                    key={link.label}
                                    href="#"
                                    className="text-sm transition-colors duration-200 cursor-pointer"
                                    style={{
                                        color: link.active
                                            ? "hsl(0 0% 100%)"
                                            : "hsl(240 4% 66%)",
                                    }}
                                    onMouseEnter={(e) =>
                                        ((e.currentTarget as HTMLElement).style.color = "hsl(0 0% 100%)")
                                    }
                                    onMouseLeave={(e) => {
                                        if (!link.active)
                                            (e.currentTarget as HTMLElement).style.color =
                                                "hsl(240 4% 66%)";
                                    }}
                                >
                                    {link.label}
                                </a>
                            ))}
                        </nav>

                        {/* CTA */}
                        <button
                            className="liquid-glass rounded-full px-6 py-2.5 text-sm text-white transition-transform duration-200 hover:scale-[1.03] cursor-pointer"
                        >
                            Begin Journey
                        </button>
                    </div>
                </header>

                {/* ── Hero ── */}
                <main className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-32 pb-40">

                    <h1
                        className="animate-fade-rise text-5xl sm:text-7xl md:text-8xl leading-[0.95] max-w-7xl font-normal text-white"
                        style={{
                            fontFamily: "'Instrument Serif', serif",
                            letterSpacing: "-2.46px",
                        }}
                    >
                        Where{" "}
                        <em className="not-italic" style={{ color: "hsl(240 4% 66%)" }}>
                            dreams
                        </em>{" "}
                        rise{" "}
                        <em className="not-italic" style={{ color: "hsl(240 4% 66%)" }}>
                            through the silence.
                        </em>
                    </h1>

                    <p
                        className="animate-fade-rise-delay mt-8 max-w-2xl text-base sm:text-lg leading-relaxed"
                        style={{ color: "hsl(240 4% 66%)" }}
                    >
                        We&apos;re designing tools for deep thinkers, bold creators, and quiet
                        rebels. Amid the chaos, we build digital spaces for sharp focus and
                        inspired work.
                    </p>

                    <button
                        className="animate-fade-rise-delay-2 liquid-glass mt-12 rounded-full px-14 py-5 text-base text-white transition-transform duration-200 hover:scale-[1.03] cursor-pointer"
                    >
                        Begin Journey
                    </button>
                </main>
            </div>
        </div>
    );
}
