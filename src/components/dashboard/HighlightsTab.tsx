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

      {/* Senior Editor's Session Briefing Box */}
      {(() => {
        const hasBriefingText = Boolean(editorsReport?.whatIWouldPublishFirst && editorsReport.whatIWouldPublishFirst.trim() !== "" && !editorsReport.whatIWouldPublishFirst.includes("Waiting for stream moments"));
        const hasValidBestClip = Boolean(editorsReport?.todaysBestClip && editorsReport.todaysBestClip !== "None" && !editorsReport.todaysBestClip.includes("Waiting"));
        const isLivePending = !hasBriefingText && !hasValidBestClip;

        return (
          <div style={{ padding: "18px", borderRadius: "14px", background: "rgba(13,16,27,0.9)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "18px" }}>📋</span>
                <span style={{ fontSize: "14px", fontWeight: "800", color: "#f8fafc" }}>Senior Editor's Session Briefing</span>
              </div>
              {isLivePending && (
                <span style={{ fontSize: "11px", fontWeight: 700, padding: "3px 10px", borderRadius: "12px", background: "rgba(168, 85, 247, 0.15)", color: "#c084fc", border: "1px solid rgba(168, 85, 247, 0.3)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#a855f7", animation: "pulse 1.5s infinite" }} />
                  Live Stream Monitoring Active
                </span>
              )}
            </div>

            {/* Main Briefing Quote / Pending Placeholder */}
            {isLivePending ? (
              <div style={{ fontSize: "13px", color: "#94a3b8", background: "rgba(168,85,247,0.06)", padding: "14px 16px", borderRadius: "10px", borderLeft: "4px solid #a855f7", lineHeight: "1.5" }}>
                📡 <em>The Senior AI Editor is actively monitoring your stream. The final session briefing and ranked clip superlatives will be compiled here as soon as the broadcast ends.</em>
              </div>
            ) : (
              <div style={{ fontSize: "13px", color: "#e2e8f0", background: "rgba(147,51,234,0.1)", padding: "12px 14px", borderRadius: "8px", borderLeft: "4px solid #c084fc", fontStyle: "italic", lineHeight: "1.5" }}>
                "{editorsReport?.whatIWouldPublishFirst}"
              </div>
            )}

            {/* Superlative Boxes (Live Muted / Pending State vs Enriched Data) */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px", fontSize: "12px", marginTop: "4px" }}>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px 12px", borderRadius: "8px", opacity: isLivePending ? 0.6 : 1, border: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ color: "#64748b", display: "block", fontSize: "11px", fontWeight: "600" }}>Today's Best Clip</span>
                <strong style={{ color: isLivePending ? "#94a3b8" : "#f1f5f9", fontSize: "12px", display: "block", marginTop: "2px" }}>
                  {isLivePending ? "⏳ Analyzing stream moments..." : editorsReport?.todaysBestClip}
                </strong>
              </div>

              <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px 12px", borderRadius: "8px", opacity: isLivePending ? 0.6 : 1, border: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ color: "#64748b", display: "block", fontSize: "11px", fontWeight: "600" }}>Best Short-Form</span>
                <strong style={{ color: isLivePending ? "#94a3b8" : "#38bdf8", fontSize: "12px", display: "block", marginTop: "2px" }}>
                  {isLivePending ? "⏳ Waiting for stream to end..." : editorsReport?.bestShort}
                </strong>
              </div>

              <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px 12px", borderRadius: "8px", opacity: isLivePending ? 0.6 : 1, border: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ color: "#64748b", display: "block", fontSize: "11px", fontWeight: "600" }}>Funniest Moment</span>
                <strong style={{ color: isLivePending ? "#94a3b8" : "#facc15", fontSize: "12px", display: "block", marginTop: "2px" }}>
                  {isLivePending ? "⏳ Evaluating comedy spikes..." : editorsReport?.funniestMoment}
                </strong>
              </div>

              <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px 12px", borderRadius: "8px", opacity: isLivePending ? 0.6 : 1, border: "1px solid rgba(255,255,255,0.05)" }}>
                <span style={{ color: "#64748b", display: "block", fontSize: "11px", fontWeight: "600" }}>Community Moment</span>
                <strong style={{ color: isLivePending ? "#94a3b8" : "#4ade80", fontSize: "12px", display: "block", marginTop: "2px" }}>
                  {isLivePending ? "⏳ Aggregating chat reactions..." : editorsReport?.communityMoment}
                </strong>
              </div>
            </div>
          </div>
        );
      })()}

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

// Helper: Safely append timestamp (in seconds or HH:MM:SS) to a VOD base URL for Kick, YouTube, or Twitch
export function generateVodUrl(baseUrl?: string | null, secondsOrTimestamp?: number | string | null): string {
  // Graceful Fallback: if no VOD URL, default to kick platform homepage
  const targetUrl = baseUrl && baseUrl.trim().length > 0 ? baseUrl.trim() : "https://kick.com";
  
  // Ensure absolute protocol (prevent relative localhost routing)
  let cleanUrl = targetUrl;
  if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
    cleanUrl = `https://${cleanUrl}`;
  }

  let seconds = 0;
  if (typeof secondsOrTimestamp === "number") {
    seconds = Math.max(0, Math.floor(secondsOrTimestamp));
  } else if (typeof secondsOrTimestamp === "string") {
    const parts = secondsOrTimestamp.trim().split(":").map(Number);
    if (parts.length === 3 && !parts.some(isNaN)) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    else if (parts.length === 2 && !parts.some(isNaN)) seconds = parts[0] * 60 + parts[1];
    else if (parts.length === 1 && !isNaN(parts[0])) seconds = parts[0];
  }

  const hasQuery = cleanUrl.includes("?");
  const separator = hasQuery ? "&" : "?";

  // Platform-appropriate parameter format
  if (cleanUrl.includes("youtube.com") || cleanUrl.includes("youtu.be")) {
    return `${cleanUrl}${separator}t=${seconds}s`;
  }
  if (cleanUrl.includes("kick.com")) {
    return `${cleanUrl}${separator}t=${seconds}s`;
  }
  if (cleanUrl.includes("twitch.tv")) {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const timeStr = `${hours > 0 ? hours + 'h' : ''}${mins}m${secs}s`;
    return `${cleanUrl}${separator}t=${timeStr}`;
  }

  return `${cleanUrl}${separator}t=${seconds}s`;
}

// Utility: Convert VOD timestamp string or seconds offset into absolute Local Clock Time (e.g., "00:00:40 (8:49 PM)")
function convertVodToLocalTime(timestampStr: string, sessionStartedAt?: string | Date | null): string {
  if (!timestampStr || timestampStr === "00:00:00") return "00:00:00";
  
  // Parse relative seconds from HH:MM:SS or MM:SS
  const parts = timestampStr.trim().split(":").map(Number);
  let relativeSeconds = 0;
  if (parts.length === 3 && !parts.some(isNaN)) relativeSeconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
  else if (parts.length === 2 && !parts.some(isNaN)) relativeSeconds = parts[0] * 60 + parts[1];
  else if (parts.length === 1 && !isNaN(parts[0])) relativeSeconds = parts[0];

  // Base date calculation: parse startedAt ISO string safely
  let startDate: Date;
  if (sessionStartedAt) {
    startDate = typeof sessionStartedAt === "string" ? new Date(sessionStartedAt) : sessionStartedAt;
  } else {
    // If startedAt is missing, compute relative offset from top of hour for display stability
    const now = new Date();
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0);
  }

  if (isNaN(startDate.getTime())) {
    return timestampStr;
  }

  const absoluteDate = new Date(startDate.getTime() + relativeSeconds * 1000);
  const localTimeStr = absoluteDate.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });

  return `${timestampStr} (${localTimeStr})`;
}

const EditorialCard: React.FC<{ highlight: EditorialHighlight; vodUrl?: string | null; sessionStartedAt?: string | Date | null; onShowEvidence: (hl: any) => void }> = ({ highlight, vodUrl, sessionStartedAt, onShowEvidence }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const rawHl = highlight as any;
  const pubPkg = rawHl.publishingPackage || rawHl.publishingStrategy || null;
  const clipWin = rawHl.clipWindow || rawHl.timeline || null;
  const viralScores = pubPkg?.viralScores || rawHl.performancePrediction || null;
  const thumbIdea = pubPkg?.thumbnailIdea || rawHl.thumbnailRecommendation || null;

  // Exact JSON clipWindow property mappings
  const streamStart = clipWin?.startFormatted || clipWin?.clipStartTimestamp || clipWin?.streamStartTimestamp || rawHl.timestamp || "00:00:00";
  const streamEnd = clipWin?.endFormatted || clipWin?.clipEndTimestamp || clipWin?.streamEndTimestamp || "00:00:00";
  const peakTime = clipWin?.peakTimestamp || clipWin?.peakFormatted || "00:00:00";
  const hookTime = clipWin?.hookTimestamp || streamStart;

  // Calculate Build-up midpoint timestamp string between Hook and Peak
  const parseSec = (ts: string) => {
    const p = ts.split(":").map(Number);
    return p.length === 3 ? p[0] * 3600 + p[1] * 60 + p[2] : p.length === 2 ? p[0] * 60 + p[1] : 0;
  };
  const hookSec = parseSec(hookTime);
  const peakSec = parseSec(peakTime);
  const buildupSec = Math.round((hookSec + (peakSec > hookSec ? peakSec : hookSec + 15)) / 2);
  const buildupMinutes = Math.floor((buildupSec % 3600) / 60);
  const buildupSeconds = buildupSec % 60;
  const buildupHours = Math.floor(buildupSec / 3600);
  const buildupTime = `${String(buildupHours).padStart(2, "0")}:${String(buildupMinutes).padStart(2, "0")}:${String(buildupSeconds).padStart(2, "0")}`;

  // Scores (Virality, Replay, Overall)
  const viralityScore = viralScores?.virality ?? 50;
  const replayScore = viralScores?.replay ?? 50;
  const overallScore = viralScores?.overallPublishScore ?? viralScores?.overall ?? 50;

  // Title Studio Suggestions & Captions
  const ytTitle = pubPkg?.youtubeTitle || rawHl.titleSuggestions?.seo?.title || (pubPkg ? rawHl.title : null);
  const tiktokCaption = pubPkg?.tiktokTitle || rawHl.titleSuggestions?.tiktok?.title || null;
  const ctrTitle = rawHl.titleSuggestions?.ctr?.title || ytTitle;

  // Fallback structures with graceful '⚡ AI Processing...' badges when publishingPackage is pending
  const hl = {
    ...highlight,
    timeline: {
      streamStartTimestamp: streamStart,
      streamEndTimestamp: streamEnd,
      peakTimestamp: peakTime,
      clipStartTimestamp: streamStart,
      clipEndTimestamp: streamEnd,
      durationSeconds: clipWin?.durationSeconds || 0,
      visualBar: clipWin?.visualBar || "░░░░░░░░░░░░░░░░░░░░",
      startFormatted: streamStart,
      endFormatted: streamEnd,
      durationFormatted: `${clipWin?.durationSeconds || 0}s`
    },
    clipStructure: rawHl.clipStructure || {
      hook: { label: "Hook", timestampFormatted: streamStart, description: "Initial event hook" },
      buildUp: { label: "Build Up", timestampFormatted: peakTime !== "00:00:00" ? peakTime : streamStart, description: "Chat momentum build-up" },
      peak: { label: "Peak", timestampFormatted: peakTime, description: "Peak emotion / velocity spike" },
      ending: { label: "Ending", timestampFormatted: streamEnd, description: "Event resolution" }
    },
    whyPicked: rawHl.whyPicked || rawHl.evidenceJustification || [rawHl.triggerReason || "High audience engagement spike detected"],
    performancePrediction: {
      virality: viralityScore,
      replay: replayScore,
      ctr: viralScores?.ctr ?? 50,
      retention: viralScores?.retention ?? 50,
      community: viralScores?.community ?? 50,
      overall: overallScore,
      explanation: viralScores?.explanation || (pubPkg ? "Score computed from verified telemetry" : "⚡ AI computing virality score breakdown..."),
      scoreBreakdown: viralScores?.scoreBreakdown || []
    },
    editorSummary: rawHl.editorSummary || pubPkg?.editorialReasoning || (pubPkg ? rawHl.title : "⚡ Senior AI Editor generating summary narrative..."),
    editingInstructions: rawHl.editingInstructions || {
      keep: pubPkg ? ["Keep core reaction spike", "Maintain chat overlay"] : ["⚡ AI analyzing facecam zoom timing..."],
      trim: pubPkg ? ["Trim trailing low-velocity chatter"] : ["⚡ AI analyzing silence window..."],
      facecamImportance: "High",
      subtitleRecommendation: true,
      subtitleReason: pubPkg ? "Strong verbal reaction" : "⚡ Generating subtitle style recommendations..."
    },
    publishingStrategy: {
      bestPlatform: pubPkg?.bestPlatform || "YouTube Shorts",
      secondaryPlatform: pubPkg?.secondaryPlatform || "TikTok",
      why: pubPkg?.why || "⚡ AI analyzing platform virality fit...",
      audience: pubPkg?.audience || "General Community",
      recommendedUploadTime: pubPkg?.recommendedUploadTime || "⚡ AI computing peak upload window...",
      recommendedThumbnailEmotion: thumbIdea?.expression || "⚡ Frame emotion analysis in progress...",
      recommendedSubtitleStyle: pubPkg?.recommendedSubtitleStyle || "Animated Subtitles",
      priorityWindow: pubPkg?.priorityWindow || "Today",
      reasoning: pubPkg?.reasoning || "⚡ AI generating publishing brief..."
    },
    titleSuggestions: {
      curiosity: { title: rawHl.titleSuggestions?.curiosity?.title || (pubPkg ? `Wait for the end... (${ytTitle})` : "⚡ AI Generating Hook..."), reason: "Curiosity trigger" },
      seo: { title: ytTitle || "⚡ AI Generating Title...", reason: "Search & SEO optimized" },
      ctr: { title: ctrTitle || "⚡ AI Generating CTR Title...", reason: "High CTR clickability" },
      tiktok: { title: tiktokCaption || "⚡ AI Generating Caption...", reason: "Short-form virality" },
      shorts: { title: ytTitle || "⚡ AI Generating Shorts Title...", reason: "Retention trigger" }
    },
    thumbnailRecommendation: {
      frameTimestamp: thumbIdea?.frameTimestamp || peakTime,
      expression: thumbIdea?.expression || "⚡ Analyzing Facial Expression...",
      overlayText: thumbIdea?.overlayText || "⚡ Generating Text...",
      focusArea: thumbIdea?.focusArea || "Facecam + Chat Overlay",
      eyeContact: thumbIdea?.eyeContact || "Direct Camera Focus",
      brightness: "110% Boost",
      sceneClarity: "High",
      reason: thumbIdea?.reason || "⚡ Selecting highest-emotion frame..."
    }
  };

  const handleTimestampClick = (e: React.MouseEvent, timestamp: string, label: string) => {
    e.stopPropagation();
    console.log(`[Seek Event] Opening VOD at timestamp: ${timestamp} (${label})`);
    const event = new CustomEvent("playerSeek", { detail: { timestamp, label } });
    window.dispatchEvent(event);
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

          {/* Absolute timestamps with Dual VOD + Local Clock Time & External VOD Link */}
          <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(0,0,0,0.5)", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", fontSize: "12px", color: "#94a3b8", fontWeight: "600" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <a
                  href={generateVodUrl(vodUrl || rawHl.streamUrl, hl.timeline.streamStartTimestamp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#38bdf8", textDecoration: "underline", cursor: "pointer", transition: "all 0.15s ease", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  onClick={(e) => handleTimestampClick(e, hl.timeline.streamStartTimestamp, "Event Start")}
                >
                  <span>Stream Range: {convertVodToLocalTime(hl.timeline.streamStartTimestamp, sessionStartedAt)}</span>
                  <span style={{ fontSize: "10px", opacity: 0.8 }}>↗</span>
                </a>
                <span>→</span>
                <a
                  href={generateVodUrl(vodUrl || rawHl.streamUrl, hl.timeline.streamEndTimestamp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#38bdf8", textDecoration: "underline", cursor: "pointer", transition: "all 0.15s ease", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  onClick={(e) => handleTimestampClick(e, hl.timeline.streamEndTimestamp, "Event End")}
                >
                  <span>{convertVodToLocalTime(hl.timeline.streamEndTimestamp, sessionStartedAt)}</span>
                  <span style={{ fontSize: "10px", opacity: 0.8 }}>↗</span>
                </a>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span style={{ color: "#facc15" }}>Peak:</span>
                <a
                  href={generateVodUrl(vodUrl || rawHl.streamUrl, hl.timeline.peakTimestamp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#facc15", textDecoration: "underline", cursor: "pointer", transition: "all 0.15s ease", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  onClick={(e) => handleTimestampClick(e, hl.timeline.peakTimestamp, "Metrics Peak")}
                >
                  <span>{convertVodToLocalTime(hl.timeline.peakTimestamp, sessionStartedAt)}</span>
                  <span style={{ fontSize: "10px", opacity: 0.8 }}>↗</span>
                </a>
              </div>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <span style={{ color: "#4ade80" }}>Recommended Clip:</span>
                <a
                  href={generateVodUrl(vodUrl || rawHl.streamUrl, hl.timeline.clipStartTimestamp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#4ade80", textDecoration: "underline", cursor: "pointer", transition: "all 0.15s ease", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  onClick={(e) => handleTimestampClick(e, hl.timeline.clipStartTimestamp, "Recommended Clip Start")}
                >
                  <span>{convertVodToLocalTime(hl.timeline.clipStartTimestamp, sessionStartedAt)}</span>
                  <span style={{ fontSize: "10px", opacity: 0.8 }}>↗</span>
                </a>
                <span>→</span>
                <a
                  href={generateVodUrl(vodUrl || rawHl.streamUrl, hl.timeline.clipEndTimestamp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "#4ade80", textDecoration: "underline", cursor: "pointer", transition: "all 0.15s ease", display: "inline-flex", alignItems: "center", gap: "4px" }}
                  onClick={(e) => handleTimestampClick(e, hl.timeline.clipEndTimestamp, "Recommended Clip End")}
                >
                  <span>{convertVodToLocalTime(hl.timeline.clipEndTimestamp, sessionStartedAt)}</span>
                  <span style={{ fontSize: "10px", opacity: 0.8 }}>↗</span>
                </a>
              </div>
            </div>
            <div style={{ fontFamily: "monospace", letterSpacing: "2px", fontSize: "13px", color: "#38bdf8", overflow: "hidden" }}>
              {hl.timeline.visualBar}
            </div>
          </div>

          {/* Correct Segment Box Mapping: Hook, Build Up, Peak, Ending with VOD Links */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "8px" }}>
            <a
              href={generateVodUrl(vodUrl || rawHl.streamUrl, hookTime)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ padding: "8px 10px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", cursor: "pointer", textDecoration: "none", transition: "all 0.15s ease" }}
              onClick={(e) => handleTimestampClick(e, hookTime, "Hook")}
            >
              <span style={{ fontSize: "10px", fontWeight: "800", color: "#fca5a5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>HOOK ({hookTime})</span>
                <span style={{ fontSize: "9px", opacity: 0.8 }}>↗</span>
              </span>
              <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#cbd5e1" }}>Initial audience hook & reaction trigger</p>
            </a>

            <a
              href={generateVodUrl(vodUrl || rawHl.streamUrl, buildupTime)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ padding: "8px 10px", borderRadius: "8px", background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.2)", cursor: "pointer", textDecoration: "none", transition: "all 0.15s ease" }}
              onClick={(e) => handleTimestampClick(e, buildupTime, "Build Up")}
            >
              <span style={{ fontSize: "10px", fontWeight: "800", color: "#fde047", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>BUILD UP ({buildupTime})</span>
                <span style={{ fontSize: "9px", opacity: 0.8 }}>↗</span>
              </span>
              <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#cbd5e1" }}>Pacing ramp between hook & peak</p>
            </a>

            <a
              href={generateVodUrl(vodUrl || rawHl.streamUrl, peakTime)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ padding: "8px 10px", borderRadius: "8px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.2)", cursor: "pointer", textDecoration: "none", transition: "all 0.15s ease" }}
              onClick={(e) => handleTimestampClick(e, peakTime, "Peak")}
            >
              <span style={{ fontSize: "10px", fontWeight: "800", color: "#6ee7b7", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>PEAK ({peakTime})</span>
                <span style={{ fontSize: "9px", opacity: 0.8 }}>↗</span>
              </span>
              <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#cbd5e1" }}>Maximum chat velocity & emotion spike</p>
            </a>

            <a
              href={generateVodUrl(vodUrl || rawHl.streamUrl, streamEnd)}
              target="_blank"
              rel="noopener noreferrer"
              style={{ padding: "8px 10px", borderRadius: "8px", background: "rgba(59, 130, 246, 0.1)", border: "1px solid rgba(59, 130, 246, 0.2)", cursor: "pointer", textDecoration: "none", transition: "all 0.15s ease" }}
              onClick={(e) => handleTimestampClick(e, streamEnd, "Ending")}
            >
              <span style={{ fontSize: "10px", fontWeight: "800", color: "#93c5fd", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>ENDING ({streamEnd})</span>
                <span style={{ fontSize: "9px", opacity: 0.8 }}>↗</span>
              </span>
              <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#cbd5e1" }}>Segment payoff & CTA resolution</p>
            </a>
          </div>

          {/* Breakdown & Why Picked */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "12px" }}>
            <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#34d399", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                📊 Score Explainability
              </span>
              <div style={{ fontSize: "12px", color: "#cbd5e1" }}>
                <strong>Overall Score {hl.performancePrediction.overall}/100</strong>
                <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                  Scorecard Dimension Breakdown:
                </div>
                <ul style={{ margin: "6px 0 0", paddingLeft: "16px", fontSize: "11px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  {rawHl.scorecard ? (
                    Object.entries(rawHl.scorecard).map(([key, val]: [string, any]) => {
                      if (!val || typeof val !== "object" || typeof val.score !== "number") return null;
                      const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());
                      return (
                        <li key={key} style={{ color: "#e2e8f0" }}>
                          <strong style={{ color: "#34d399" }}>{val.score}/100</strong> {label}: <span style={{ color: "#94a3b8" }}>{val.why || "Measured from telemetry"}</span>
                        </li>
                      );
                    }).filter(Boolean)
                  ) : hl.performancePrediction.scoreBreakdown && hl.performancePrediction.scoreBreakdown.length > 0 ? (
                    hl.performancePrediction.scoreBreakdown.map((item: any, idx: number) => (
                      <li key={idx}>
                        <strong style={{ color: "#34d399" }}>+{item.value}</strong> {item.label}
                      </li>
                    ))
                  ) : (
                    <li style={{ color: "#94a3b8" }}>⚡ Scorecard metrics calibrating...</li>
                  )}
                </ul>
              </div>
            </div>

            <div style={{ padding: "12px", borderRadius: "10px", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#c084fc", textTransform: "uppercase", display: "block", marginBottom: "8px" }}>
                🎯 Why This Was Selected
              </span>
              <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "11px", color: "#cbd5e1", display: "flex", flexDirection: "column", gap: "4px" }}>
                {hl.whyPicked.map((reason: string, idx: number) => (
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
                {hl.editingInstructions.keep.map((k: string, i: number) => (
                  <li key={i} style={{ color: "#4ade80" }}>{k}</li>
                ))}
                {hl.editingInstructions.trim.map((t: string, i: number) => (
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
              {(!rawHl.publishingPackage && hl.publishingStrategy.reasoning.includes("⚡")) ? (
                <p style={{ margin: 0, fontSize: "11px", color: "#c084fc", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>⚡ AI generating publishing brief...</span>
                </p>
              ) : (
                <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "4px" }}>
                  {hl.publishingStrategy.reasoning}
                </p>
              )}
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

