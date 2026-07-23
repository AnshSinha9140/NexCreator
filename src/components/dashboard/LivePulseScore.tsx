"use client";

import React from "react";

interface LivePulseScoreProps {
  score?: number;
  isLive?: boolean;
  statusText?: string;
  messagesCount?: number;
}

export const LivePulseScore: React.FC<LivePulseScoreProps> = ({
  score = 92,
  isLive = true,
  statusText = "Top 2% Creator Peak Engagement",
  messagesCount = 0,
}) => {
  const radius = 52;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  const color = score >= 70 ? "#10b981" : score >= 40 ? "#f59e0b" : "#f43f5e";
  const label = score >= 70 ? "EXCELLENT" : score >= 40 ? "STEADY" : "CRITICAL";

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(18,22,40,0.9) 0%, rgba(10,13,24,0.97) 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "18px",
        padding: "28px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "32px",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          right: "-40px",
          top: "-40px",
          width: "220px",
          height: "220px",
          borderRadius: "50%",
          background: color,
          opacity: 0.06,
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      {/* Left: Text Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Badges */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
          <span className="badge badge-ai">
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#c084fc",
                display: "inline-block",
                animation: "ping 1s cubic-bezier(0,0,0.2,1) infinite",
              }}
            />
            AI Engine
          </span>
          {isLive && (
            <span className="badge badge-live">
              <span className="live-pulse-dot" />
              Live Active
            </span>
          )}
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: "26px",
            fontWeight: "800",
            color: "#f1f5f9",
            letterSpacing: "-0.5px",
            lineHeight: 1.15,
            marginBottom: "8px",
          }}
        >
          Stream Live Pulse
        </h2>

        {/* Subtitle */}
        <p style={{ fontSize: "12px", color: "#64748b", lineHeight: 1.5, maxWidth: "360px" }}>
          {statusText}
          {messagesCount > 0 && (
            <>
              {" · "}
              <span style={{ color: "#94a3b8", fontWeight: "600" }}>{messagesCount}</span>
              {" messages buffered"}
            </>
          )}
        </p>

        {/* Micro stats */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          {[
            { label: "Hype Index", value: "96/100", color: "#10b981" },
            { label: "Retention", value: "94.2%", color: "#a855f7" },
            { label: "Safety Shield", value: "SECURE", color: "#10b981" },
          ].map((stat, i) => (
            <React.Fragment key={stat.label}>
              {i > 0 && (
                <div
                  style={{
                    width: "1px",
                    height: "28px",
                    background: "rgba(255,255,255,0.07)",
                  }}
                />
              )}
              <div>
                <div
                  style={{
                    fontSize: "9px",
                    fontWeight: "600",
                    color: "#334155",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontFamily: "'JetBrains Mono', monospace",
                    marginBottom: "3px",
                  }}
                >
                  {stat.label}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: "700",
                    color: stat.color,
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {stat.value}
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Right: Score Gauge */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
          <defs>
            <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={color} />
              <stop offset="100%" stopColor={color === "#10b981" ? "#06b6d4" : color} />
            </linearGradient>
          </defs>
          {/* Track */}
          <circle
            cx="70" cy="70" r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="10"
          />
          {/* Progress */}
          <circle
            cx="70" cy="70" r={radius}
            fill="none"
            stroke="url(#scoreGrad)"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1s ease" }}
          />
        </svg>

        {/* Center label */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            style={{
              fontSize: "34px",
              fontWeight: "900",
              color: "#f1f5f9",
              lineHeight: 1,
              letterSpacing: "-1px",
            }}
          >
            {score}
          </span>
          <span
            style={{
              fontSize: "8px",
              fontWeight: "700",
              color: "#475569",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontFamily: "'JetBrains Mono', monospace",
              marginTop: "4px",
            }}
          >
            {label}
          </span>
        </div>
      </div>
    </div>
  );
};
