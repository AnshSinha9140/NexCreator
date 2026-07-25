"use client";

import React from "react";
import { motion } from "framer-motion";
import { useOnboarding } from "@/context/OnboardingContext";

export const WelcomeStep: React.FC = () => {
  const { goToNextStep } = useOnboarding();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Visual Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          padding: "24px",
          borderRadius: "16px",
          background: "linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)",
          border: "1px solid rgba(168, 85, 247, 0.2)",
          display: "flex",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "16px",
            background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "24px",
            color: "#fff",
            flexShrink: 0,
            boxShadow: "0 8px 24px rgba(168, 85, 247, 0.4)",
          }}
        >
          ✨
        </div>
        <div>
          <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#f8fafc", marginBottom: "4px" }}>
            Welcome to Your Creator Intelligence Hub
          </h3>
          <p style={{ fontSize: "13px", color: "#94a3b8", lineHeight: 1.5 }}>
            NexCreator analyzes chat sentiment, detects viral clip moments, and generates AI producer guidance during your live streams.
          </p>
        </div>
      </motion.div>

      {/* Feature Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {[
          { icon: "🔴", title: "Live Pulse Engine", desc: "Monitor audience hype index and sentiment velocity." },
          { icon: "🤖", title: "AI Creator Coach", desc: "Instant recommendations to maximize viewer retention." },
          { icon: "🚀", title: "Viral Clip Detector", desc: "Auto-identify high excitement stream highlights." },
          { icon: "💼", title: "Sponsorship CRM", desc: "Track brand deals, payouts, and deliverable schedules." },
        ].map((feat, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 * idx }}
            style={{
              padding: "18px",
              borderRadius: "14px",
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              display: "flex",
              alignItems: "flex-start",
              gap: "14px",
            }}
          >
            <span style={{ fontSize: "20px" }}>{feat.icon}</span>
            <div>
              <div style={{ fontSize: "14px", fontWeight: "700", color: "#e2e8f0", marginBottom: "4px" }}>
                {feat.title}
              </div>
              <div style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.4 }}>
                {feat.desc}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
