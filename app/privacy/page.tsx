import { Navbar } from "@/components/marketing/navbar"
import { Footer } from "@/components/marketing/footer"

export default function PrivacyPage() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 pt-32 pb-24">
                <div className="mx-auto max-w-4xl px-6 lg:px-8">
                    <article className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-li:text-slate-600 prose-strong:text-slate-900 prose-headings:font-bold prose-h1:text-4xl prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-p:leading-8 prose-li:leading-8">
                        <h1>Privacy Policy for Helpful Analytics</h1>
                        <p className="text-sm text-slate-500 mb-8">
                            <strong>Last Updated:</strong> December 14, 2024<br />
                            <strong>Effective Date:</strong> December 14, 2024
                        </p>

                        <h2>1. Introduction</h2>
                        <p>
                            Kea Marketing LLC ("Company," "we," "us," or "our") operates the Helpful Analytics software platform (the "Service"). This Privacy Policy explains how we collect, use, disclose, and protect your information when you use our Service.
                        </p>
                        <p>
                            By using Helpful Analytics, you agree to the collection and use of information in accordance with this Privacy Policy. If you do not agree with this Privacy Policy, please do not use the Service.
                        </p>

                        <h2>2. Information We Collect</h2>
                        <p>We collect several types of information from and about users of our Service.</p>

                        <h3>2.1 Information You Provide Directly</h3>
                        <p><strong>Google Account Information</strong></p>
                        <ul>
                            <li>When you sign in to Helpful Analytics using Google OAuth, we receive basic profile information from your Google account, including: name, email address, profile picture, and Google user ID.</li>
                        </ul>

                        <p><strong>Payment Information</strong></p>
                        <ul>
                            <li>When you subscribe to our paid Service, our payment processor (Stripe) collects billing name/address, credit card information, and transaction history.</li>
                        </ul>
                        <p><em>Note: We do not store complete credit card numbers on our servers. Payment processing is handled securely by Stripe.</em></p>

                        <h3>2.2 Google Analytics Data</h3>
                        <p>When you connect your Google Analytics 4 (GA4) properties, we collect and store your GA4 property data, historical analytics data, and custom configurations.</p>
                        <p><strong>Scope of Access:</strong> We only request read-only access. We cannot and will not modify, delete, or alter your Google Analytics data or settings.</p>

                        <h3>2.3 Automatically Collected Information</h3>
                        <p>We automatically collect information about how you interact with our Service: pages visited, time spent, browser type, device info, and IP address. We use cookies to keep you logged in and understand usage.</p>

                        <h2>3. How We Use Your Information</h2>
                        <p>We use the collected information to:</p>
                        <ul>
                            <li>Provide and maintain the Service (registration, dashboard display, insights generation, reporting, payments).</li>
                            <li>Improve the Service (analytics, technical fixes).</li>
                            <li>Communicate with you (announcements, support, billing notifications).</li>
                            <li>Marketing and Advertising (targeted ads, campaign effectiveness).</li>
                        </ul>

                        <h2>4. How We Share Your Information</h2>
                        <p>We do not sell your personal information. We share it with service providers (Stripe, AI providers, hosting) for operational purposes, or for legal reasons if required by law.</p>

                        <h2>5. Data Security</h2>
                        <p>We implement reasonable security measures, including SSL/TLS encryption for data in transit and at rest, to protect your info. However, no method of transmission is 100% secure.</p>

                        <h2>6. Data Retention</h2>
                        <p>We retain info as long as your account is active. Upon cancellation, we delete personal info and GA4 data within 30 days unless required otherwise by law.</p>

                        <h2>7. Your Rights and Choices</h2>
                        <p>You have the right to access, correct, delete, or portability of your info. You can opt-out of marketing and withdraw consent at any time.</p>

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
