"use client";

import React from "react";
import { motion } from "framer-motion";
import { useOnboarding } from "@/context/OnboardingContext";

const GOAL_OPTIONS = [
  { id: "1000 Concurrent Viewers", icon: "📈", title: "1000 Concurrent Viewers", desc: "Build a thriving live audience." },
  { id: "Full-Time Creator", icon: "💼", title: "Full-Time Creator", desc: "Turn live broadcasts into your primary career." },
  { id: "Better Community", icon: "💬", title: "Better Community", desc: "Cultivate India's or your region's strongest chat community." },
  { id: "Consistent Uploads", icon: "🎬", title: "Consistent Short-Form Clips", desc: "Turn peak moments into daily TikTok/Shorts content." },
  { id: "Brand Deals", icon: "🤝", title: "Brand Partnerships", desc: "Attract premium sponsor opportunities." },
  { id: "Personal Growth", icon: "🌟", title: "Personal Growth", desc: "Become a more confident, engaging presenter." },
];

export const GoalsStep: React.FC = () => {
  const { state, updateGoals } = useOnboarding();
  const selectedGoals = state.goals.goals;

  const toggleGoal = (id: string) => {
    const exists = selectedGoals.includes(id);
    const updated = exists
      ? selectedGoals.filter((g) => g !== id)
      : [...selectedGoals, id];
    updateGoals({ goals: updated });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={{ display: "flex", flexDirection: "column", gap: "16px", fontFamily: "'Inter', sans-serif" }}
    >
      <div style={{ fontSize: "14px", fontWeight: "700", color: "#f8fafc" }}>
        If we talked one year from now... What would make you proud?
      </div>
      <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>
        Different goals need different advice. Select all that matter to you:
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
        {GOAL_OPTIONS.map((g) => {
          const isSelected = selectedGoals.includes(g.id);

          return (
            <div
              key={g.id}
              onClick={() => toggleGoal(g.id)}
              style={{
                padding: "16px",
                borderRadius: "14px",
                border: isSelected
                  ? "1px solid rgba(168, 85, 247, 0.4)"
                  : "1px solid rgba(255, 255, 255, 0.07)",
                background: isSelected
                  ? "rgba(168, 85, 247, 0.12)"
                  : "rgba(255, 255, 255, 0.02)",
                cursor: "pointer",
                transition: "all 0.15s ease",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "20px" }}>{g.icon}</span>
                <div
                  style={{
                    width: "18px",
                    height: "18px",
                    borderRadius: "4px",
                    border: isSelected ? "1px solid #a855f7" : "1px solid rgba(255, 255, 255, 0.2)",
                    background: isSelected ? "#a855f7" : "transparent",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: "bold",
                  }}
                >
                  {isSelected && "✓"}
                </div>
              </div>

              <div style={{ fontSize: "13px", fontWeight: "700", color: isSelected ? "#c084fc" : "#f8fafc" }}>
                {g.title}
              </div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>{g.desc}</div>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};
