import { OnboardingWizard } from "../../components/onboarding/onboarding-wizard"

export default function OnboardingPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 p-4 md:p-8">
            <div className="w-full max-w-3xl space-y-6">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold tracking-tight">Welcome to HelpfulAnalytics</h1>
                    <p className="text-muted-foreground">
                        Let&apos;s get you set up in just a few steps.
                    </p>
                </div>
                <OnboardingWizard />
            </div>
        </div>
    )
}
