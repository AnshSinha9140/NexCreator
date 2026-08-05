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
  const [showEvidenceModal, setShowEvidenceModal] = useState<any | null>(null);

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
        {topThree.map((hl, index) => (
          <EditorialCard key={hl.id || `hl-top-${index}`} highlight={hl} onShowEvidence={setShowEvidenceModal} />
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
              {additional.map((hl, index) => (
                <EditorialCard key={hl.id || `hl-add-${index}`} highlight={hl} onShowEvidence={setShowEvidenceModal} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Evidence Inspector Modal (Part 10) */}
      {showEvidenceModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(8px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          padding: "20px",
          fontFamily: "'Inter', sans-serif"
        }}>
          <div style={{
            background: "#0d1017",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "20px",
            width: "100%",
            maxWidth: "550px",
            padding: "24px",
            boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
            color: "#f8fafc"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#a855f7" }}>
                🔎 Evidence Inspector
              </h3>
              <button
                onClick={() => setShowEvidenceModal(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontSize: "18px"
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>Insight Title</span>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#e2e8f0", marginTop: "2px" }}>
                  {showEvidenceModal.title}
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase" }}>Peak Viewers</span>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#38bdf8" }}>
                    {showEvidenceModal.viewerEvidence?.peakViewers ?? 0}
                  </div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase" }}>Chat Velocity</span>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#34d399" }}>
                    {showEvidenceModal.chatEvidence?.velocity ?? 0} msgs/min
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase" }}>Sentiment Score</span>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#fbbf24" }}>
                    {showEvidenceModal.sentimentEvidence?.sentimentScore ?? 0}% ({showEvidenceModal.sentimentEvidence?.dominantEmotion})
                  </div>
                </div>
                <div style={{ background: "rgba(255,255,255,0.02)", padding: "10px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.04)" }}>
                  <span style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase" }}>AI Confidence</span>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#a855f7" }}>
                    {showEvidenceModal.confidence ?? 0}% (Evidence-Backed)
                  </div>
                </div>
              </div>

              <div>
                <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>Timestamp / Clip Range</span>
                <div style={{ fontSize: "13px", color: "#cbd5e1", marginTop: "2px" }}>
                  Peak: {showEvidenceModal.timeline?.peakTimestamp || showEvidenceModal.timestamp} | Range: {showEvidenceModal.timeline?.clipStartTimestamp || showEvidenceModal.timeline?.startFormatted} → {showEvidenceModal.timeline?.clipEndTimestamp || showEvidenceModal.timeline?.endFormatted}
                </div>
              </div>

              {showEvidenceModal.chatEvidence?.representativeMessages && showEvidenceModal.chatEvidence.representativeMessages.length > 0 && (
                <div>
                  <span style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>Verified Chat Telemetry</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
                    {showEvidenceModal.chatEvidence.representativeMessages.map((msg: string, idx: number) => (
                      <div key={idx} style={{ background: "rgba(255,255,255,0.03)", padding: "6px 10px", borderRadius: "6px", fontSize: "11px", color: "#94a3b8" }}>
                        💬 {msg}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EditorialCard: React.FC<{ highlight: EditorialHighlight; onShowEvidence: (hl: any) => void }> = ({ highlight, onShowEvidence }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Fallback structures to protect against undefined properties
  const hl = {
    ...highlight,
    timeline: highlight.timeline || {
      streamStartTimestamp: "00:00:00",
      streamEndTimestamp: "00:00:00",
      peakTimestamp: "00:00:00",
      clipStartTimestamp: "00:00:00",
      clipEndTimestamp: "00:00:00",
      durationSeconds: 0,
      visualBar: "░░░░░░░░░░░░░░░░░░░░",
      startFormatted: "00:00:00",
      endFormatted: "00:00:00",
      durationFormatted: "0 seconds"
    },
    clipStructure: highlight.clipStructure || {
      hook: { label: "Hook", timestampFormatted: "00:00:02", description: "Hook" },
      buildUp: { label: "Build Up", timestampFormatted: "00:00:10", description: "Build up" },
      peak: { label: "Peak", timestampFormatted: "00:00:20", description: "Peak" },
      ending: { label: "Ending", timestampFormatted: "00:00:30", description: "Ending" }
    },
    whyPicked: highlight.whyPicked || [],
    performancePrediction: highlight.performancePrediction || {
      virality: 50,
      replay: 50,
      ctr: 50,
      retention: 50,
      community: 50,
      overall: 50,
      explanation: "Prediction baseline",
      scoreBreakdown: []
    },
    chatSummary: highlight.chatSummary || {
      dominantEmotion: "Neutral",
      summaryText: "No chat activity summary available.",
      commonReactions: []
    },
    editingInstructions: highlight.editingInstructions || {
      keep: [],
      trim: [],
      facecamImportance: "Medium",
      subtitleRecommendation: false,
      subtitleReason: "N/A"
    },
    publishingStrategy: highlight.publishingStrategy || {
      bestPlatform: "YouTube Shorts",
      secondaryPlatform: "TikTok",
      why: "N/A",
      audience: "General",
      recommendedUploadTime: "N/A",
      recommendedThumbnailEmotion: "N/A",
      recommendedSubtitleStyle: "N/A",
      priorityWindow: "Today",
      reasoning: "N/A"
    },
    titleSuggestions: highlight.titleSuggestions || {
      curiosity: { title: "N/A", reason: "N/A" },
      seo: { title: "N/A", reason: "N/A" },
      ctr: { title: "N/A", reason: "N/A" },
      tiktok: { title: "N/A", reason: "N/A" },
      shorts: { title: "N/A", reason: "N/A" }
    },
    thumbnailRecommendation: highlight.thumbnailRecommendation || {
      frameTimestamp: "00:00:00",
      expression: "N/A",
      overlayText: "N/A",
      focusArea: "N/A",
      eyeContact: "N/A",
      brightness: "N/A",
      sceneClarity: "N/A",
      reason: "N/A"
    }
  };

  const handleTimestampClick = (e: React.MouseEvent, timestamp: string, label: string) => {
    e.stopPropagation();
    console.log(`[Seek Event] Requesting player seek directly to timestamp: ${timestamp} (${label})`);
    const event = new CustomEvent("playerSeek", { detail: { timestamp, label } });
    window.dispatchEvent(event);
    alert(`Seeking stream player directly to absolute timeline timestamp: ${timestamp} (${label})`);
  };

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
      onClick={() => setIsExpanded(!isExpanded)}
      style={{
        padding: "20px",
        borderRadius: "16px",
        background: "rgba(13, 16, 27, 0.85)",
        border: isExpanded ? "1px solid rgba(168, 85, 247, 0.4)" : "1px solid rgba(255, 255, 255, 0.1)",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        cursor: "pointer",
        transition: "all 0.2s ease",
      }}
    >
      {/* Card Header (Always Visible) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", padding: "3px 10px", borderRadius: "12px", ...getRankBadgeStyle(hl.rank) }}>
              {hl.rankTitle}
            </span>
            <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "12px", background: "rgba(147, 51, 234, 0.15)", color: "#c084fc" }}>
              {hl.category}
            </span>
            <span style={{ fontSize: "11px", fontWeight: "700", padding: "3px 10px", borderRadius: "12px", background: "rgba(255, 255, 255, 0.05)", color: "#94a3b8", fontFamily: "monospace" }}>
              {hl.classifiedType}
            </span>
            <span style={{ fontSize: "11px", color: "#64748b" }}>
              ⏱️ {hl.timeline.durationSeconds}s
            </span>
          </div>
          <h3 style={{ margin: "4px 0 0", fontSize: "17px", fontWeight: "800", color: "#f8fafc", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "#a855f7" }}>{isExpanded ? "▼" : "▶"}</span>
            {hl.title}
          </h3>
        </div>

        {/* Scores */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
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
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShowEvidence(hl);
              }}
              style={{
                padding: "4px 8px",
                fontSize: "10px",
                fontWeight: 700,
                background: "rgba(168, 85, 247, 0.15)",
                color: "#c084fc",
                border: "1px solid rgba(168, 85, 247, 0.3)",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              🔎 Show Evidence
            </button>
            <span style={{ fontSize: "10px", color: "#64748b" }}>
              {isExpanded ? "Collapse" : "Expand Details"}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            paddingTop: "16px",
            cursor: "default",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Comparison */}
          {hl.comparedToNext && (
            <div style={{ fontSize: "11px", color: "#e0aaff", fontStyle: "italic", background: "rgba(168,85,247,0.05)", padding: "6px 10px", borderRadius: "6px" }}>
              ⚖️ {hl.comparedToNext}
            </div>
          )}

          {/* Editor Summary */}
          <div style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: "1.5", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "10px", borderLeft: "3px solid #3b82f6" }}>
            <strong style={{ color: "#93c5fd", display: "block", marginBottom: "4px", fontSize: "11px", textTransform: "uppercase" }}>Editor Summary:</strong>
            {hl.editorSummary}
          </div>

          {/* Absolute timestamps */}
          <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(0,0,0,0.5)", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>
              <div style={{ display: "flex", gap: "10px" }}>
                <span style={{ cursor: "pointer", textDecoration: "underline", color: "#38bdf8" }} onClick={(e) => handleTimestampClick(e, hl.timeline.streamStartTimestamp, "Event Start")}>
                  Stream Range: {hl.timeline.streamStartTimestamp}
                </span>
                <span>→</span>
                <span style={{ cursor: "pointer", textDecoration: "underline", color: "#38bdf8" }} onClick={(e) => handleTimestampClick(e, hl.timeline.streamEndTimestamp, "Event End")}>
                  {hl.timeline.streamEndTimestamp}
                </span>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <span style={{ color: "#facc15" }}>Peak:</span>
                <span style={{ cursor: "pointer", textDecoration: "underline", color: "#facc15" }} onClick={(e) => handleTimestampClick(e, hl.timeline.peakTimestamp, "Metrics Peak")}>
                  {hl.timeline.peakTimestamp}
                </span>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <span style={{ color: "#4ade80" }}>Recommended Clip:</span>
                <span style={{ cursor: "pointer", textDecoration: "underline", color: "#4ade80" }} onClick={(e) => handleTimestampClick(e, hl.timeline.clipStartTimestamp, "Recommended Clip Start")}>
                  {hl.timeline.clipStartTimestamp}
                </span>
                <span>→</span>
                <span style={{ cursor: "pointer", textDecoration: "underline", color: "#4ade80" }} onClick={(e) => handleTimestampClick(e, hl.timeline.clipEndTimestamp, "Recommended Clip End")}>
                  {hl.timeline.clipEndTimestamp}
                </span>
              </div>
            </div>
            <div style={{ fontFamily: "monospace", letterSpacing: "2px", fontSize: "13px", color: "#38bdf8", overflow: "hidden" }}>
              {hl.timeline.visualBar}
            </div>
          </div>

          {/* Phases */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px" }}>
            <div style={{ padding: "8px 10px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", cursor: "pointer" }} onClick={(e) => handleTimestampClick(e, hl.clipStructure.hook.timestampFormatted, hl.clipStructure.hook.label)}>
              <span style={{ fontSize: "10px", fontWeight: "800", color: "#fca5a5" }}>{hl.clipStructure.hook.label.toUpperCase()} ({hl.clipStructure.hook.timestampFormatted})</span>
              <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#cbd5e1" }}>{hl.clipStructure.hook.description}</p>
            </div>
            <div style={{ padding: "8px 10px", borderRadius: "8px", background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.2)", cursor: "pointer" }} onClick={(e) => handleTimestampClick(e, hl.clipStructure.buildUp.timestampFormatted, hl.clipStructure.buildUp.label)}>
              <span style={{ fontSize: "10px", fontWeight: "800", color: "#fde047" }}>{hl.clipStructure.buildUp.label.toUpperCase()} ({hl.clipStructure.buildUp.timestampFormatted})</span>
              <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#cbd5e1" }}>{hl.clipStructure.buildUp.description}</p>
            </div>
            <div style={{ padding: "8px 10px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", cursor: "pointer" }} onClick={(e) => handleTimestampClick(e, hl.clipStructure.peak.timestampFormatted, hl.clipStructure.peak.label)}>
              <span style={{ fontSize: "10px", fontWeight: "800", color: "#6ee7b7" }}>{hl.clipStructure.peak.label.toUpperCase()} ({hl.clipStructure.peak.timestampFormatted})</span>
              <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#cbd5e1" }}>{hl.clipStructure.peak.description}</p>
            </div>
            <div style={{ padding: "8px 10px", borderRadius: "8px", background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)", cursor: "pointer" }} onClick={(e) => handleTimestampClick(e, hl.clipStructure.ending.timestampFormatted, hl.clipStructure.ending.label)}>
              <span style={{ fontSize: "10px", fontWeight: "800", color: "#93c5fd" }}>{hl.clipStructure.ending.label.toUpperCase()} ({hl.clipStructure.ending.timestampFormatted})</span>
              <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#cbd5e1" }}>{hl.clipStructure.ending.description}</p>
            </div>
          </div>

          {/* Breakdown & Why Picked */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px" }}>
            <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#34d399", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                📊 Score Explainability
              </span>
              <div style={{ fontSize: "12px", color: "#cbd5e1" }}>
                <strong>Virality {hl.performancePrediction.virality}</strong>
                <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                  Built from:
                </div>
                <ul style={{ margin: "4px 0 0", paddingLeft: "16px", fontSize: "11px", display: "flex", flexDirection: "column", gap: "2px" }}>
                  {hl.performancePrediction.scoreBreakdown?.map((item, idx) => (
                    <li key={idx}>
                      <strong>+{item.value}</strong> {item.label}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#c084fc", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                🎯 Why This Was Selected
              </span>
              <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "11px", color: "#cbd5e1", display: "flex", flexDirection: "column", gap: "4px" }}>
                {hl.whyPicked.map((reason, idx) => (
                  <li key={idx}>{reason}</li>
                ))}
              </ul>
            </div>
          </div>

          {/* Notes & Publish */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px" }}>
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

            <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)", display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#f8fafc", textTransform: "uppercase" }}>
                🚀 Publishing Strategy
              </span>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <span style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "6px", background: "#ec4899", color: "#fff", fontWeight: "700" }}>
                  {hl.publishingStrategy.bestPlatform}
                </span>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                  Priority window: <strong style={{ color: "#f8fafc" }}>{hl.publishingStrategy.priorityWindow}</strong>
                </span>
              </div>
              <div style={{ fontSize: "11px", color: "#cbd5e1" }}>
                <span style={{ color: "#64748b" }}>Subtitles: </span> {hl.publishingStrategy.recommendedSubtitleStyle}
              </div>
              <div style={{ fontSize: "11px", color: "#cbd5e1" }}>
                <span style={{ color: "#64748b" }}>Audience target: </span> {hl.publishingStrategy.audience}
              </div>
              <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "4px" }}>
                {hl.publishingStrategy.reasoning}
              </p>
            </div>
          </div>

          {/* Titles & Thumbnails */}
          <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(255,255,255,0.02)", display: "flex", flexDirection: "column", gap: "10px" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#c084fc", textTransform: "uppercase" }}>
              💡 Optimized Title Studio Suggestions
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "8px", fontSize: "11px" }}>
              <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px", borderRadius: "6px" }}>
                <span style={{ color: "#e0aaff", fontSize: "10px", display: "block", fontWeight: "700" }}>CTR HOOK:</span>
                <strong style={{ color: "#f1f5f9" }}>"{hl.titleSuggestions.ctr.title}"</strong>
                <span style={{ color: "#64748b", display: "block", fontSize: "9px", marginTop: "2px" }}>{hl.titleSuggestions.ctr.reason}</span>
              </div>
              <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px", borderRadius: "6px" }}>
                <span style={{ color: "#e0aaff", fontSize: "10px", display: "block", fontWeight: "700" }}>CURIOSITY:</span>
                <strong style={{ color: "#f1f5f9" }}>"{hl.titleSuggestions.curiosity.title}"</strong>
                <span style={{ color: "#64748b", display: "block", fontSize: "9px", marginTop: "2px" }}>{hl.titleSuggestions.curiosity.reason}</span>
              </div>
              <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px", borderRadius: "6px" }}>
                <span style={{ color: "#e0aaff", fontSize: "10px", display: "block", fontWeight: "700" }}>SEARCH / SEO:</span>
                <strong style={{ color: "#f1f5f9" }}>"{hl.titleSuggestions.seo.title}"</strong>
                <span style={{ color: "#64748b", display: "block", fontSize: "9px", marginTop: "2px" }}>{hl.titleSuggestions.seo.reason}</span>
              </div>
              <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px", borderRadius: "6px" }}>
                <span style={{ color: "#e0aaff", fontSize: "10px", display: "block", fontWeight: "700" }}>TIKTOK CAPTION:</span>
                <strong style={{ color: "#f1f5f9" }}>"{hl.titleSuggestions.tiktok.title}"</strong>
                <span style={{ color: "#64748b", display: "block", fontSize: "9px", marginTop: "2px" }}>{hl.titleSuggestions.tiktok.reason}</span>
              </div>
              <div style={{ background: "rgba(0,0,0,0.3)", padding: "8px", borderRadius: "6px" }}>
                <span style={{ color: "#e0aaff", fontSize: "10px", display: "block", fontWeight: "700" }}>SHORTS CAPTION:</span>
                <strong style={{ color: "#f1f5f9" }}>"{hl.titleSuggestions.shorts.title}"</strong>
                <span style={{ color: "#64748b", display: "block", fontSize: "9px", marginTop: "2px" }}>{hl.titleSuggestions.shorts.reason}</span>
              </div>
            </div>

            {/* Thumbnail Recommendation */}
            <div style={{ marginTop: "4px", padding: "10px 12px", borderRadius: "8px", background: "rgba(59, 130, 246, 0.1)", border: "1px dashed rgba(59, 130, 246, 0.3)", display: "flex", flexDirection: "column", gap: "6px", fontSize: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                <span style={{ color: "#93c5fd", fontWeight: "700" }}>🖼️ Thumbnail Frame Recommendation:</span>
                <span style={{ color: "#facc15", fontWeight: "800", background: "rgba(0,0,0,0.4)", padding: "2px 8px", borderRadius: "4px" }}>
                  Overlay Text: {hl.thumbnailRecommendation.overlayText}
                </span>
              </div>
              <div style={{ fontSize: "11px", color: "#cbd5e1" }}>
                <span style={{ color: "#64748b" }}>Frame Target: </span>
                <span style={{ cursor: "pointer", textDecoration: "underline", color: "#38bdf8" }} onClick={(e) => handleTimestampClick(e, hl.thumbnailRecommendation.frameTimestamp, "Thumbnail Suggestion Frame")}>
                  Timestamp {hl.thumbnailRecommendation.frameTimestamp}
                </span>
                {` (Emotion: ${hl.thumbnailRecommendation.expression} · Eye Contact: ${hl.thumbnailRecommendation.eyeContact})`}
              </div>
              <div style={{ fontSize: "11px", color: "#cbd5e1" }}>
                <span style={{ color: "#64748b" }}>Reasoning: </span> {hl.thumbnailRecommendation.reason}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

