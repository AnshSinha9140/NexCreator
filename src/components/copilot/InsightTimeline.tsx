"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { CopilotInsightItem } from "./InsightCard";
import { ConfidenceBadge } from "./ConfidenceBadge";
import { PriorityBadge } from "./PriorityBadge";

interface InsightTimelineProps {
  insights: CopilotInsightItem[];
}

function formatTime(isoString: string): string {
  if (!isoString) return "00:00";
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) {
    return "00:00";
  }
}

export const InsightTimeline: React.FC<InsightTimelineProps> = ({ insights }) => {
  const { theme } = useApp();
  const isDark = theme === "dark";

  if (!insights || insights.length === 0) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center", color: isDark ? "#64748b" : "#64748b", fontSize: "13px" }}>
        No timeline events recorded yet.
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        borderLeft: isDark ? "2px solid rgba(168, 85, 247, 0.2)" : "2px solid rgba(168, 85, 247, 0.35)",
        paddingLeft: "24px",
        marginLeft: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        marginTop: "16px",
      }}
    >
      {insights.map((item) => {
        const isCritical = (item.priority || "").toLowerCase() === "critical";
        const dotBg = isCritical ? "#f43f5e" : "#a855f7";

        return (
          <div key={item.id} style={{ position: "relative" }}>
            {/* Glowing Node Dot */}
            <div
              style={{
                position: "absolute",
                left: "-31px",
                top: "16px",
                width: "12px",
                height: "12px",
                borderRadius: "50%",
                background: dotBg,
                border: isDark ? "3px solid #0b0d16" : "3px solid #ffffff",
                boxShadow: `0 0 10px ${dotBg}80`,
              }}
            />

            {/* Timeline Item Container */}
            <div
              style={{
                padding: "16px 20px",
                borderRadius: "14px",
                background: isDark ? "rgba(11, 13, 22, 0.6)" : "#ffffff",
                border: isDark ? "1px solid rgba(255, 255, 255, 0.06)" : "1px solid #e2e8f0",
                boxShadow: isDark ? "none" : "0 1px 3px rgba(0, 0, 0, 0.05)",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace",
                      color: isDark ? "#c084fc" : "#9333ea",
                    }}
                  >
                    {formatTime(item.timestamp)}
                  </span>
                  <PriorityBadge priority={item.priority} size="sm" />
                </div>

                <ConfidenceBadge confidence={item.confidence} size="sm" />
              </div>

              <div>
                <h5 style={{ margin: "0 0 4px", fontSize: "14px", fontWeight: 700, color: isDark ? "#f1f5f9" : "#0f172a" }}>
                  {item.title}
                </h5>
                <p style={{ margin: 0, fontSize: "12px", color: isDark ? "#94a3b8" : "#475569", lineHeight: 1.4 }}>
                  {item.recommendation || item.summary}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
