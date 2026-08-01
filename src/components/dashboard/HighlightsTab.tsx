"use client";

import React, { useState, useEffect } from "react";
import { HighlightCandidate } from "@/lib/highlights/generator";
import { EditorialHighlight, EditorsReport, EditorialHighlightComposer } from "@/lib/highlights/editorialStudio";

interface HighlightsTabProps {
  sessionId?: string | null;
}

export const HighlightsTab: React.FC<HighlightsTabProps> = ({ sessionId }) => {
  const [editorialHighlights, setEditorialHighlights] = useState<EditorialHighlight[]>([]);
  const [editorsReport, setEditorsReport] = useState<EditorsReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAdditional, setShowAdditional] = useState<boolean>(false);

  useEffect(() => {
    if (!sessionId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;
    const fetchHighlights = async () => {
      try {
        const res = await fetch(`/api/highlights?sessionId=${encodeURIComponent(sessionId)}`);
        if (res.ok && isMounted) {
          const data = await res.json();
          if (data.success) {
            if (Array.isArray(data.editorialHighlights) && data.editorialHighlights.length > 0) {
              setEditorialHighlights(data.editorialHighlights);
              if (data.editorsReport) setEditorsReport(data.editorsReport);
            } else if (Array.isArray(data.highlights)) {
              // Fallback client-side composition if needed
              const { highlights, report } = EditorialHighlightComposer.composeFromCandidates(data.highlights);
              setEditorialHighlights(highlights);
              setEditorsReport(report);
            }
          }
        }
      } catch (e) {
        console.warn("[HighlightsTab] Fetch error:", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchHighlights();
    const timer = setInterval(fetchHighlights, 10000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [sessionId]);

  if (!sessionId) {
    return (
      <div style={{ padding: "40px 20px", textAlign: "center", color: "#64748b", fontFamily: "'Inter', sans-serif" }}>
        No active monitoring session selected.
      </div>
    );
  }

  if (isLoading && editorialHighlights.length === 0) {
    return (
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ height: "120px", borderRadius: "14px", background: "rgba(255,255,255,0.03)" }} />
        <div style={{ height: "120px", borderRadius: "14px", background: "rgba(255,255,255,0.03)" }} />
      </div>
    );
  }

  if (editorialHighlights.length === 0) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center", color: "#94a3b8", fontFamily: "'Inter', sans-serif" }}>
        <div style={{ fontSize: "36px", marginBottom: "12px" }}>🎬</div>
        <h3 style={{ margin: "0 0 6px", fontSize: "16px", fontWeight: "800", color: "#f8fafc" }}>
          AI Editor is Watching the Stream...
        </h3>
        <p style={{ fontSize: "13px", color: "#64748b", maxWidth: "380px", margin: "0 auto" }}>
          The Senior AI Video Editor is aggregating chat peaks, emotion spikes, and viewer moments to build ready-to-publish clip packages.
        </p>
      </div>
    );
  }

  const topThree = editorialHighlights.slice(0, 3);
  const additional = editorialHighlights.slice(3, 5);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "16px", fontFamily: "'Inter', sans-serif" }}>
      {/* AI Editor Header Banner */}
      <div
        style={{
          padding: "20px",
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
            Senior AI Video Editor Timeline
          </h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
            Highlights grouped, ranked, and packaged into ready-to-edit publishing plans.
          </p>
        </div>
        <div style={{ padding: "8px 14px", borderRadius: "20px", background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "12px", color: "#34d399", fontWeight: "700" }}>
          ✨ {editorialHighlights.length} Publishable Moment{editorialHighlights.length > 1 ? "s" : ""}
        </div>
      </div>

      {/* Editor's Report Briefing Box */}
      {editorsReport && (
        <div style={{ padding: "18px", borderRadius: "14px", background: "rgba(13,16,27,0.9)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "18px" }}>📋</span>
            <span style={{ fontSize: "14px", fontWeight: "800", color: "#f8fafc" }}>Senior Editor's Session Briefing</span>
          </div>
          <div style={{ fontSize: "13px", color: "#e2e8f0", background: "rgba(147,51,234,0.1)", padding: "12px", borderRadius: "8px", borderLeft: "4px solid #c084fc", fontStyle: "italic" }}>
            "{editorsReport.whatIWouldPublishFirst}"
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", fontSize: "12px", marginTop: "4px" }}>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "8px 12px", borderRadius: "8px" }}>
              <span style={{ color: "#64748b", display: "block" }}>Today's Best Clip:</span>
              <strong style={{ color: "#f1f5f9" }}>{editorsReport.todaysBestClip}</strong>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "8px 12px", borderRadius: "8px" }}>
              <span style={{ color: "#64748b", display: "block" }}>Best Short-Form:</span>
              <strong style={{ color: "#38bdf8" }}>{editorsReport.bestShort}</strong>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "8px 12px", borderRadius: "8px" }}>
              <span style={{ color: "#64748b", display: "block" }}>Funniest Moment:</span>
              <strong style={{ color: "#facc15" }}>{editorsReport.funniestMoment}</strong>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", padding: "8px 12px", borderRadius: "8px" }}>
              <span style={{ color: "#64748b", display: "block" }}>Community Moment:</span>
              <strong style={{ color: "#4ade80" }}>{editorsReport.communityMoment}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Top 3 Ranked Highlights */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {topThree.map((hl) => (
          <EditorialCard key={hl.id} highlight={hl} />
        ))}
      </div>

      {/* Additional Moments Collapsible */}
      {additional.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            onClick={() => setShowAdditional(!showAdditional)}
            style={{
              padding: "12px 16px",
              borderRadius: "12px",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#94a3b8",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>🎬 Additional Moments ({additional.length})</span>
            <span>{showAdditional ? "▲ Hide" : "▼ Expand"}</span>
          </button>

          {showAdditional && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {additional.map((hl) => (
                <EditorialCard key={hl.id} highlight={hl} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const EditorialCard: React.FC<{ highlight: EditorialHighlight }> = ({ highlight: hl }) => {
  const getRankBadgeStyle = (rank: string) => {
    switch (rank) {
      case "GOLD":
        return { background: "linear-gradient(90deg, #f59e0b, #d97706)", color: "#ffffff" };
      case "SILVER":
        return { background: "linear-gradient(90deg, #94a3b8, #64748b)", color: "#ffffff" };
      case "BRONZE":
        return { background: "linear-gradient(90deg, #b45309, #78350f)", color: "#ffffff" };
      default:
        return { background: "rgba(255,255,255,0.1)", color: "#94a3b8" };
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        borderRadius: "16px",
        background: "rgba(13, 16, 27, 0.85)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
      }}
    >
      {/* Card Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", padding: "3px 10px", borderRadius: "12px", ...getRankBadgeStyle(hl.rank) }}>
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

        {/* Multi-Metric Scores Badge */}
        <div style={{ display: "flex", gap: "8px", background: "rgba(0,0,0,0.4)", padding: "6px 12px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: "9px", color: "#64748b", display: "block" }}>VIRALITY</span>
            <span style={{ fontSize: "13px", fontWeight: "800", color: "#34d399" }}>{hl.performancePrediction.virality}</span>
          </div>
          <div style={{ borderRight: "1px solid rgba(255,255,255,0.1)" }} />
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: "9px", color: "#64748b", display: "block" }}>REPLAY</span>
            <span style={{ fontSize: "13px", fontWeight: "800", color: "#38bdf8" }}>{hl.performancePrediction.replay}</span>
          </div>
          <div style={{ borderRight: "1px solid rgba(255,255,255,0.1)" }} />
          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: "9px", color: "#64748b", display: "block" }}>OVERALL</span>
            <span style={{ fontSize: "13px", fontWeight: "800", color: "#facc15" }}>{hl.performancePrediction.overall}</span>
          </div>
        </div>
      </div>

      {/* Editor Summary */}
      <div style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: "1.5", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "10px", borderLeft: "3px solid #3b82f6" }}>
        <strong style={{ color: "#93c5fd", display: "block", marginBottom: "2px", fontSize: "11px", textTransform: "uppercase" }}>Editor Summary:</strong>
        {hl.editorSummary}
      </div>

      {/* Visual Timeline Bar */}
      <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(0,0,0,0.5)", display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>
          <span>⏱️ {hl.timeline.startFormatted} → {hl.timeline.endFormatted}</span>
          <span style={{ color: "#34d399" }}>{hl.timeline.durationFormatted}</span>
        </div>
        <div style={{ fontFamily: "monospace", letterSpacing: "2px", fontSize: "13px", color: "#38bdf8", overflow: "hidden" }}>
          {hl.timeline.visualBar}
        </div>
      </div>

      {/* Clip Structure Phases (Hook -> Build-up -> Peak -> Ending) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px" }}>
        <div style={{ padding: "8px 10px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
          <span style={{ fontSize: "10px", fontWeight: "800", color: "#fca5a5" }}>HOOK ({hl.clipStructure.hook.timestampFormatted})</span>
          <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#cbd5e1" }}>{hl.clipStructure.hook.description}</p>
        </div>
        <div style={{ padding: "8px 10px", borderRadius: "8px", background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.2)" }}>
          <span style={{ fontSize: "10px", fontWeight: "800", color: "#fde047" }}>BUILD-UP ({hl.clipStructure.buildUp.timestampFormatted})</span>
          <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#cbd5e1" }}>{hl.clipStructure.buildUp.description}</p>
        </div>
        <div style={{ padding: "8px 10px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
          <span style={{ fontSize: "10px", fontWeight: "800", color: "#6ee7b7" }}>PEAK ({hl.clipStructure.peak.timestampFormatted})</span>
          <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#cbd5e1" }}>{hl.clipStructure.peak.description}</p>
        </div>
        <div style={{ padding: "8px 10px", borderRadius: "8px", background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
          <span style={{ fontSize: "10px", fontWeight: "800", color: "#93c5fd" }}>ENDING ({hl.clipStructure.ending.timestampFormatted})</span>
          <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#cbd5e1" }}>{hl.clipStructure.ending.description}</p>
        </div>
      </div>

      {/* Editing Instructions & Publishing Strategy side by side */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px" }}>
        {/* Editor Notes Checklist */}
        <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}>
          <span style={{ fontSize: "11px", fontWeight: "800", color: "#f8fafc", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
            ✂️ Editor Notes
          </span>
          <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "12px", color: "#cbd5e1", display: "flex", flexDirection: "column", gap: "4px" }}>
            {hl.editingInstructions.keep.map((k, i) => (
              <li key={i} style={{ color: "#4ade80" }}>{k}</li>
            ))}
            {hl.editingInstructions.trim.map((t, i) => (
              <li key={i} style={{ color: "#f87171" }}>{t}</li>
            ))}
          </ul>
        </div>

        {/* Publishing Plan */}
        <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: "800", color: "#f8fafc", textTransform: "uppercase" }}>
            🚀 Publishing Strategy
          </span>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span style={{ fontSize: "12px", padding: "3px 8px", borderRadius: "6px", background: "#ec4899", color: "#fff", fontWeight: "700" }}>
              {hl.publishingStrategy.bestPlatform}
            </span>
            <span style={{ fontSize: "12px", color: "#94a3b8" }}>
              Publish window: <strong style={{ color: "#f8fafc" }}>{hl.publishingStrategy.priorityWindow}</strong>
            </span>
          </div>
          <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>
            {hl.publishingStrategy.reasoning}
          </p>
        </div>
      </div>

      {/* Title Generator & Thumbnail Suggestion */}
      <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "11px", fontWeight: "800", color: "#c084fc", textTransform: "uppercase" }}>
            💡 Optimized Title Generator
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "8px", fontSize: "12px" }}>
          <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px", borderRadius: "6px" }}>
            <span style={{ color: "#64748b", fontSize: "10px", display: "block" }}>CTR HOOK:</span>
            <strong style={{ color: "#f1f5f9" }}>"{hl.titleSuggestions.ctr}"</strong>
          </div>
          <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px", borderRadius: "6px" }}>
            <span style={{ color: "#64748b", fontSize: "10px", display: "block" }}>CURIOSITY:</span>
            <strong style={{ color: "#f1f5f9" }}>"{hl.titleSuggestions.curiosity}"</strong>
          </div>
          <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px", borderRadius: "6px" }}>
            <span style={{ color: "#64748b", fontSize: "10px", display: "block" }}>SEARCH / SEO:</span>
            <strong style={{ color: "#f1f5f9" }}>"{hl.titleSuggestions.seo}"</strong>
          </div>
        </div>

        {/* Thumbnail Box */}
        <div style={{ marginTop: "4px", padding: "8px 12px", borderRadius: "8px", background: "rgba(59, 130, 246, 0.1)", border: "1px dashed rgba(59, 130, 246, 0.3)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
          <div>
            <span style={{ color: "#93c5fd", fontWeight: "700" }}>🖼️ Thumbnail Frame Suggestion:</span>
            <span style={{ color: "#cbd5e1", marginLeft: "6px" }}>Timestamp {hl.thumbnailRecommendation.frameTimestamp} ({hl.thumbnailRecommendation.expression})</span>
          </div>
          <span style={{ color: "#facc15", fontWeight: "800", background: "rgba(0,0,0,0.4)", padding: "2px 8px", borderRadius: "4px" }}>
            Text: {hl.thumbnailRecommendation.overlayText}
          </span>
        </div>
      </div>
    </div>
  );
};

