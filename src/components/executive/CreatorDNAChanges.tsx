"use client";

import React from "react";
import { DNAChangeItem } from "@/lib/ai/executiveTypes";

interface CreatorDNAChangesProps {
  dnaChanges?: DNAChangeItem[];
}

export const CreatorDNAChanges: React.FC<CreatorDNAChangesProps> = ({ dnaChanges }) => {
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
        background: "rgba(13, 16, 27, 0.85)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "18px" }}>🧬</span>
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#f8fafc" }}>
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
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "13px", fontWeight: "700", color: "#f8fafc" }}>{item.attribute}</div>
              <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>{item.reason}</div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontFamily: "monospace" }}>
              <span style={{ fontSize: "13px", color: "#64748b" }}>{item.previousValue}</span>
              <span style={{ color: "#a855f7" }}>→</span>
              <strong style={{ fontSize: "16px", color: item.newValue > item.previousValue ? "#34d399" : "#fb7185" }}>
                {item.newValue}
              </strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
