"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { RecurringPatternItem } from "@/lib/ai/executiveTypes";

interface RecurringPatternsProps {
  patterns?: RecurringPatternItem[];
}

export const RecurringPatterns: React.FC<RecurringPatternsProps> = ({ patterns }) => {
  const { theme } = useApp();
  const isDark = theme === "dark";

  const items = patterns || [
    { id: "p-1", title: "Strong Opening Energy & Warm Hook", type: "strength", confidence: 94, frequencyStreams: 4 },
    { id: "p-2", title: "High Community Laughter Density During Banter", type: "strength", confidence: 91, frequencyStreams: 5 },
    { id: "p-3", title: "Missed Viewer Questions During Intense Combat", type: "weakness", confidence: 86, frequencyStreams: 3 },
    { id: "p-4", title: "Abrupt Stream Endings Without Clear Wind-Down", type: "weakness", confidence: 78, frequencyStreams: 2 },
  ];

  const strengths = items.filter((i) => i.type === "strength");
  const weaknesses = items.filter((i) => i.type === "weakness");

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
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "18px" }}>🔁</span>
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a" }}>
          Recurring Patterns Across Broadcasts
        </h3>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* Strengths */}
        <div style={{ padding: "16px", borderRadius: "14px", background: isDark ? "rgba(52, 211, 153, 0.05)" : "rgba(16, 185, 129, 0.04)", border: isDark ? "1px solid rgba(52, 211, 153, 0.2)" : "1px solid rgba(16, 185, 129, 0.2)", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ fontSize: "12px", fontWeight: "800", color: isDark ? "#34d399" : "#059669", textTransform: "uppercase" }}>
            ✓ Repeated Strengths
          </div>
          {strengths.map((item) => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: isDark ? "#cbd5e1" : "#334155" }}>
              <span>✓ {item.title}</span>
              <span style={{ fontSize: "10px", color: isDark ? "#34d399" : "#059669", background: isDark ? "rgba(52, 211, 153, 0.15)" : "rgba(16, 185, 129, 0.1)", padding: "2px 6px", borderRadius: "4px", fontFamily: "monospace", fontWeight: "bold" }}>
                {item.confidence}% ({item.frequencyStreams} streams)
              </span>
            </div>
          ))}
        </div>

        {/* Weaknesses */}
        <div style={{ padding: "16px", borderRadius: "14px", background: isDark ? "rgba(251, 113, 133, 0.05)" : "rgba(225, 29, 72, 0.04)", border: isDark ? "1px solid rgba(251, 113, 133, 0.2)" : "1px solid rgba(225, 29, 72, 0.2)", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ fontSize: "12px", fontWeight: "800", color: isDark ? "#fb7185" : "#e11d48", textTransform: "uppercase" }}>
            ⚠️ Repeated Growth Areas
          </div>
          {weaknesses.map((item) => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: isDark ? "#cbd5e1" : "#334155" }}>
              <span>• {item.title}</span>
              <span style={{ fontSize: "10px", color: isDark ? "#fb7185" : "#e11d48", background: isDark ? "rgba(251, 113, 133, 0.15)" : "rgba(225, 29, 72, 0.1)", padding: "2px 6px", borderRadius: "4px", fontFamily: "monospace", fontWeight: "bold" }}>
                {item.confidence}% ({item.frequencyStreams} streams)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
