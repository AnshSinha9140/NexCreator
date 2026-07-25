"use client";

import { OnboardingProvider } from "@/context/OnboardingContext";
import { OnboardingLayout } from "@/components/onboarding/OnboardingLayout";

export default function OnboardingPage() {
  return (
    <OnboardingProvider>
      <OnboardingLayout />
    </OnboardingProvider>
  );
}
