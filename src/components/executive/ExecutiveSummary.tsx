"use client";

import React from "react";
import { ExecutiveSummaryData } from "@/lib/ai/executiveTypes";

interface ExecutiveSummaryProps {
  data: ExecutiveSummaryData;
}

export const ExecutiveSummary: React.FC<ExecutiveSummaryProps> = ({ data }) => {
  return (
    <section
      style={{
        padding: "36px 40px",
        borderRadius: "20px",
        background: "linear-gradient(135deg, rgba(168, 85, 247, 0.06) 0%, rgba(11, 13, 22, 0.8) 100%)",
        border: "1px solid rgba(168, 85, 247, 0.2)",
        backdropFilter: "blur(16px)",
      }}
    >
      {/* Section Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "12px",
            background: "rgba(168, 85, 247, 0.15)",
            border: "1px solid rgba(168, 85, 247, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
          }}
        >
          📝
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#f8fafc" }}>
            Executive Summary
          </h2>
          <span style={{ fontSize: "11px", color: "#64748b", fontFamily: "'JetBrains Mono', monospace" }}>
            AI-generated producer briefing
          </span>
        </div>
        {/* Confidence badge */}
        <div style={{ marginLeft: "auto" }}>
          <span
            style={{
              padding: "4px 12px",
              borderRadius: "8px",
              fontSize: "11px",
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              color: "#34d399",
            }}
          >
            🎯 {data.confidence}% Confidence
          </span>
        </div>
      </div>

      {/* Narrative Text */}
      <div
        style={{
          fontSize: "15px",
          lineHeight: 1.8,
          color: "#e2e8f0",
          fontFamily: "'Inter', -apple-system, sans-serif",
          fontWeight: 400,
          letterSpacing: "0.01em",
          whiteSpace: "pre-wrap",
        }}
      >
        {data.narrative}
      </div>
    </section>
  );
};
