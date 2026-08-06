"use client";

import React from "react";
import { useApp } from "@/context/AppContext";
import { KnowledgeGraphUpdateItem } from "@/lib/ai/executiveTypes";

interface KnowledgeGraphUpdatesProps {
  updates?: KnowledgeGraphUpdateItem[];
}

export const KnowledgeGraphUpdates: React.FC<KnowledgeGraphUpdatesProps> = ({ updates }) => {
  const { theme } = useApp();
  const isDark = theme === "dark";

  const items = updates || [
    { category: "Audience", memory: "Responds strongly to spontaneous humor and direct Out-Loud Q&A.", confidence: 91 },
    { category: "Creator", memory: "Occasionally ignores viewer questions during high-focus gameplay combat.", confidence: 82 },
    { category: "Publishing", memory: "Conversational Shorts significantly outperform pure gameplay clip edits.", confidence: 87 },
  ];

  return (
    <div
      style={{
        padding: "24px",
        borderRadius: "20px",
        background: isDark ? "rgba(13, 16, 27, 0.85)" : "#ffffff",
        border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0",
        boxShadow: isDark ? "none" : "0 1px 3px rgba(0, 0, 0, 0.05)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "18px" }}>💾</span>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a" }}>
            Long-Term Knowledge Graph Changes
          </h3>
        </div>
        <span style={{ fontSize: "11px", color: isDark ? "#10b981" : "#059669", fontFamily: "monospace" }}>
          Persisted to creator_knowledge_graph
        </span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {items.map((item, idx) => (
          <div
            key={idx}
            style={{
              padding: "12px 16px",
              borderRadius: "12px",
              background: isDark ? "rgba(255, 255, 255, 0.02)" : "#f8fafc",
              border: isDark ? "1px solid rgba(255, 255, 255, 0.05)" : "1px solid #e2e8f0",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: "800",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  background: isDark ? "rgba(168, 85, 247, 0.15)" : "rgba(168, 85, 247, 0.1)",
                  color: isDark ? "#c084fc" : "#9333ea",
                  fontFamily: "monospace",
                }}
              >
                {item.category.toUpperCase()}
              </span>
              <span style={{ fontSize: "13px", color: isDark ? "#cbd5e1" : "#334155" }}>{item.memory}</span>
            </div>

            <span style={{ fontSize: "11px", fontWeight: "800", color: isDark ? "#34d399" : "#059669", fontFamily: "monospace" }}>
              {item.confidence}% Confident
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
