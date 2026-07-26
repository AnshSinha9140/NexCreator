"use client";

import React from "react";
import { ClipOpportunityItem } from "@/lib/ai/executiveTypes";

interface ClipOpportunityCardProps {
  clips: ClipOpportunityItem[];
}

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

export const ClipOpportunityCard: React.FC<ClipOpportunityCardProps> = ({ clips }) => {
  if (!clips || clips.length === 0) return null;

  return (
    <section
      style={{
        padding: "32px 36px",
        borderRadius: "20px",
        background: "rgba(11, 13, 22, 0.7)",
        border: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <div
          style={{
            width: "38px",
            height: "38px",
            borderRadius: "12px",
            background: "rgba(236,72,153,0.12)",
            border: "1px solid rgba(236,72,153,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
          }}
        >
          🎬
        </div>
        <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#f8fafc" }}>
          Clip Opportunities
        </h2>
        <span style={{ marginLeft: "auto", fontSize: "12px", color: "#64748b" }}>
          {clips.length} candidates
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
        {clips.map((clip) => (
          <div
            key={clip.id}
            style={{
              padding: "20px",
              borderRadius: "14px",
              background: "rgba(236,72,153,0.05)",
              border: "1px solid rgba(236,72,153,0.18)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px" }}>
              <span style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#a855f7" }}>
                ⏱ {clip.timestamp}
              </span>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>
                  {formatDuration(clip.durationSeconds)}
                </span>
                <span
                  style={{
                    padding: "2px 8px",
                    borderRadius: "6px",
                    fontSize: "10px",
                    fontFamily: "'JetBrains Mono', monospace",
                    fontWeight: 800,
                    background: "rgba(16,185,129,0.1)",
                    border: "1px solid rgba(16,185,129,0.25)",
                    color: "#34d399",
                  }}
                >
                  {clip.confidence}%
                </span>
              </div>
            </div>

            {/* Why */}
            <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8", lineHeight: 1.4 }}>{clip.reason}</p>

            {/* Suggested details */}
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ padding: "8px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: "9px", color: "#64748b", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Suggested Title</div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#f1f5f9" }}>{clip.suggestedTitle}</div>
              </div>
              <div style={{ padding: "8px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: "9px", color: "#64748b", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Hook</div>
                <div style={{ fontSize: "12px", color: "#cbd5e1" }}>{clip.suggestedHook}</div>
              </div>
              <div style={{ padding: "8px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div style={{ fontSize: "9px", color: "#64748b", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "4px" }}>Thumbnail Idea</div>
                <div style={{ fontSize: "12px", color: "#cbd5e1" }}>{clip.suggestedThumbnailIdea}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
