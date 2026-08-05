"use client";

import React, { useState } from "react";
import { FinalSessionSummary } from "@/lib/session/lifecycle";
import { TimelineNavigator } from "@/lib/timeline/navigator";
import { CanonicalHighlight } from "@/lib/intelligence/canonicalTypes";

interface CompletedHighlightsProps {
  highlights?: CanonicalHighlight[];
  session?: any;
  summary?: FinalSessionSummary | null;
}

export const CompletedHighlights: React.FC<CompletedHighlightsProps> = ({
  highlights = [],
  session,
  summary,
}) => {
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({
    highlight_001: true,
  });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleTimestampClick = (e: React.MouseEvent, timestamp: string, label: string) => {
    e.stopPropagation();
    TimelineNavigator.open({
      timestamp,
      label,
      source: "Highlight Studio",
      platform: session?.platform || summary?.platformDisplayName,
      vodUrl: session?.streamUrl || session?.vodUrl || (summary as any)?.streamUrl,
      sessionId: session?.id || summary?.sessionId,
    });
  };

  const count = highlights.length;

  if (count === 0) {
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
          No Editorial Highlights Approved
        </h3>
        <p style={{ fontSize: "14px", color: "#94a3b8", maxWidth: "480px", margin: "0 auto" }}>
          This session did not produce qualifying peak moments exceeding our strict evidence thresholds, or stream duration was too brief.
        </p>
      </div>
    );
  }

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
      {/* 1. Header Banner */}
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
          <div
            style={{
              fontSize: "11px",
              fontWeight: "800",
              color: "#c084fc",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            Canonical Post-Stream Intelligence
          </div>
          <h2 style={{ margin: "4px 0 2px", fontSize: "20px", fontWeight: "800", color: "#f8fafc" }}>
            Approved Editorial Highlights & Clips
          </h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
            Evidence-ranked short-form candidates with 1-to-1 publishing packages.
          </p>
        </div>

        <div
          style={{
            padding: "8px 14px",
            borderRadius: "20px",
            background: "rgba(0,0,0,0.4)",
            border: "1px solid rgba(255,255,255,0.1)",
            fontSize: "12px",
            color: "#34d399",
            fontWeight: "700",
          }}
        >
          ✨ {count} Approved Moment{count > 1 ? "s" : ""}
        </div>
      </div>

      {/* 2. Highlights List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {highlights.map((hl, idx) => {
          const isExpanded = !!expandedIds[hl.highlightId];
          const pkg = hl.publishingPackage;

          return (
            <div
              key={hl.highlightId}
              onClick={() => toggleExpand(hl.highlightId)}
              style={{
                padding: "20px",
                borderRadius: "16px",
                background: "rgba(13, 16, 27, 0.85)",
                border: isExpanded
                  ? "1px solid rgba(168, 85, 247, 0.45)"
                  : "1px solid rgba(255, 255, 255, 0.1)",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {/* Header Card */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "6px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "800",
                        padding: "3px 10px",
                        borderRadius: "12px",
                        background:
                          idx === 0
                            ? "linear-gradient(90deg, #f59e0b, #d97706)"
                            : idx === 1
                            ? "linear-gradient(90deg, #94a3b8, #64748b)"
                            : "rgba(255, 255, 255, 0.1)",
                        color: "#fff",
                      }}
                    >
                      {hl.rankTitle}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "700",
                        padding: "3px 10px",
                        borderRadius: "12px",
                        background: "rgba(147, 51, 234, 0.15)",
                        color: "#c084fc",
                      }}
                    >
                      {hl.category}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#38bdf8",
                        fontWeight: "700",
                        fontFamily: "monospace",
                        background: "rgba(56, 189, 248, 0.1)",
                        padding: "2px 8px",
                        borderRadius: "6px",
                      }}
                      onClick={(e) => handleTimestampClick(e, hl.timestamp, hl.title)}
                    >
                      ⏱️ {hl.timestamp} ({hl.durationFormatted})
                    </span>
                  </div>

                  <h3
                    style={{
                      margin: "4px 0 0",
                      fontSize: "17px",
                      fontWeight: "800",
                      color: "#f8fafc",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: "#a855f7" }}>
                      {isExpanded ? "▼" : "▶"}
                    </span>
                    {hl.badgeIcon} {hl.title}
                  </h3>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: "4px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      color: "#34d399",
                      fontWeight: "800",
                      background: "rgba(52,211,153,0.1)",
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: "1px solid rgba(52,211,153,0.2)",
                    }}
                  >
                    Score: {hl.score}/100
                  </div>
                  <span style={{ fontSize: "10px", color: "#64748b" }}>
                    Click to {isExpanded ? "Collapse" : "Expand Publishing Package"}
                  </span>
                </div>
              </div>

              {/* Expanded Card Details */}
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
                  {/* Editor Summary & Trigger */}
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#cbd5e1",
                      lineHeight: "1.5",
                      background: "rgba(255,255,255,0.02)",
                      padding: "14px",
                      borderRadius: "10px",
                      borderLeft: "3px solid #3b82f6",
                    }}
                  >
                    <strong
                      style={{
                        color: "#93c5fd",
                        display: "block",
                        marginBottom: "4px",
                        fontSize: "11px",
                        textTransform: "uppercase",
                      }}
                    >
                      Trigger Reason:
                    </strong>
                    {hl.triggerReason}
                  </div>

                  {/* 3-Pillar Evidence Grid */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                      gap: "12px",
                    }}
                  >
                    {/* Viewer Evidence */}
                    <div
                      style={{
                        padding: "14px",
                        borderRadius: "12px",
                        background: "rgba(0,0,0,0.3)",
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: "800",
                          color: "#60a5fa",
                          textTransform: "uppercase",
                          marginBottom: "6px",
                        }}
                      >
                        👥 Viewer Delta Evidence
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: "800", color: "#f8fafc" }}>
                        +{hl.viewerEvidence.viewerDelta} Viewers Joined
                      </div>
                      <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#94a3b8" }}>
                        {hl.viewerEvidence.description}
                      </p>
                    </div>

                    {/* Chat Evidence */}
                    <div
                      style={{
                        padding: "14px",
                        borderRadius: "12px",
                        background: "rgba(0,0,0,0.3)",
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: "800",
                          color: "#a78bfa",
                          textTransform: "uppercase",
                          marginBottom: "6px",
                        }}
                      >
                        💬 Chat Velocity & Emotes
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: "800", color: "#f8fafc" }}>
                        {hl.chatEvidence.velocity} msgs/min surge
                      </div>
                      <div style={{ display: "flex", gap: "4px", marginTop: "4px" }}>
                        {hl.chatEvidence.topEmotes.map((em, i) => (
                          <span
                            key={i}
                            style={{
                              padding: "2px 6px",
                              borderRadius: "4px",
                              background: "rgba(255,255,255,0.06)",
                              fontSize: "12px",
                            }}
                          >
                            {em}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Sentiment Evidence */}
                    <div
                      style={{
                        padding: "14px",
                        borderRadius: "12px",
                        background: "rgba(0,0,0,0.3)",
                        border: "1px solid rgba(255,255,255,0.05)",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: "800",
                          color: "#34d399",
                          textTransform: "uppercase",
                          marginBottom: "6px",
                        }}
                      >
                        ❤️ Sentiment & Emotion
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: "800", color: "#f8fafc" }}>
                        {hl.sentimentEvidence.sentimentScore}% Positive ({hl.sentimentEvidence.dominantEmotion})
                      </div>
                      <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#94a3b8" }}>
                        {hl.sentimentEvidence.description}
                      </p>
                    </div>
                  </div>

                  {/* 1-to-1 Publishing Package Callout */}
                  {pkg && (
                    <div
                      style={{
                        padding: "16px",
                        borderRadius: "14px",
                        background: "rgba(168, 85, 247, 0.08)",
                        border: "1px solid rgba(168, 85, 247, 0.25)",
                        display: "flex",
                        flexDirection: "column",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "12px",
                            fontWeight: "800",
                            color: "#c084fc",
                            textTransform: "uppercase",
                          }}
                        >
                          📦 Ready-to-Publish Package ({pkg.bestPlatform})
                        </span>
                        <span
                          style={{
                            fontSize: "11px",
                            padding: "2px 8px",
                            borderRadius: "6px",
                            background: "rgba(251, 113, 133, 0.2)",
                            color: "#fb7185",
                            fontWeight: "800",
                          }}
                        >
                          {pkg.priority} Priority
                        </span>
                      </div>

                      {/* YouTube Shorts Title */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          background: "rgba(0,0,0,0.3)",
                          padding: "10px 12px",
                          borderRadius: "8px",
                        }}
                      >
                        <div style={{ fontSize: "12px", color: "#f8fafc" }}>
                          <span style={{ color: "#94a3b8", marginRight: "6px" }}>YouTube:</span>
                          <strong>{pkg.youtubeTitle}</strong>
                        </div>
                        <button
                          onClick={() => copyToClipboard(pkg.youtubeTitle, `${hl.highlightId}_yt`)}
                          style={{
                            padding: "4px 8px",
                            borderRadius: "6px",
                            background: "rgba(255,255,255,0.08)",
                            border: "none",
                            color: copiedKey === `${hl.highlightId}_yt` ? "#34d399" : "#cbd5e1",
                            fontSize: "11px",
                            cursor: "pointer",
                          }}
                        >
                          {copiedKey === `${hl.highlightId}_yt` ? "✓ Copied" : "Copy"}
                        </button>
                      </div>

                      {/* TikTok Title */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          background: "rgba(0,0,0,0.3)",
                          padding: "10px 12px",
                          borderRadius: "8px",
                        }}
                      >
                        <div style={{ fontSize: "12px", color: "#f8fafc" }}>
                          <span style={{ color: "#94a3b8", marginRight: "6px" }}>TikTok:</span>
                          <strong>{pkg.tiktokTitle}</strong>
                        </div>
                        <button
                          onClick={() => copyToClipboard(pkg.tiktokTitle, `${hl.highlightId}_tt`)}
                          style={{
                            padding: "4px 8px",
                            borderRadius: "6px",
                            background: "rgba(255,255,255,0.08)",
                            border: "none",
                            color: copiedKey === `${hl.highlightId}_tt` ? "#34d399" : "#cbd5e1",
                            fontSize: "11px",
                            cursor: "pointer",
                          }}
                        >
                          {copiedKey === `${hl.highlightId}_tt` ? "✓ Copied" : "Copy"}
                        </button>
                      </div>

                      {/* Editing Checklist */}
                      <div style={{ fontSize: "11px", color: "#cbd5e1", marginTop: "4px" }}>
                        <strong style={{ color: "#93c5fd" }}>Editor Checklist:</strong>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: "6px",
                            marginTop: "6px",
                          }}
                        >
                          {pkg.checklist.map((item, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ color: "#34d399" }}>✓</span> {item}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
