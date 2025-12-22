import { SignInPage } from "@/components/ui/sign-in-flow";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInPage />
    </Suspense>
  );
}
