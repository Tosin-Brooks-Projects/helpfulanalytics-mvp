import { SignInPage } from "@/components/ui/sign-in-flow";
import { Suspense } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login - Helpful Analytics",
  description: "Login to your Helpful Analytics dashboard.",
  openGraph: {
    title: "Login - Helpful Analytics",
    description: "Login to your Helpful Analytics dashboard.",
  }
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInPage />
    </Suspense>
  );
}
