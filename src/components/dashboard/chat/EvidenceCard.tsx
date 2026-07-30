"use client";

import React, { useState } from "react";
import { IntelligenceEvidence } from "@/lib/intelligence/evidence";

interface EvidenceCardProps {
  evidence: IntelligenceEvidence | IntelligenceEvidence[];
  title?: string;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ evidence, title = "Inspect Supporting Evidence" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const items = Array.isArray(evidence) ? evidence : [evidence];

  if (!evidence || items.length === 0) return null;

  return (
    <div style={{ marginTop: "10px", fontFamily: "'Inter', sans-serif" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "4px 10px",
          borderRadius: "6px",
          background: "rgba(168, 85, 247, 0.12)",
          border: "1px solid rgba(168, 85, 247, 0.25)",
          color: "#c084fc",
          fontSize: "11px",
          fontWeight: "700",
          cursor: "pointer",
          transition: "all 0.15s ease",
        }}
      >
        <span>🔍</span>
        <span>{title} ({items.length})</span>
        <span style={{ fontSize: "9px" }}>{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div
          style={{
            marginTop: "8px",
            padding: "12px",
            borderRadius: "10px",
            background: "rgba(13, 16, 27, 0.95)",
            border: "1px solid rgba(168, 85, 247, 0.2)",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            fontSize: "12px",
          }}
        >
          {items.map((ev, idx) => (
            <div key={ev.id || idx} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#94a3b8", fontSize: "10px", fontFamily: "monospace" }}>
                <span>SOURCE: {ev.source.toUpperCase()}</span>
                <span>CONFIDENCE: {ev.confidence}%</span>
              </div>
              <div style={{ color: "#f8fafc", fontWeight: "600" }}>{ev.description}</div>

              {ev.metrics && (
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", fontSize: "11px", color: "#34d399", fontFamily: "monospace" }}>
                  {typeof ev.metrics.messagesPerMinute === "number" && <span>⚡ {ev.metrics.messagesPerMinute} msgs/min</span>}
                  {typeof ev.metrics.sentimentScore === "number" && <span>😊 {ev.metrics.sentimentScore}/100 sentiment</span>}
                  {typeof ev.metrics.questionCount === "number" && <span>❓ {ev.metrics.questionCount} questions</span>}
                </div>
              )}

              {ev.sampleMessages && ev.sampleMessages.length > 0 && (
                <div style={{ marginTop: "4px", padding: "6px 10px", borderRadius: "6px", background: "rgba(255,255,255,0.03)", color: "#cbd5e1", fontSize: "11px", fontStyle: "italic" }}>
                  "{ev.sampleMessages.join('" | "')}"
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
