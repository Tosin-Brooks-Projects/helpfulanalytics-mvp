"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, ChevronRight, Loader2 } from "lucide-react"

export function OnboardingWizard() {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleConnect = async () => {
        setLoading(true)
        // Simulate connection delay or redirect to auth
        setTimeout(() => {
            setLoading(false)
            setStep(2)
        }, 1500)
    }

    const handleFinish = async () => {
        setLoading(true)
        // Simulate finishing setup
        setTimeout(() => {
            setLoading(false)
            router.push("/dashboard")
        }, 1000)
    }

    return (
        <div className="relative">
            {/* Steps Indicator */}
            <div className="mb-8 flex justify-center gap-4">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm font-medium transition-colors ${step >= i
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-background text-muted-foreground"
                            }`}
                    >
                        {step > i ? <Check className="h-4 w-4" /> : i}
                    </div>
                ))}
            </div>

            <Card>
                {step === 1 && (
                    <>
                        <CardHeader>
                            <CardTitle>Connect Google Analytics</CardTitle>
                            <CardDescription>
                                We need read-only access to your GA4 properties to display your data.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="rounded-md bg-blue-50 p-4 dark:bg-blue-900/20">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3 flex-1 md:flex md:justify-between">
                                        <p className="text-sm text-blue-700 dark:text-blue-300">
                                            We only import aggregate metrics. No personal user data is stored.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleConnect} disabled={loading} className="w-full">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Connect Account
                            </Button>
                        </CardFooter>
                    </>
                )}

                {step === 2 && (
                    <>
                        <CardHeader>
                            <CardTitle>Select Property</CardTitle>
                            <CardDescription>
                                Choose the Google Analytics property you want to track.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {/* Mock Property List */}
                                {["My Awesome Blog", "E-commerce Store", "Portfolio Site"].map((prop, i) => (
                                    <div key={i} className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted cursor-pointer" onClick={() => setStep(3)}>
                                        <div className="font-medium">{prop}</div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </>
                )}

                {step === 3 && (
                    <>
                        <CardHeader className="text-center">
                            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                                <Check className="h-6 w-6 text-green-600" />
                            </div>
                            <CardTitle>You&apos;re All Set!</CardTitle>
                            <CardDescription>
                                Your dashboard is ready. We&apos;ve started syncing your latest data.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter>
                            <Button onClick={handleFinish} disabled={loading} className="w-full">
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Go to Dashboard
                            </Button>
                        </CardFooter>
                    </>
                )}
            </Card>
        </div>
    )
}
