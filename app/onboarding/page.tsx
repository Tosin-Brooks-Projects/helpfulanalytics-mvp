import { OnboardingWizard } from "../../components/onboarding/onboarding-wizard"

export default function OnboardingPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090b] text-zinc-100 p-4 md:p-8">
            <div className="w-full max-w-3xl space-y-6 relative z-10">
                <OnboardingWizard />
            </div>
        </div>
    )
}
