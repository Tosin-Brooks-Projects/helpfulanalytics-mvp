import { Navbar } from "@/components/marketing/navbar"
import { Footer } from "@/components/marketing/footer"

export default function TermsPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 pt-32 pb-24">
                <div className="mx-auto max-w-4xl px-6 lg:px-8">
                    <article className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-li:text-slate-600 prose-strong:text-slate-900 prose-headings:font-bold prose-h1:text-4xl prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-p:leading-8 prose-li:leading-8">
                        <h1>Terms of Service for Helpful Analytics</h1>
                        <p className="text-sm text-slate-500 mb-8">
                            <strong>Last Updated:</strong> December 14, 2024<br />
                            <strong>Effective Date:</strong> December 14, 2024
                        </p>

                        <h2>1. Agreement to Terms</h2>
                        <p>
                            These Terms of Service ("Terms") constitute a legally binding agreement between you and Kea Marketing LLC concerning your access to and use of the Helpful Analytics software platform.
                        </p>

                        <h2>2. Description of Service</h2>
                        <p>Helpful Analytics is a paid SaaS platform that connects to GA4, displays data in an easy-to-read dashboard, and provides AI insights and PDF reports.</p>

                        <h2>3. Eligibility</h2>
                        <p>You must be at least 18 years old and capable of forming a binding contract to use the Service.</p>

                        <h2>4. Account Registration and Security</h2>
                        <p>To use Helpful Analytics, you must have a valid Google account. You are responsible for account security and accuracy of information provided.</p>

                        <h2>5. Subscription Plans and Pricing</h2>
                        <p>Helpful Analytics offers monthly and annual plans. Free trials may be available. Subscriptions automatically renew unless canceled.</p>

                        <h2>6. Our 110% Satisfaction Guarantee</h2>
                        <p>If not satisfied, you may request a refund. We will donate 110% of the amount paid to a 501(c)3 nonprofit of your choice.</p>

                        <h2>7. Payment Processing</h2>
                        <p>Payments are processed securely through Stripe. We do not store complete credit card info on our servers.</p>

                        <h2>8. Google Analytics Access and Data Usage</h2>
                        <p>We require read-only access. Data is stored to provide dashboard visualization, AI insights, and reports. Data is NOT used for training AI models.</p>

                        <h2>9. AI-Powered Suggestions</h2>
                        <p>We use various AI models. Suggestions are informational, not professional advice. Accuracy is not guaranteed.</p>

                        <h2>10. Intellectual Property Rights</h2>
                        <p>Kea Marketing LLC owns the Service. You retain all rights to your GA4 data and content you provide.</p>

                        <h2>11. Acceptable Use Policy</h2>
                        <p>Users must not violate laws, transmit harmful code, reverse engineer, or abuse the Service.</p>

                        <h2>Contact Information</h2>
                        <p>
                            <strong>Kea Marketing LLC</strong><br />
                            <a href="https://x.com/brooksconkle" className="text-primary hover:underline">https://x.com/brooksconkle</a>
                        </p>
                    </article>
                </div>
            </main>
            <Footer />
        </div>
    )
}
