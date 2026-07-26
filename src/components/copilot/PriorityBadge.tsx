"use client";

import React from "react";

export type CopilotPriority = "critical" | "high" | "medium" | "low";

interface PriorityBadgeProps {
  priority: CopilotPriority | string;
  size?: "sm" | "md";
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, size = "md" }) => {
  const norm = (priority || "medium").toLowerCase() as CopilotPriority;

  const config: Record<CopilotPriority, { label: string; icon: string; bg: string; border: string; text: string }> = {
    critical: { label: "CRITICAL", icon: "🚨", bg: "rgba(244, 63, 94, 0.15)", border: "rgba(244, 63, 94, 0.35)", text: "#f43f5e" },
    high:     { label: "HIGH",     icon: "🔥", bg: "rgba(245, 158, 11, 0.15)", border: "rgba(245, 158, 11, 0.35)", text: "#fbbf24" },
    medium:   { label: "MEDIUM",   icon: "⚡", bg: "rgba(168, 85, 247, 0.15)", border: "rgba(168, 85, 247, 0.35)", text: "#c084fc" },
    low:      { label: "LOW",      icon: "ℹ️", bg: "rgba(100, 116, 139, 0.15)", border: "rgba(100, 116, 139, 0.35)", text: "#94a3b8" },
  };

  const item = config[norm] || config.medium;
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
        background: item.bg,
        border: `1px solid ${item.border}`,
        color: item.text,
        fontSize,
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 800,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
      }}
    >
      <span>{item.icon}</span>
      <span>{item.label}</span>
    </span>
  );
};
