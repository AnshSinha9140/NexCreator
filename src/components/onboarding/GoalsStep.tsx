"use client";

import React from "react";
import { motion } from "framer-motion";
import { useOnboarding } from "@/context/OnboardingContext";

const GOAL_OPTIONS = [
  { id: "Grow Viewers", icon: "📈", title: "Grow Viewers", desc: "Increase peak CCV and audience reach." },
  { id: "Improve Engagement", icon: "💬", title: "Improve Engagement", desc: "Boost active chatters and sentiment index." },
  { id: "Find Viral Clips", icon: "🚀", title: "Find Viral Clips", desc: "Auto-detect high excitement stream moments." },
  { id: "Better Stream Quality", icon: "⚡", title: "Better Stream Quality", desc: "Receive real-time AI producer advice." },
  { id: "Understand Audience", icon: "📊", title: "Understand Audience", desc: "Deep breakdown of chat emotion & retention." },
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
      style={{ display: "flex", flexDirection: "column", gap: "16px" }}
    >
      <div style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "4px" }}>
        Select all goals you want your AI Producer to prioritize:
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
