"use client";

import React from "react";
import { BestMomentItem } from "@/lib/ai/executiveTypes";

interface BestMomentsProps {
  moments: BestMomentItem[];
}

export const BestMoments: React.FC<BestMomentsProps> = ({ moments }) => {
  if (!moments || moments.length === 0) return null;

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
            background: "rgba(245,158,11,0.12)",
            border: "1px solid rgba(245,158,11,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
          }}
        >
          🔥
        </div>
        <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#f8fafc" }}>
          Best Moments
        </h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {moments.map((moment, idx) => (
          <div
            key={moment.id}
            style={{
              padding: "20px",
              borderRadius: "14px",
              background: idx === 0 ? "rgba(245,158,11,0.07)" : "rgba(255,255,255,0.03)",
              border: idx === 0 ? "1px solid rgba(245,158,11,0.25)" : "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              gap: "16px",
              alignItems: "flex-start",
            }}
          >
            {/* Rank */}
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: idx === 0 ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.04)",
                border: idx === 0 ? "1px solid rgba(245,158,11,0.4)" : "1px solid rgba(255,255,255,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: idx === 0 ? "18px" : "14px",
                fontWeight: 900,
                color: idx === 0 ? "#fbbf24" : "#64748b",
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {idx === 0 ? "🔥" : `#${idx + 1}`}
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#f1f5f9" }}>
                  {moment.title}
                </h4>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#a855f7" }}>
                    {moment.timestamp}
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
                    {moment.confidence}%
                  </span>
                </div>
              </div>

              {/* Pillar Alignment Badge */}
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#fbbf24",
                  background: "rgba(245,158,11,0.12)",
                  padding: "4px 10px",
                  borderRadius: "8px",
                  alignSelf: "flex-start",
                }}
              >
                🔥 This moment reflects your strongest content pillar.
              </div>

              <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8", lineHeight: 1.4 }}>{moment.reason}</p>

              {moment.supportingMetrics.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {moment.supportingMetrics.map((metric, i) => (
                    <span
                      key={i}
                      style={{
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontFamily: "'JetBrains Mono', monospace",
                        background: "rgba(99,102,241,0.1)",
                        border: "1px solid rgba(99,102,241,0.2)",
                        color: "#818cf8",
                      }}
                    >
                      {metric}
                    </span>
                  ))}
                </div>
              )}

              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: "8px",
                  background: "linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(99,102,241,0.05) 100%)",
                  border: "1px solid rgba(168,85,247,0.2)",
                  fontSize: "12px",
                  color: "#e2e8f0",
                  fontWeight: 600,
                }}
              >
                💡 {moment.recommendation}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
