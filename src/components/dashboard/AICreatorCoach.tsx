"use client";

import React from "react";

interface Recommendation {
  id: string;
  type: "opportunity" | "warning" | "retention";
  title: string;
  action: string;
  impact: string;
}

const recs: Recommendation[] = [
  { id: "1", type: "opportunity", title: "Hype Peak Active",          action: "Prolong current GTA Heist segment by 15 mins",      impact: "+18% Retention" },
  { id: "2", type: "retention",   title: "Engagement Drop Warning",    action: "Trigger chat Q&A or community giveaway",            impact: "+250 Viewers" },
  { id: "3", type: "opportunity", title: "High Clip Potential (1:12)", action: "Auto-queue 60s Shorts/TikTok edit",                 impact: "Viral Candidate" },
];

const typeMap = {
  opportunity: { color: "#34d399", bg: "rgba(16,185,129,0.08)",  border: "rgba(16,185,129,0.15)",  dot: "rgba(52,211,153,0.3)" },
  warning:     { color: "#fbbf24", bg: "rgba(245,158,11,0.08)",  border: "rgba(245,158,11,0.15)",  dot: "rgba(251,191,36,0.3)" },
  retention:   { color: "#c084fc", bg: "rgba(168,85,247,0.08)",  border: "rgba(168,85,247,0.15)",  dot: "rgba(192,132,252,0.3)" },
};

export const AICreatorCoach: React.FC<{
  progressMessage?: string;
  isAnalyzing?: boolean;
}> = ({
  progressMessage = "Reading chat emotions & detecting viral moments...",
}) => {
  return (
    <div
      style={{
        background: "rgba(13,16,27,0.7)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderLeft: "3px solid #a855f7",
        borderRadius: "14px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
        height: "100%",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "9px",
              background: "rgba(168,85,247,0.12)",
              border: "1px solid rgba(168,85,247,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#c084fc",
            }}
          >
            <svg style={{ width: "15px", height: "15px" }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#e2e8f0" }}>AI Creator Coach</div>
            <div style={{ fontSize: "10px", color: "#475569" }}>Realtime stream guidance</div>
          </div>
        </div>
        <span className="badge badge-ai">
          <span
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: "#c084fc",
              animation: "ping 1s cubic-bezier(0,0,0.2,1) infinite",
              display: "inline-block",
            }}
          />
          ACTIVE
        </span>
      </div>

      {/* Status bar */}
      <div
        style={{
          padding: "10px 12px",
          borderRadius: "9px",
          background: "rgba(168,85,247,0.06)",
          border: "1px solid rgba(168,85,247,0.12)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div
          style={{
            width: "14px",
            height: "14px",
            borderRadius: "50%",
            border: "2px solid #a855f7",
            borderTopColor: "transparent",
            animation: "spin 1s linear infinite",
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: "11px",
            color: "#c084fc",
            fontFamily: "'JetBrains Mono', monospace",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {progressMessage}
        </span>
      </div>

      {/* Recommendations label */}
      <div
        style={{
          fontSize: "9px",
          fontWeight: "700",
          color: "#334155",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        Recommended Actions
      </div>

      {/* Recommendation cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {recs.map((rec) => {
          const meta = typeMap[rec.type];
          return (
            <div
              key={rec.id}
              style={{
                padding: "12px",
                borderRadius: "10px",
                background: meta.bg,
                border: `1px solid ${meta.border}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: "8px",
                  marginBottom: "6px",
                }}
              >
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#e2e8f0" }}>
                  {rec.title}
                </span>
                <span
                  style={{
                    fontSize: "9px",
                    fontWeight: "700",
                    color: meta.color,
                    background: `rgba(0,0,0,0.2)`,
                    padding: "2px 6px",
                    borderRadius: "4px",
                    fontFamily: "'JetBrains Mono', monospace",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {rec.impact}
                </span>
              </div>
              <p style={{ fontSize: "11px", color: "#64748b", marginBottom: "8px" }}>
                👉 {rec.action}
              </p>
              <button
                style={{
                  width: "100%",
                  padding: "7px",
                  borderRadius: "7px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "#64748b",
                  fontSize: "11px",
                  fontWeight: "600",
                  cursor: "pointer",
                  fontFamily: "'JetBrains Mono', monospace",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "#c084fc";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(168,85,247,0.3)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "#64748b";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.08)";
                }}
              >
                Apply Action
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
