import { SignInPage } from "@/components/ui/sign-in-flow";
import { Suspense } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In — Helpful Analytics",
  description: "Sign in to your Helpful Analytics dashboard. Access your GA4 reports, manage properties, and view client analytics.",
  alternates: {
    canonical: "https://helpfulanalytics.com/login",
  },
  openGraph: {
    title: "Sign In — Helpful Analytics",
    description: "Sign in to your Helpful Analytics dashboard.",
    url: "https://helpfulanalytics.com/login",
  },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInPage />
    </Suspense>
  );
}
