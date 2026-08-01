"use client";

import React from "react";
import { motion } from "framer-motion";
import { useOnboarding, ONBOARDING_STEPS } from "@/context/OnboardingContext";

export const ProgressBar: React.FC = () => {
  const { state, progressPercentage, goToStep } = useOnboarding();

  return (
    <div style={{ width: "100%", marginBottom: "32px" }}>
      {/* Top narrative indicator */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "12px",
          fontFamily: "'Inter', sans-serif",
          fontSize: "12px",
          color: "#94a3b8",
        }}
      >
        <span style={{ fontWeight: "700", color: "#c084fc", letterSpacing: "0.02em" }}>
          {ONBOARDING_STEPS[state.currentStepIndex]?.title}
        </span>
        <span style={{ color: "#64748b", fontSize: "11px" }}>Conversation Progress</span>
      </div>

      {/* Progress Track */}
      <div
        style={{
          width: "100%",
          height: "6px",
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "99px",
          overflow: "hidden",
          position: "relative",
          border: "1px solid rgba(255, 255, 255, 0.06)",
        }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            height: "100%",
            background: "linear-gradient(90deg, #a855f7 0%, #6366f1 100%)",
            borderRadius: "99px",
            boxShadow: "0 0 12px rgba(168, 85, 247, 0.6)",
          }}
        />
      </div>

      {/* Step Dots Navigation */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "16px",
          padding: "0 4px",
        }}
      >
        {ONBOARDING_STEPS.map((step, idx) => {
          const isActive = idx === state.currentStepIndex;
          const isCompleted = idx < state.currentStepIndex;

          return (
            <button
              key={step.id}
              onClick={() => goToStep(idx)}
              title={step.title}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "4px",
              }}
            >
              <div
                style={{
                  width: isActive ? "24px" : "10px",
                  height: "10px",
                  borderRadius: "99px",
                  background: isActive
                    ? "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)"
                    : isCompleted
                    ? "#34d399"
                    : "rgba(255, 255, 255, 0.15)",
                  transition: "all 0.3s ease",
                  boxShadow: isActive ? "0 0 10px rgba(168, 85, 247, 0.5)" : "none",
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};
