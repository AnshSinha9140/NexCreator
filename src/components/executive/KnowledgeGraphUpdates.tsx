"use client";

import React from "react";
import { KnowledgeGraphUpdateItem } from "@/lib/ai/executiveTypes";

interface KnowledgeGraphUpdatesProps {
  updates?: KnowledgeGraphUpdateItem[];
}

export const KnowledgeGraphUpdates: React.FC<KnowledgeGraphUpdatesProps> = ({ updates }) => {
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
          <span style={{ fontSize: "18px" }}>💾</span>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#f8fafc" }}>
            Long-Term Knowledge Graph Changes
          </h3>
        </div>
        <span style={{ fontSize: "11px", color: "#10b981", fontFamily: "monospace" }}>
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
              background: "rgba(255, 255, 255, 0.02)",
              border: "1px solid rgba(255, 255, 255, 0.05)",
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
                  background: "rgba(168, 85, 247, 0.15)",
                  color: "#c084fc",
                  fontFamily: "monospace",
                }}
              >
                {item.category.toUpperCase()}
              </span>
              <span style={{ fontSize: "13px", color: "#cbd5e1" }}>{item.memory}</span>
            </div>

            <span style={{ fontSize: "11px", fontWeight: "800", color: "#34d399", fontFamily: "monospace" }}>
              {item.confidence}% Confident
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
