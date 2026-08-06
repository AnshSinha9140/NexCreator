"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { DNAChangeItem } from "@/lib/ai/executiveTypes";

interface CreatorDNAChangesProps {
  dnaChanges?: DNAChangeItem[];
}

export const CreatorDNAChanges: React.FC<CreatorDNAChangesProps> = ({ dnaChanges }) => {
  const { theme } = useApp();
  const isDark = theme === "dark";

  const items = dnaChanges || [
    { attribute: "Humor / Comedy", previousValue: 72, newValue: 81, reason: "Laughter density in chat doubled during unscripted banter." },
    { attribute: "Competitive Gameplay", previousValue: 64, newValue: 58, reason: "Audience retention dropped -6% during silent combat." },
    { attribute: "Educator / Setup", previousValue: 41, newValue: 52, reason: "18 questions collected during hardware Q&A segment." },
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
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "18px" }}>🧬</span>
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a" }}>
          Creator DNA Updates
        </h3>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {items.map((item, idx) => (
          <div
            key={idx}
            style={{
              padding: "14px 16px",
              borderRadius: "12px",
              background: isDark ? "rgba(255, 255, 255, 0.02)" : "#f8fafc",
              border: isDark ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: isDark ? "#f8fafc" : "#0f172a" }}>{item.attribute}</div>
              <div style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#64748b", marginTop: "2px" }}>{item.reason}</div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "monospace" }}>
              <span style={{ fontSize: "13px", color: isDark ? "#64748b" : "#64748b" }}>{item.previousValue}</span>
              <span style={{ color: isDark ? "#a855f7" : "#9333ea" }}>→</span>
              <strong style={{ fontSize: "16px", color: item.newValue > item.previousValue ? (isDark ? "#34d399" : "#059669") : (isDark ? "#fb7185" : "#e11d48") }}>
                {item.newValue}
              </strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
