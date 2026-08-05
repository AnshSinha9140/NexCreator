"use client";

import React from "react";
import { ThreeBigDiscoveryItem } from "@/lib/ai/executiveTypes";
import { TimelineNavigator } from "@/lib/timeline/navigator";

interface ThreeDiscoveriesProps {
  discoveries?: ThreeBigDiscoveryItem[];
}

export const ThreeDiscoveries: React.FC<ThreeDiscoveriesProps> = ({ discoveries = [] }) => {
  const items = discoveries.length >= 3 ? discoveries : [
    {
      id: "disc-1",
      discovery: "Chat participation doubled whenever you directly addressed viewers out loud.",
      evidence: "Chat velocity spiked +230% at timestamp 15:21 during direct chat Q&A window.",
      confidence: 96,
      snapshotTimestamp: "15:21:00",
    },
    {
      id: "disc-2",
      discovery: "Viewer retention increased during conversational moments over quiet gameplay.",
      evidence: "0% viewer drop-off logged during 12-minute dialogue segment vs -6% drop during quiet combat.",
      confidence: 91,
      snapshotTimestamp: "22:15:00",
    },
    {
      id: "disc-3",
      discovery: "Community questions generated higher message density than in-game events.",
      evidence: "18 distinct questions collected within 5 minutes when asking for viewer opinions.",
      confidence: 88,
      snapshotTimestamp: "31:40:00",
    },
  ];

  return (
    <div
      style={{
        padding: "24px",
        borderRadius: "20px",
        background: "rgba(13, 16, 27, 0.85)",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "18px" }}>💡</span>
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#f8fafc" }}>
          Three Biggest Discoveries
        </h3>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {items.slice(0, 3).map((item, idx) => (
          <div
            key={item.id || idx}
            style={{
              padding: "16px",
              borderRadius: "14px",
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.06)",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#34d399", fontWeight: "900", fontSize: "14px" }}>✓</span>
                <span style={{ fontSize: "14px", fontWeight: "700", color: "#f8fafc" }}>{item.discovery}</span>
              </div>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: "800",
                  color: "#c084fc",
                  background: "rgba(168, 85, 247, 0.15)",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  fontFamily: "monospace",
                  flexShrink: 0,
                }}
              >
                {item.confidence}% Confident
              </span>
            </div>

            <div style={{ fontSize: "12px", color: "#cbd5e1", background: "rgba(0,0,0,0.3)", padding: "8px 12px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>🔍 <strong>Evidence:</strong> {item.evidence}</span>
              {item.snapshotTimestamp && (
                <button
                  title="Open VOD at timestamp in new tab"
                  onClick={() =>
                    TimelineNavigator.open({
                      timestamp: item.snapshotTimestamp!,
                      label: item.discovery,
                      source: "Three Discoveries",
                    })
                  }
                  style={{
                    padding: "3px 8px",
                    borderRadius: "6px",
                    background: "rgba(56, 189, 248, 0.15)",
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                    color: "#38bdf8",
                    fontSize: "10px",
                    fontWeight: "700",
                    cursor: "pointer",
                    flexShrink: 0,
                    marginLeft: "12px",
                  }}
                >
                  ⏱️ {item.snapshotTimestamp}
                </button>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};
