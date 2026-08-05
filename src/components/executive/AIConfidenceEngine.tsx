"use client";

import React from "react";
import { AIConfidenceBreakdown } from "@/lib/ai/executiveTypes";

interface AIConfidenceProps {
  confidence?: AIConfidenceBreakdown;
}

export const AIConfidenceEngine: React.FC<AIConfidenceProps> = ({ confidence }) => {
  const scores = confidence || {
    audienceBehaviour: 94,
    contentStyle: 91,
    editingPreferences: 73,
    postingSchedule: 52,
    thumbnailStyle: 39,
  };

  const categories = [
    { label: "Audience Behaviour", score: scores.audienceBehaviour },
    { label: "Content Style & Voice", score: scores.contentStyle },
    { label: "Editing Preferences", score: scores.editingPreferences },
    { label: "Posting Schedule", score: scores.postingSchedule },
    { label: "Thumbnail Style", score: scores.thumbnailStyle },
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>📊</span>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#f8fafc" }}>
            AI Confidence Engine
          </h3>
        </div>
        <span style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>
          Depth of System Knowledge (Not Stream Quality)
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {categories.map((cat, idx) => (
          <div key={idx} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px" }}>
              <span style={{ color: "#cbd5e1" }}>{cat.label}</span>
              <span style={{ fontWeight: "700", color: cat.score > 80 ? "#c084fc" : cat.score > 50 ? "#60a5fa" : "#94a3b8", fontFamily: "monospace" }}>
                {cat.score}%
              </span>
            </div>
            <div style={{ width: "100%", height: "6px", borderRadius: "99px", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div
                style={{
                  width: `${cat.score}%`,
                  height: "100%",
                  borderRadius: "99px",
                  background: cat.score > 80 ? "#c084fc" : cat.score > 50 ? "#60a5fa" : "#64748b",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
