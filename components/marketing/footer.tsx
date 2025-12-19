import Link from "next/link"

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t border-foreground/5 bg-background">
            <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
                <div className="flex justify-center space-x-6 md:order-2">
                    <Link href="/about" className="text-sm leading-6 text-muted-foreground hover:text-primary transition-colors">
                        About
                    </Link>
                    <Link href="/privacy" className="text-sm leading-6 text-muted-foreground hover:text-primary transition-colors">
                        Privacy Policy
                    </Link>
                    <Link href="/terms" className="text-sm leading-6 text-muted-foreground hover:text-primary transition-colors">
                        Terms of Service
                    </Link>
                </div>
                <div className="mt-8 md:order-1 md:mt-0">
                    <p className="text-center text-xs leading-5 text-muted-foreground">
                        &copy; {currentYear} Helpful Analytics. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
