"use client";

import React from "react";
import { motion } from "framer-motion";
import { useOnboarding } from "@/context/OnboardingContext";

export const FinishStep: React.FC = () => {
  const { state } = useOnboarding();
  const profile = state.creatorProfile;
  const selectedPlatforms = state.platformSelection.selectedPlatforms;
  const goals = state.goals.goals;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ display: "flex", flexDirection: "column", gap: "24px", textAlign: "center" }}
    >
      {/* Celebration Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        style={{
          width: "72px",
          height: "72px",
          borderRadius: "24px",
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "32px",
          margin: "0 auto",
          boxShadow: "0 12px 32px rgba(16, 185, 129, 0.4)",
        }}
      >
        🚀
      </motion.div>

      <div>
        <h3 style={{ fontSize: "22px", fontWeight: "800", color: "#f8fafc", marginBottom: "6px" }}>
          Setup Complete, {profile.displayName || "Creator"}!
        </h3>
        <p style={{ fontSize: "14px", color: "#94a3b8" }}>
          Your Creator Intelligence Engine is initialized and ready to analyze your streams.
        </p>
      </div>

      {/* Summary Card */}
      <div
        style={{
          padding: "20px",
          borderRadius: "14px",
          background: "rgba(255, 255, 255, 0.02)",
          border: "1px solid rgba(255, 255, 255, 0.07)",
          textAlign: "left",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div style={{ fontSize: "11px", fontWeight: "700", color: "#a855f7", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Quick Configuration Overview
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "13px" }}>
          <div>
            <span style={{ color: "#64748b" }}>Creator Name: </span>
            <span style={{ color: "#f8fafc", fontWeight: "600" }}>{profile.displayName || "Not set"}</span>
          </div>
          <div>
            <span style={{ color: "#64748b" }}>Active Channels: </span>
            <span style={{ color: "#34d399", fontWeight: "600", textTransform: "uppercase" }}>{selectedPlatforms.join(", ") || "None"}</span>
          </div>
          <div style={{ gridColumn: "span 2" }}>
            <span style={{ color: "#64748b" }}>Primary Goals: </span>
            <span style={{ color: "#c084fc", fontWeight: "600" }}>{goals.join(" · ") || "Stream Optimization"}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
