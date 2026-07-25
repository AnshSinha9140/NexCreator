"use client";

import React from "react";
import { useOnboarding } from "@/context/OnboardingContext";

interface StepNavigationProps {
  onNextClick?: () => void;
  nextButtonText?: string;
  isNextDisabled?: boolean;
  onExitClick: () => void;
}

export const StepNavigation: React.FC<StepNavigationProps> = ({
  onNextClick,
  nextButtonText,
  isNextDisabled = false,
  onExitClick,
}) => {
  const { state, currentStep, totalSteps, goToNextStep, goToPrevStep } = useOnboarding();

  const isFirstStep = state.currentStepIndex === 0;
  const isLastStep = state.currentStepIndex === totalSteps - 1;
  const isValid = state.isStepValid[state.currentStepIndex];

  const handleNext = () => {
    if (onNextClick) {
      onNextClick();
    } else {
      goToNextStep();
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: "36px",
        paddingTop: "24px",
        borderTop: "1px solid rgba(255, 255, 255, 0.07)",
      }}
    >
      {/* Back Button / Exit Confirmation Trigger */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {!isFirstStep && (
          <button
            type="button"
            onClick={goToPrevStep}
            className="btn btn-secondary"
            style={{
              padding: "10px 18px",
              fontSize: "13px",
            }}
          >
            ← Back
          </button>
        )}

        <button
          type="button"
          onClick={onExitClick}
          style={{
            background: "none",
            border: "none",
            color: "#64748b",
            fontSize: "12px",
            cursor: "pointer",
            padding: "8px 12px",
            transition: "color 0.15s ease",
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#f43f5e")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = "#64748b")}
        >
          Exit Setup
        </button>
      </div>

      {/* Right Controls: Skip + Next */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        {currentStep.isSkippable && !isLastStep && (
          <button
            type="button"
            onClick={goToNextStep}
            style={{
              background: "none",
              border: "none",
              color: "#94a3b8",
              fontSize: "13px",
              fontWeight: "600",
              cursor: "pointer",
              padding: "10px 16px",
            }}
          >
            Skip for now
          </button>
        )}

        <button
          type="button"
          onClick={handleNext}
          disabled={!isValid || isNextDisabled}
          className="btn btn-primary"
          style={{
            padding: "12px 24px",
            fontSize: "13px",
            fontWeight: "700",
            opacity: !isValid || isNextDisabled ? 0.5 : 1,
            cursor: !isValid || isNextDisabled ? "not-allowed" : "pointer",
          }}
        >
          {nextButtonText ? nextButtonText : isLastStep ? "Complete Setup 🚀" : "Continue →"}
        </button>
      </div>
    </div>
  );
};
