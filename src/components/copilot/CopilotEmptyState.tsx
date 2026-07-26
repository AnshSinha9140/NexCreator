"use client";

import React from "react";

interface CopilotEmptyStateProps {
  type: "no_monitoring" | "no_recommendations";
  onStartMonitoring?: () => void;
}

export const CopilotEmptyState: React.FC<CopilotEmptyStateProps> = ({ type, onStartMonitoring }) => {
  if (type === "no_monitoring") {
    return (
      <div
        style={{
          padding: "64px 32px",
          textAlign: "center",
          background: "rgba(11, 13, 22, 0.6)",
          borderRadius: "20px",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          backdropFilter: "blur(16px)",
          maxWidth: "520px",
          margin: "40px auto",
        }}
      >
        <div
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "18px",
            background: "rgba(168, 85, 247, 0.12)",
            border: "1px solid rgba(168, 85, 247, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "26px",
            margin: "0 auto 20px",
          }}
        >
          🤖
        </div>
        <h3 style={{ margin: "0 0 10px", fontSize: "18px", fontWeight: 700, color: "#f1f5f9" }}>
          AI Producer Standby
        </h3>
        <p style={{ margin: "0 0 24px", fontSize: "13px", color: "#94a3b8", lineHeight: 1.5 }}>
          Start monitoring to activate your AI Producer. Your copilot will continuously observe pulse snapshots and surface timely, high-confidence recommendations.
        </p>
        {onStartMonitoring && (
          <button
            onClick={onStartMonitoring}
            style={{
              padding: "12px 24px",
              borderRadius: "12px",
              background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
              color: "#fff",
              fontWeight: 700,
              fontSize: "13px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(168, 85, 247, 0.35)",
            }}
          >
            Start Stream Monitoring
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "64px 32px",
        textAlign: "center",
        background: "rgba(11, 13, 22, 0.6)",
        borderRadius: "20px",
        border: "1px solid rgba(255, 255, 255, 0.06)",
        backdropFilter: "blur(16px)",
        maxWidth: "520px",
        margin: "40px auto",
      }}
    >
      <div
        style={{
          width: "60px",
          height: "60px",
          borderRadius: "18px",
          background: "rgba(16, 185, 129, 0.12)",
          border: "1px solid rgba(16, 185, 129, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "26px",
          margin: "0 auto 20px",
        }}
      >
        ✨
      </div>
      <h3 style={{ margin: "0 0 10px", fontSize: "18px", fontWeight: 700, color: "#f1f5f9" }}>
        Everything Looks Healthy
      </h3>
      <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8", lineHeight: 1.5 }}>
        We'll notify you when your AI Producer detects something important. Your stream telemetry, chat velocity, and viewer retention are running smoothly.
      </p>
    </div>
  );
};
