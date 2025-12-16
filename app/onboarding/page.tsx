import { OnboardingWizard } from "../../components/onboarding/onboarding-wizard"

export default function OnboardingPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] text-zinc-100 p-4 md:p-8">
            {/* Background Gradients */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] h-[600px] w-[600px] rounded-full bg-indigo-500/10 blur-[100px]" />
                <div className="absolute bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-blue-500/10 blur-[100px]" />
            </div>

            <div className="w-full max-w-3xl space-y-6 relative z-10">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-medium tracking-tight text-white">Welcome to HelpfulAnalytics</h1>
                    <p className="text-zinc-400">
                        Let&apos;s get you set up with your 30-day free trial.
                    </p>
                </div>
                <OnboardingWizard />
            </div>
        </div>
    )
}
