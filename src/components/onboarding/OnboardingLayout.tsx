"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useOnboarding } from "@/context/OnboardingContext";
import { ProgressBar } from "./ProgressBar";
import { StepNavigation } from "./StepNavigation";
import { ExitDialog } from "./ExitDialog";
import { WelcomeStep } from "./WelcomeStep";
import { CreatorProfileStep } from "./CreatorProfileStep";
import { PlatformSelectionStep } from "./PlatformSelectionStep";
import { PlatformStep } from "./PlatformStep";
import { GoalsStep } from "./GoalsStep";
import { FinishStep } from "./FinishStep";

export const OnboardingLayout: React.FC = () => {
  const { state, currentStep, resetOnboarding } = useOnboarding();
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFinishOnboarding = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorProfile: state.creatorProfile,
          platformSelection: state.platformSelection,
          connectedPlatforms: state.connectedPlatforms,
          goals: state.goals,
        }),
      });

      const data = await res.json();
      resetOnboarding();
      window.location.href = data.redirectTo || "/dashboard";
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
      window.location.href = "/dashboard";
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmExit = () => {
    setShowExitDialog(false);
    window.location.href = "/dashboard";
  };

  const renderStepComponent = () => {
    switch (state.currentStepIndex) {
      case 0: return <WelcomeStep />;
      case 1: return <CreatorProfileStep />;
      case 2: return <PlatformSelectionStep />;
      case 3: return <PlatformStep />;
      case 4: return <GoalsStep />;
      case 5: return <FinishStep />;
      default: return <WelcomeStep />;
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.08) 0%, transparent 60%), #060810",
        color: "#e2e8f0",
        fontFamily: "'Inter', sans-serif",
        padding: "32px 24px",
      }}
    >
      {/* Centered Onboarding Card Shell */}
      <div
        style={{
          width: "100%",
          maxWidth: "640px",
          background: "linear-gradient(135deg, rgba(18, 22, 40, 0.9) 0%, rgba(10, 13, 24, 0.97) 100%)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255, 255, 255, 0.09)",
          borderRadius: "24px",
          padding: "40px",
          boxShadow: "0 32px 80px rgba(0, 0, 0, 0.7)",
          position: "relative",
        }}
      >
        {/* Progress Bar Header */}
        <ProgressBar />

        {/* Step Header Title & Subtitle */}
        <div style={{ marginBottom: "28px" }}>
          <div
            style={{
              fontSize: "11px",
              fontWeight: "700",
              color: "#a855f7",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontFamily: "'JetBrains Mono', monospace",
              marginBottom: "4px",
            }}
          >
            {currentStep.subtitle}
          </div>
          <div style={{ fontSize: "24px", fontWeight: "800", color: "#f8fafc", letterSpacing: "-0.5px", marginBottom: "6px" }}>
            {currentStep.title}
          </div>
          <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: 1.5 }}>
            {currentStep.description}
          </p>
        </div>

        {/* Animated Step Content Container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={state.currentStepIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            {renderStepComponent()}
          </motion.div>
        </AnimatePresence>

        {/* Step Footer Navigation */}
        <StepNavigation
          onExitClick={() => setShowExitDialog(true)}
          onNextClick={
            state.currentStepIndex === 5
              ? handleFinishOnboarding
              : undefined
          }
          isNextDisabled={isSubmitting}
        />
      </div>

      {/* Exit Modal Confirmation */}
      <ExitDialog
        isOpen={showExitDialog}
        onClose={() => setShowExitDialog(false)}
        onConfirmExit={handleConfirmExit}
      />
    </div>
  );
};
