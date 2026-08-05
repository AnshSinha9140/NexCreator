"use client";

import React from "react";
import { AIDecisionLogItem } from "@/lib/ai/executiveTypes";

interface DecisionLogProps {
  logs?: AIDecisionLogItem[];
}

export const DecisionLog: React.FC<DecisionLogProps> = ({ logs }) => {
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
        background: "rgba(13, 16, 27, 0.85)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>📜</span>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#f8fafc" }}>
            AI Decision Log
          </h3>
        </div>
        <span style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>
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
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.04)",
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
                      ? "rgba(52, 211, 153, 0.15)"
                      : item.action === "Recommended"
                      ? "rgba(168, 85, 247, 0.15)"
                      : "rgba(251, 113, 133, 0.15)",
                  color:
                    item.action === "Generated"
                      ? "#34d399"
                      : item.action === "Recommended"
                      ? "#c084fc"
                      : "#fb7185",
                }}
              >
                {item.action.toUpperCase()}
              </span>
              <strong style={{ color: "#f8fafc" }}>{item.item}</strong>
            </div>

            <span style={{ color: "#94a3b8", fontSize: "11px" }}>{item.reason}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
