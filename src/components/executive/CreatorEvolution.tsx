"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { CreatorEvolutionItem } from "@/lib/ai/executiveTypes";

interface CreatorEvolutionProps {
  evolution?: CreatorEvolutionItem[];
}

export const CreatorEvolution: React.FC<CreatorEvolutionProps> = ({ evolution }) => {
  const { theme } = useApp();
  const isDark = theme === "dark";

  const items = evolution || [
    { metric: "Humor Density", change: "+18%", direction: "up", isPositive: true },
    { metric: "Audience Interaction", change: "+9%", direction: "up", isPositive: true },
    { metric: "Pacing Consistency", change: "+12%", direction: "up", isPositive: true },
    { metric: "Facecam Eye Contact", change: "-4%", direction: "down", isPositive: false },
  ];

  return (
    <div
      style={{
        padding: "24px",
        borderRadius: "20px",
        background: isDark ? "rgba(13, 16, 27, 0.85)" : "#ffffff",
        border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
        boxShadow: isDark ? "none" : "0 1px 3px rgba(0, 0, 0, 0.05)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>📈</span>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a" }}>
            Creator Evolution
          </h3>
        </div>
        <span style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#64748b", fontFamily: "monospace" }}>
          Compared to Previous Broadcasts
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
        {items.map((item, idx) => (
          <div
            key={idx}
            style={{
              padding: "14px",
              borderRadius: "12px",
              background: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc",
              border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid #e2e8f0",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <span style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#64748b", fontWeight: "bold" }}>{item.metric}</span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "16px" }}>{item.direction === "up" ? "↑" : "↓"}</span>
              <strong
                style={{
                  fontSize: "18px",
                  fontWeight: "900",
                  color: item.isPositive ? (isDark ? "#34d399" : "#059669") : (isDark ? "#fb7185" : "#e11d48"),
                }}
              >
                {item.change}
              </strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
