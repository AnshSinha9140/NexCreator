"use client";

import React from "react";
import { CreatorEvolutionItem } from "@/lib/ai/executiveTypes";

interface CreatorEvolutionProps {
  evolution?: CreatorEvolutionItem[];
}

export const CreatorEvolution: React.FC<CreatorEvolutionProps> = ({ evolution }) => {
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
          <span style={{ fontSize: "18px" }}>📈</span>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#f8fafc" }}>
            Creator Evolution
          </h3>
        </div>
        <span style={{ fontSize: "11px", color: "#94a3b8", fontFamily: "monospace" }}>
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
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            <span style={{ fontSize: "11px", color: "#94a3b8" }}>{item.metric}</span>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "16px" }}>{item.direction === "up" ? "↑" : "↓"}</span>
              <strong
                style={{
                  fontSize: "18px",
                  fontWeight: "900",
                  color: item.isPositive ? "#34d399" : "#fb7185",
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
