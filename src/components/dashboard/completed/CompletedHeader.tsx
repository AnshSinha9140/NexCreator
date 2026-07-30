"use client";

import React from "react";

interface CompletedHeaderProps {
  platformDisplayName?: string;
  streamTitle?: string;
  durationMinutes?: number;
  completedAt?: string;
}

export const CompletedHeader: React.FC<CompletedHeaderProps> = ({
  platformDisplayName = "Live Broadcast",
  streamTitle,
  durationMinutes = 0,
  completedAt,
}) => {
  const formattedTime = completedAt
    ? new Date(completedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "Just now";

  const formattedDate = completedAt
    ? new Date(completedAt).toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" })
    : new Date().toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });

  return (
    <div
      style={{
        width: "100%",
        padding: "20px 24px",
        borderRadius: "16px",
        background: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "24px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        <div
          style={{
            width: "44px",
            height: "44px",
            borderRadius: "12px",
            background: "rgba(52, 211, 153, 0.1)",
            border: "1px solid rgba(52, 211, 153, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "20px",
          }}
        >
          📊
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: "800",
                color: "#34d399",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontFamily: "monospace",
              }}
            >
              Broadcast Report
            </span>
            <span style={{ fontSize: "12px", color: "#64748b" }}>•</span>
            <span
              style={{
                padding: "2px 8px",
                borderRadius: "6px",
                fontSize: "11px",
                fontWeight: "700",
                background: "rgba(255, 255, 255, 0.06)",
                color: "#cbd5e1",
              }}
            >
              {platformDisplayName}
            </span>
            <span style={{ fontSize: "12px", color: "#64748b" }}>•</span>
            <span style={{ fontSize: "12px", color: "#34d399", fontWeight: "600" }}>
              ✓ Completed Successfully
            </span>
          </div>
          <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "800", color: "#f8fafc" }}>
            {streamTitle || `${platformDisplayName} Stream Report`}
          </h1>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "20px", textAlign: "right" }}>
        <div>
          <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>
            Duration
          </div>
          <div style={{ fontSize: "14px", fontWeight: "700", color: "#f8fafc", fontFamily: "monospace" }}>
            {durationMinutes} mins
          </div>
        </div>

        <div style={{ width: "1px", height: "28px", background: "rgba(255, 255, 255, 0.08)" }} />

        <div>
          <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700" }}>
            Completed Date
          </div>
          <div style={{ fontSize: "13px", fontWeight: "600", color: "#cbd5e1" }}>
            {formattedDate} at {formattedTime}
          </div>
        </div>
      </div>
    </div>
  );
};
