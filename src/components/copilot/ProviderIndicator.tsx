"use client";

import React from "react";

interface ProviderIndicatorProps {
  provider?: string;
  model?: string;
  lastUpdatedSecondsAgo?: number;
  latencyMs?: number;
  fallbackUsed?: boolean;
}

export const ProviderIndicator: React.FC<ProviderIndicatorProps> = ({
  provider = "Gemini",
  model = "Gemini 2.5 Flash",
  lastUpdatedSecondsAgo = 8,
  latencyMs = 240,
  fallbackUsed = false,
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "6px 14px",
        borderRadius: "10px",
        background: "rgba(6, 8, 16, 0.7)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        fontSize: "11px",
        fontFamily: "'JetBrains Mono', monospace",
        color: "#94a3b8",
      }}
    >
      {/* Pulse Dot */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: fallbackUsed ? "#f59e0b" : "#10b981",
            boxShadow: fallbackUsed ? "0 0 8px #f59e0b" : "0 0 8px #10b981",
            display: "inline-block",
          }}
        />
        <strong style={{ color: "#f1f5f9", fontWeight: 700 }}>
          {fallbackUsed ? "Groq (Fallback)" : model}
        </strong>
      </div>

      <span>•</span>

      <span>Updated {lastUpdatedSecondsAgo}s ago</span>

      <span>•</span>

      <span style={{ color: "#c084fc" }}>{latencyMs}ms</span>
    </div>
  );
};
