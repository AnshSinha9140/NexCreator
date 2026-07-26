"use client";

import React from "react";

interface ConfidenceBadgeProps {
  confidence: number; // 0 to 100 or 0 to 1
  size?: "sm" | "md";
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ confidence, size = "md" }) => {
  // Normalize percentage
  const pct = confidence > 1 ? Math.min(100, Math.round(confidence)) : Math.round(confidence * 100);

  const getStyle = () => {
    if (pct >= 85) return { bg: "rgba(16, 185, 129, 0.12)", border: "rgba(16, 185, 129, 0.3)", text: "#34d399" };
    if (pct >= 65) return { bg: "rgba(245, 158, 11, 0.12)", border: "rgba(245, 158, 11, 0.3)", text: "#fbbf24" };
    return { bg: "rgba(100, 116, 139, 0.12)", border: "rgba(100, 116, 139, 0.3)", text: "#94a3b8" };
  };

  const style = getStyle();
  const padding = size === "sm" ? "2px 6px" : "3px 10px";
  const fontSize = size === "sm" ? "10px" : "11px";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding,
        borderRadius: "6px",
        background: style.bg,
        border: `1px solid ${style.border}`,
        color: style.text,
        fontSize,
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 700,
        letterSpacing: "0.02em",
      }}
    >
      <span style={{ fontSize: "9px" }}>🎯</span>
      <span>{pct}% Confidence</span>
    </span>
  );
};
