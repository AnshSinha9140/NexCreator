"use client";

import React from "react";
import { FinalSessionSummary } from "@/lib/session/lifecycle";
import { EditorialHighlightComposer, EditorialHighlight } from "@/lib/highlights/editorialStudio";

interface CompletedHighlightsProps {
  highlights?: any[];
  session?: any;
  summary?: FinalSessionSummary | null;
}

export const CompletedHighlights: React.FC<CompletedHighlightsProps> = ({
  highlights = [],
  session,
  summary,
}) => {
  const highlightsValid = summary?.integrityFlags?.highlightsValid ?? (session?.integrityFlags?.highlightsValid || false);

  if (!highlightsValid || highlights.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          padding: "48px 24px",
          borderRadius: "16px",
          background: "rgba(13, 16, 27, 0.85)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          textAlign: "center",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>🎬</div>
        <h3 style={{ margin: "0 0 8px", fontSize: "18px", fontWeight: "800", color: "#f8fafc" }}>
          No Editorial Highlights Found
        </h3>
        <p style={{ fontSize: "14px", color: "#94a3b8", maxWidth: "480px", margin: "0 auto" }}>
          Either no qualifying peak moments occurred during this broadcast window or highlight artifact persistence did not trigger.
        </p>
      </div>
    );
  }

  // Compose Editorial Highlights
  const { highlights: edHighlights, report: editorsReport } = EditorialHighlightComposer.composeFromCandidates(highlights);

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          padding: "20px 24px",
          borderRadius: "16px",
          background: "linear-gradient(135deg, rgba(147, 51, 234, 0.15), rgba(59, 130, 246, 0.15))",
          border: "1px solid rgba(147, 51, 234, 0.3)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: "11px", fontWeight: "800", color: "#c084fc", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Sprint 19.2 — AI Highlight Studio & Editorial Timeline
          </div>
          <h2 style={{ margin: "4px 0 2px", fontSize: "20px", fontWeight: "800", color: "#f8fafc" }}>
            Completed AI Editor Timeline
          </h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
            Packaged editorial clips and publishing strategy for this broadcast.
          </p>
        </div>

        <div style={{ padding: "8px 14px", borderRadius: "20px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "12px", color: "#34d399", fontWeight: "700" }}>
          ✨ {edHighlights.length} Final Editorial Moments
        </div>
      </div>

      {/* Senior Editor Briefing Report */}
      {editorsReport && (
        <div style={{ padding: "18px", borderRadius: "14px", background: "rgba(13,16,27,0.9)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "18px" }}>📋</span>
            <span style={{ fontSize: "14px", fontWeight: "800", color: "#f8fafc" }}>Senior Editor's Session Briefing</span>
          </div>
          <div style={{ fontSize: "13px", color: "#e2e8f0", background: "rgba(147,51,234,0.1)", padding: "12px", borderRadius: "8px", borderLeft: "4px solid #c084fc", fontStyle: "italic" }}>
            "{editorsReport.whatIWouldPublishFirst}"
          </div>
        </div>
      )}

      {/* Highlights List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {edHighlights.map((hl) => (
          <div
            key={hl.id}
            style={{
              padding: "20px",
              borderRadius: "16px",
              background: "rgba(13, 16, 27, 0.85)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "11px", fontWeight: "800", padding: "3px 10px", borderRadius: "12px", background: "linear-gradient(90deg, #f59e0b, #d97706)", color: "#fff" }}>
                    {hl.rankTitle}
                  </span>
                  <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "12px", background: "rgba(147, 51, 234, 0.15)", color: "#c084fc" }}>
                    {hl.category}
                  </span>
                </div>
                <h3 style={{ margin: "4px 0 0", fontSize: "17px", fontWeight: "800", color: "#f8fafc" }}>
                  {hl.title}
                </h3>
              </div>

              <div style={{ fontSize: "12px", color: "#34d399", fontWeight: "800", background: "rgba(52,211,153,0.1)", padding: "6px 12px", borderRadius: "8px", border: "1px solid rgba(52,211,153,0.2)" }}>
                Overall Score: {hl.performancePrediction.overall}/100
              </div>
            </div>

            <div style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: "1.5", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "10px", borderLeft: "3px solid #3b82f6" }}>
              <strong style={{ color: "#93c5fd", display: "block", marginBottom: "2px", fontSize: "11px", textTransform: "uppercase" }}>Editor Summary:</strong>
              {hl.editorSummary}
            </div>

            <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(0,0,0,0.5)", display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>
                <span>⏱️ {hl.timeline.startFormatted} → {hl.timeline.endFormatted}</span>
                <span style={{ color: "#34d399" }}>{hl.timeline.durationFormatted}</span>
              </div>
              <div style={{ fontFamily: "monospace", letterSpacing: "2px", fontSize: "13px", color: "#38bdf8", overflow: "hidden" }}>
                {hl.timeline.visualBar}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px" }}>
              <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(0,0,0,0.3)" }}>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#4ade80", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                  ✂️ Editing Instructions
                </span>
                {hl.editingInstructions.keep.map((k, i) => (
                  <div key={i} style={{ fontSize: "12px", color: "#cbd5e1" }}>{k}</div>
                ))}
              </div>
              <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(0,0,0,0.3)" }}>
                <span style={{ fontSize: "11px", fontWeight: "800", color: "#ec4899", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                  🚀 Recommended Platform
                </span>
                <div style={{ fontSize: "13px", fontWeight: "800", color: "#f8fafc" }}>
                  {hl.publishingStrategy.bestPlatform} ({hl.publishingStrategy.priorityWindow})
                </div>
                <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                  {hl.publishingStrategy.reasoning}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

