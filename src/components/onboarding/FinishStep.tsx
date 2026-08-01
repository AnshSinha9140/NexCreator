"use client";

import React from "react";
import { motion } from "framer-motion";
import { useOnboarding } from "@/context/OnboardingContext";

export const FinishStep: React.FC = () => {
  const { state } = useOnboarding();
  const profile = state.creatorProfile;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ display: "flex", flexDirection: "column", gap: "24px", fontFamily: "'Inter', sans-serif" }}
    >
      <div>
        <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#f8fafc", marginBottom: "6px" }}>
          Ready to Work Together, {profile.displayName || "Creator"}!
        </h3>
        <p style={{ fontSize: "14px", color: "#94a3b8" }}>
          Here is what you can expect from me as your AI Creator Manager:
        </p>
      </div>

      {/* Signed Manager Promise Card */}
      <div
        style={{
          padding: "24px",
          borderRadius: "18px",
          background: "linear-gradient(135deg, rgba(147, 51, 234, 0.12) 0%, rgba(59, 130, 246, 0.12) 100%)",
          border: "1px solid rgba(147, 51, 234, 0.3)",
          textAlign: "left",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ fontSize: "12px", fontWeight: "800", color: "#c084fc", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          🤝 My Promise
        </div>

        <div style={{ fontSize: "14px", color: "#e2e8f0", lineHeight: "1.7", display: "flex", flexDirection: "column", gap: "8px" }}>
          <p style={{ margin: 0 }}>
            I won't always tell you what you want to hear — I'll tell you what I genuinely believe will help you grow.
          </p>
          <p style={{ margin: 0 }}>
            I'll celebrate progress. I'll explain my reasoning. I'll admit when I'm uncertain.
          </p>
          <p style={{ margin: 0 }}>
            And I'll always remember where you're trying to go.
          </p>
        </div>

        <div style={{ marginTop: "8px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "12px", fontSize: "13px", color: "#93c5fd", fontWeight: "700", textAlign: "right" }}>
          — Your AI Creator Manager
        </div>
      </div>
    </motion.div>
  );
};
