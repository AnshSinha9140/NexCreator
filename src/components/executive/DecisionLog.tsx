"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { AIDecisionLogItem } from "@/lib/ai/executiveTypes";

interface DecisionLogProps {
  logs?: AIDecisionLogItem[];
}

export const DecisionLog: React.FC<DecisionLogProps> = ({ logs }) => {
  const { theme } = useApp();
  const isDark = theme === "dark";

  const items = logs || [
    { id: "d-1", action: "Generated", item: "3 Highlight Clips", reason: "Replay and engagement score met the 85+ threshold." },
    { id: "d-2", action: "Rejected", item: "11 Candidate Moments", reason: "Replay score below threshold or chat velocity muted." },
    { id: "d-3", action: "Recommended", item: "YouTube Shorts / TikTok", reason: "Highest emotional spike recorded in 90-second conversational banter window." },
    { id: "d-4", action: "Rejected", item: "Long-form Upload", reason: "Insufficient narrative structure across gameplay segment." },
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
          <span style={{ fontSize: "18px" }}>📜</span>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a" }}>
            AI Decision Log
          </h3>
        </div>
        <span style={{ fontSize: "11px", color: isDark ? "#64748b" : "#64748b", fontFamily: "monospace" }}>
          Transparent System Audit
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              padding: "10px 14px",
              borderRadius: "10px",
              background: isDark ? "rgba(255, 255, 255, 0.02)" : "#f8fafc",
              border: isDark ? "1px solid rgba(255, 255, 255, 0.04)" : "1px solid #e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "12px",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: "800",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontFamily: "monospace",
                  background:
                    item.action === "Generated"
                      ? (isDark ? "rgba(52, 211, 153, 0.15)" : "rgba(16, 185, 129, 0.1)")
                      : item.action === "Recommended"
                      ? (isDark ? "rgba(168, 85, 247, 0.15)" : "rgba(168, 85, 247, 0.1)")
                      : (isDark ? "rgba(251, 113, 133, 0.15)" : "rgba(225, 29, 72, 0.1)"),
                  color:
                    item.action === "Generated"
                      ? (isDark ? "#34d399" : "#059669")
                      : item.action === "Recommended"
                      ? (isDark ? "#c084fc" : "#9333ea")
                      : (isDark ? "#fb7185" : "#e11d48"),
                }}
              >
                {item.action.toUpperCase()}
              </span>
              <strong style={{ color: isDark ? "#f8fafc" : "#0f172a" }}>{item.item}</strong>
            </div>

            <span style={{ color: isDark ? "#94a3b8" : "#64748b", fontSize: "11px" }}>{item.reason}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
