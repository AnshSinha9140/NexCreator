"use client";

import React from "react";
import { RecurringPatternItem } from "@/lib/ai/executiveTypes";

interface RecurringPatternsProps {
  patterns?: RecurringPatternItem[];
}

export const RecurringPatterns: React.FC<RecurringPatternsProps> = ({ patterns }) => {
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
        background: "rgba(13, 16, 27, 0.85)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "18px" }}>🔁</span>
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#f8fafc" }}>
          Recurring Patterns Across Broadcasts
        </h3>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {/* Strengths */}
        <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(52, 211, 153, 0.05)", border: "1px solid rgba(52, 211, 153, 0.2)", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ fontSize: "12px", fontWeight: "800", color: "#34d399", textTransform: "uppercase" }}>
            ✓ Repeated Strengths
          </div>
          {strengths.map((item) => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "#cbd5e1" }}>
              <span>✓ {item.title}</span>
              <span style={{ fontSize: "10px", color: "#34d399", background: "rgba(52, 211, 153, 0.15)", padding: "2px 6px", borderRadius: "4px", fontFamily: "monospace" }}>
                {item.confidence}% ({item.frequencyStreams} streams)
              </span>
            </div>
          ))}
        </div>

        {/* Weaknesses */}
        <div style={{ padding: "16px", borderRadius: "14px", background: "rgba(251, 113, 133, 0.05)", border: "1px solid rgba(251, 113, 133, 0.2)", display: "flex", flexDirection: "column", gap: "10px" }}>
          <div style={{ fontSize: "12px", fontWeight: "800", color: "#fb7185", textTransform: "uppercase" }}>
            ⚠️ Repeated Growth Areas
          </div>
          {weaknesses.map((item) => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px", color: "#cbd5e1" }}>
              <span>• {item.title}</span>
              <span style={{ fontSize: "10px", color: "#fb7185", background: "rgba(251, 113, 133, 0.15)", padding: "2px 6px", borderRadius: "4px", fontFamily: "monospace" }}>
                {item.confidence}% ({item.frequencyStreams} streams)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
