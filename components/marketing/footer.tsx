import Link from "next/link"

export function Footer() {
    return (
        <footer className="container py-6 md:px-8 md:py-0">
            <div className="flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
                <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
                    Built by{" "}
                    <a
                        href="https://twitter.com/helpfulanalytics"
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium underline underline-offset-4"
                    >
                        HelpfulAnalytics
                    </a>
                    . The source code is available on{" "}
                    <a
                        href="https://github.com/helpfulanalytics"
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium underline underline-offset-4"
                    >
                        GitHub
                    </a>
                    .
                </p>
            </div>
        </footer>
    )
}
