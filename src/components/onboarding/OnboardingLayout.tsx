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

import { RelationshipPanel } from "./RelationshipPanel";

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
        background: "radial-gradient(circle at 30% 20%, rgba(147, 51, 234, 0.12) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.08) 0%, transparent 50%), #060810",
        color: "#e2e8f0",
        fontFamily: "'Inter', sans-serif",
        padding: "40px 24px",
        boxSizing: "border-box",
      }}
    >
      {/* 2-Column Responsive Workspace */}
      <div
        style={{
          width: "100%",
          maxWidth: "1100px",
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.8fr) minmax(0, 1fr)",
          gap: "36px",
          alignItems: "start",
        }}
      >
        {/* Left Column: 65% Conversation Workspace */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(18, 22, 40, 0.95) 0%, rgba(10, 13, 24, 0.98) 100%)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255, 255, 255, 0.09)",
            borderRadius: "28px",
            padding: "44px",
            boxShadow: "0 32px 80px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            minHeight: "560px",
            justifyContent: "space-between",
          }}
        >
          <div>
            {/* Progress Bar Header */}
            <ProgressBar />

            {/* Step Header Title & Subtitle */}
            <div style={{ marginBottom: "32px" }}>
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: "800",
                  color: "#c084fc",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "8px",
                }}
              >
                {currentStep.subtitle}
              </div>
              <div style={{ fontSize: "32px", fontWeight: "800", color: "#f8fafc", letterSpacing: "-0.8px", marginBottom: "10px", lineHeight: "1.2" }}>
                {currentStep.title}
              </div>
              <p style={{ fontSize: "15px", color: "#94a3b8", lineHeight: "1.6" }}>
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
          </div>

          {/* Step Footer Navigation */}
          <div style={{ marginTop: "36px" }}>
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
        </div>

        {/* Right Column: 35% Permanent Relationship Workspace */}
        <div>
          <RelationshipPanel currentStepIndex={state.currentStepIndex} />
        </div>
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
