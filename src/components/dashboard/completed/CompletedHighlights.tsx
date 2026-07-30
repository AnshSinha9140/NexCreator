"use client";

import React from "react";
import { FinalSessionSummary } from "@/lib/session/lifecycle";

interface CompletedHighlightsProps {
  highlights?: any[];
  session?: any;
  summary?: FinalSessionSummary | null;
}

export const CompletedHighlights: React.FC<CompletedHighlightsProps> = ({
  highlights = [],
  session,
  summary,
}) => {
  const highlightsValid = summary?.integrityFlags?.highlightsValid ?? (session?.integrityFlags?.highlightsValid || false);

  if (!highlightsValid || highlights.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          padding: "48px 24px",
          borderRadius: "16px",
          background: "rgba(13, 16, 27, 0.85)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          textAlign: "center",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>🌟</div>
        <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: "800", color: "#f8fafc" }}>
          No Highlight Artifacts Found
        </h3>
        <p style={{ fontSize: "14px", color: "#94a3b8", maxWidth: "480px", margin: "0 auto" }}>
          Either no qualifying peak moments occurred during this broadcast window or highlight artifact persistence did not trigger.
        </p>
      </div>
    );
  }


  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          padding: "20px 24px",
          borderRadius: "16px",
          background: "rgba(13, 16, 27, 0.85)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span style={{ fontSize: "16px" }}>🚀</span>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#fde047", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "monospace" }}>
              Broadcast Highlight Candidates
            </span>
          </div>
          <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#f8fafc" }}>
            Auto-Detected Viral Spikes & Shorts Candidates
          </h2>
        </div>

        <div style={{ fontSize: "12px", color: "#64748b", fontFamily: "monospace" }}>
          {highlights.length} Highlights Identified
        </div>
      </div>

      {/* Candidate Cards Grid */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {highlights.map((item, idx) => (
          <div
            key={item.id || item._id || idx}
            style={{
              padding: "20px",
              borderRadius: "16px",
              background: "rgba(13, 16, 27, 0.85)",
              border: "1px solid rgba(253, 224, 71, 0.2)",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#fde047", fontFamily: "monospace" }}>
                    ⏱️ {item.timestamp || item.formattedTimestamp || "Peak"}
                  </span>
                  <span style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "6px", background: "rgba(253, 224, 71, 0.12)", color: "#fde047", fontWeight: "700" }}>
                    Score: {item.score || item.hypeScore || 85}/100
                  </span>
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                    • Confidence: {item.confidence || "High"}
                  </span>
                </div>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#f8fafc" }}>
                  {item.suggestedTitle || item.title || "Viral Clip Moment"}
                </h3>
              </div>

              {/* Create Clip Button (Disabled) */}
              <button
                disabled
                style={{
                  padding: "8px 14px",
                  borderRadius: "10px",
                  background: "rgba(255, 255, 255, 0.04)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "#64748b",
                  fontSize: "12px",
                  fontWeight: "700",
                  cursor: "not-allowed",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                🎬 Create Clip
                <span style={{ fontSize: "8px", padding: "2px 5px", borderRadius: "4px", background: "rgba(255,255,255,0.06)", color: "#94a3b8" }}>
                  Coming Soon
                </span>
              </button>
            </div>

            <div style={{ fontSize: "13px", color: "#cbd5e1" }}>
              <strong style={{ color: "#94a3b8" }}>Trigger:</strong> {item.trigger || item.triggerType || "Audience Momentum Spike"}
              <br />
              <strong style={{ color: "#94a3b8" }}>Reason:</strong> {item.reason || item.triggerReason || "High concentration of chat activity."}
            </div>

            {item.sampleMessages && item.sampleMessages.length > 0 && (
              <div style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.04)" }}>
                <div style={{ fontSize: "10px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: "4px" }}>
                  Sample Messages During Peak
                </div>
                <div style={{ fontSize: "12px", color: "#f8fafc", fontFamily: "monospace" }}>
                  {Array.isArray(item.sampleMessages) ? item.sampleMessages.join(" • ") : item.sampleMessages}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
