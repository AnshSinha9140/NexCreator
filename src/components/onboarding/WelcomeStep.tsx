"use client";

import React from "react";
import { motion } from "framer-motion";
import { useOnboarding } from "@/context/OnboardingContext";

export const WelcomeStep: React.FC = () => {
  const { goToNextStep } = useOnboarding();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px", fontFamily: "'Inter', sans-serif" }}>
      {/* Conversational Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ display: "flex", flexDirection: "column", gap: "16px" }}
      >
        <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#f8fafc", margin: 0, lineHeight: 1.2 }}>
          Hi.
        </h2>
        <p style={{ fontSize: "16px", color: "#c084fc", fontWeight: "700", margin: 0 }}>
          I'm your AI Creator Manager.
        </p>
        <p style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: "1.7", margin: 0 }}>
          Before I ever recommend a clip, analyze a stream, or suggest changes... I want to understand who you are.
        </p>
        <p style={{ fontSize: "14px", color: "#94a3b8", lineHeight: "1.7", margin: 0 }}>
          Every creator is different. My advice should be too. Over the next minute, I'll learn a little about your content, your goals, and the kind of creator you're becoming. Everything else comes later.
        </p>
      </motion.div>

      {/* Outcome Promises */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          padding: "20px",
          borderRadius: "16px",
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid rgba(255, 255, 255, 0.07)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <span style={{ fontSize: "12px", fontWeight: "800", color: "#f8fafc", textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Here's what you can expect:
        </span>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "#cbd5e1" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#4ade80", fontWeight: "bold" }}>✓</span>
            <span>I'll watch every stream with you.</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#4ade80", fontWeight: "bold" }}>✓</span>
            <span>I'll remember what works.</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#4ade80", fontWeight: "bold" }}>✓</span>
            <span>I'll help you notice what you might miss.</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#4ade80", fontWeight: "bold" }}>✓</span>
            <span>I'll help you improve over time.</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
