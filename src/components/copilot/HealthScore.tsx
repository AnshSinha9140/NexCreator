"use client";

import React from "react";

export type StreamHealthLevel = "excellent" | "good" | "needs_attention" | "critical";

interface HealthScoreProps {
  score?: number; // 0 to 100
  level?: StreamHealthLevel;
}

export const HealthScore: React.FC<HealthScoreProps> = ({ score = 92, level }) => {
  const getLevel = (): { name: string; color: string; bg: string; border: string; icon: string } => {
    if (level) {
      if (level === "excellent") return { name: "Excellent", color: "#10b981", bg: "rgba(16, 185, 129, 0.12)", border: "rgba(16, 185, 129, 0.3)", icon: "💚" };
      if (level === "good") return { name: "Good", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.12)", border: "rgba(59, 130, 246, 0.3)", icon: "💙" };
      if (level === "needs_attention") return { name: "Needs Attention", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.12)", border: "rgba(245, 158, 11, 0.3)", icon: "💛" };
      return { name: "Critical", color: "#f43f5e", bg: "rgba(244, 63, 94, 0.12)", border: "rgba(244, 63, 94, 0.3)", icon: "💔" };
    }

    if (score >= 85) return { name: "Excellent", color: "#10b981", bg: "rgba(16, 185, 129, 0.12)", border: "rgba(16, 185, 129, 0.3)", icon: "💚" };
    if (score >= 70) return { name: "Good", color: "#3b82f6", bg: "rgba(59, 130, 246, 0.12)", border: "rgba(59, 130, 246, 0.3)", icon: "💙" };
    if (score >= 50) return { name: "Needs Attention", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.12)", border: "rgba(245, 158, 11, 0.3)", icon: "💛" };
    return { name: "Critical", color: "#f43f5e", bg: "rgba(244, 63, 94, 0.12)", border: "rgba(244, 63, 94, 0.3)", icon: "💔" };
  };

  const status = getLevel();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px 16px",
        borderRadius: "12px",
        background: status.bg,
        border: `1px solid ${status.border}`,
      }}
    >
      <span style={{ fontSize: "16px" }}>{status.icon}</span>
      <div>
        <span
          style={{
            fontSize: "9px",
            fontWeight: 700,
            fontFamily: "'JetBrains Mono', monospace",
            color: "#94a3b8",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            display: "block",
          }}
        >
          OVERALL STREAM HEALTH
        </span>
        <span
          style={{
            fontSize: "13px",
            fontWeight: 800,
            color: status.color,
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          {status.name} ({score}%)
        </span>
      </div>
    </div>
  );
};
