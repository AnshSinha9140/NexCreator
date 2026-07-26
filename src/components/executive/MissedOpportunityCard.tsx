"use client";

import React, { useState } from "react";
import { MissedOpportunityItem } from "@/lib/ai/executiveTypes";

interface MissedOpportunityCardProps {
  items: MissedOpportunityItem[];
}

export const MissedOpportunityCard: React.FC<MissedOpportunityCardProps> = ({ items }) => {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (!items || items.length === 0) return null;

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
            background: "rgba(245, 158, 11, 0.12)",
            border: "1px solid rgba(245, 158, 11, 0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "18px",
          }}
        >
          ⚠️
        </div>
        <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#f8fafc" }}>
          Missed Opportunities
        </h2>
        <span style={{ marginLeft: "auto", fontSize: "12px", color: "#64748b" }}>
          {items.length} identified
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {items.map((item) => {
          const isOpen = expanded === item.id;
          return (
            <div
              key={item.id}
              style={{
                borderRadius: "14px",
                background: "rgba(245,158,11,0.04)",
                border: "1px solid rgba(245,158,11,0.15)",
                overflow: "hidden",
              }}
            >
              {/* Header */}
              <button
                onClick={() => setExpanded(isOpen ? null : item.id)}
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "16px" }}>🔸</span>
                  <div>
                    <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#f1f5f9" }}>
                      {item.title}
                    </h4>
                    {item.timestamp && (
                      <span style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>
                        {item.timestamp}
                      </span>
                    )}
                  </div>
                </div>
                <span style={{ color: "#64748b", fontSize: "14px" }}>{isOpen ? "▲" : "▼"}</span>
              </button>

              {/* Expanded content */}
              {isOpen && (
                <div style={{ padding: "0 20px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "12px" }}>
                    <span style={{ fontSize: "10px", fontWeight: 800, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'JetBrains Mono', monospace" }}>
                      What Happened
                    </span>
                    <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#94a3b8", lineHeight: 1.5 }}>{item.whatHappened}</p>
                  </div>
                  <div>
                    <span style={{ fontSize: "10px", fontWeight: 800, color: "#f43f5e", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'JetBrains Mono', monospace" }}>
                      Why It Matters
                    </span>
                    <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#94a3b8", lineHeight: 1.5 }}>{item.whyItMatters}</p>
                  </div>
                  <div
                    style={{
                      padding: "12px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, rgba(168,85,247,0.08) 0%, rgba(99,102,241,0.05) 100%)",
                      border: "1px solid rgba(168,85,247,0.2)",
                    }}
                  >
                    <span style={{ fontSize: "10px", fontWeight: 800, color: "#c084fc", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'JetBrains Mono', monospace" }}>
                      Recommendation
                    </span>
                    <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#e2e8f0", fontWeight: 600, lineHeight: 1.5 }}>{item.recommendation}</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
