"use client";

import React, { useState } from "react";
import { CompletedSessionBundle } from "@/lib/session/completedBundle";
import { FinalSessionSummary } from "@/lib/session/lifecycle";
import { ContentStrategyEngine } from "@/lib/contentStrategy/generator";
import { TimelineNavigator } from "@/lib/timeline/navigator";
import { useApp } from "@/context/AppContext";

interface CompletedContentStrategyProps {
  bundle?: CompletedSessionBundle | null;
  sessionSummary?: FinalSessionSummary | null;
}

export const CompletedContentStrategy: React.FC<CompletedContentStrategyProps> = ({
  bundle,
  sessionSummary,
}) => {
  const { theme } = useApp();
  const isDark = theme === "dark";

  const [activeTitleTab, setActiveTitleTab] = useState<string>("Curiosity");
  const report = ContentStrategyEngine.generateReport(bundle || null);
  const { executiveBrief, topAssets, titleOptions, thumbnailAdvice, hookStrategy, publishingCalendar, missedOpportunities, nextStreamChecklist } = report;

  const cardBg = isDark ? "rgba(13, 16, 27, 0.85)" : "#ffffff";
  const cardBorder = isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)";
  const cardShadow = isDark ? "none" : "0 4px 16px rgba(0, 0, 0, 0.04)";
  const innerBg = isDark ? "rgba(255, 255, 255, 0.02)" : "#f8fafc";
  const innerBorder = isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid #e2e8f0";
  const textTitle = isDark ? "#f8fafc" : "#0f172a";
  const textMuted = isDark ? "#94a3b8" : "#64748b";
  const textBody = isDark ? "#cbd5e1" : "#475569";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontFamily: "'Inter', sans-serif" }}>
      
      {/* 1. Executive Publishing Brief Banner */}
      <div
        style={{
          padding: "24px",
          borderRadius: "20px",
          background: isDark
            ? "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)"
            : "linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%)",
          border: isDark ? "1px solid rgba(99, 102, 241, 0.35)" : "1px solid #c7d2fe",
          boxShadow: cardShadow,
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "12px", background: isDark ? "rgba(99, 102, 241, 0.25)" : "#c7d2fe", color: isDark ? "#818cf8" : "#3730a3", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>
            📈 EXECUTIVE PUBLISHING BRIEF
          </div>
          <div style={{ fontSize: "11px", color: textMuted, fontWeight: "700" }}>
            Generated Post-Broadcast Strategy
          </div>
        </div>

        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: textTitle }}>
          Stream Content Yield
        </h3>

        <p style={{ margin: 0, fontSize: "13px", color: textBody, lineHeight: 1.6 }}>
          "{executiveBrief.summaryText}"
        </p>

        {/* Tally Metrics Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginTop: "4px" }}>
          <div style={{ padding: "10px", borderRadius: "10px", background: innerBg, border: innerBorder, textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: textMuted }}>Shorts</div>
            <div style={{ fontSize: "16px", fontWeight: "900", color: isDark ? "#34d399" : "#059669" }}>{executiveBrief.shortsCount} Assets</div>
          </div>
          <div style={{ padding: "10px", borderRadius: "10px", background: innerBg, border: innerBorder, textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: textMuted }}>Highlights</div>
            <div style={{ fontSize: "16px", fontWeight: "900", color: isDark ? "#60a5fa" : "#2563eb" }}>{executiveBrief.highlightsCount} Video</div>
          </div>
          <div style={{ padding: "10px", borderRadius: "10px", background: innerBg, border: innerBorder, textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: textMuted }}>Thumbnails</div>
            <div style={{ fontSize: "16px", fontWeight: "900", color: isDark ? "#c084fc" : "#7c3aed" }}>{executiveBrief.thumbnailCandidatesCount} Candidate</div>
          </div>
          <div style={{ padding: "10px", borderRadius: "10px", background: innerBg, border: innerBorder, textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: textMuted }}>Top Priority</div>
            <div style={{ fontSize: "12px", fontWeight: "800", color: isDark ? "#fb7185" : "#e11d48", marginTop: "2px" }}>Within 12 Hours</div>
          </div>
        </div>

        {/* Highest Priority Action Callout */}
        <div style={{ padding: "12px 14px", borderRadius: "10px", background: isDark ? "rgba(52, 211, 153, 0.08)" : "#d1fae5", border: isDark ? "1px solid rgba(52, 211, 153, 0.3)" : "1px solid #a7f3d0", fontSize: "12px", color: isDark ? "#34d399" : "#065f46", fontWeight: "700" }}>
          💡 Action Priority: {executiveBrief.highestPriorityAction}
        </div>
      </div>

      {/* 2. Top 5 Publishable Content Assets Grid */}
      <div style={{ padding: "20px", borderRadius: "16px", background: cardBg, border: cardBorder, boxShadow: cardShadow, display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ fontSize: "11px", fontWeight: "800", color: isDark ? "#60a5fa" : "#2563eb", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          🎯 Top 5 Publishable Content Assets
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {topAssets.map((asset, index) => (
            <div key={asset.id} style={{ padding: "18px", borderRadius: "14px", background: innerBg, border: innerBorder, display: "flex", flexDirection: "column", gap: "12px" }}>
              
              {/* Asset Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ padding: "4px 10px", borderRadius: "8px", background: isDark ? "rgba(96, 165, 250, 0.2)" : "#dbeafe", color: isDark ? "#60a5fa" : "#1e40af", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>
                    #{index + 1} {asset.assetType}
                  </span>
                  <span style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "6px", background: asset.priority === "Critical" ? (isDark ? "rgba(251, 113, 133, 0.2)" : "#ffe4e6") : (isDark ? "rgba(234, 179, 8, 0.2)" : "#fef3c7"), color: asset.priority === "Critical" ? (isDark ? "#fb7185" : "#be123c") : (isDark ? "#eab308" : "#92400e"), fontWeight: "800" }}>
                    {asset.priority} Priority
                  </span>
                </div>

                <div style={{ padding: "4px 10px", borderRadius: "8px", background: isDark ? "rgba(52, 211, 153, 0.15)" : "#d1fae5", color: isDark ? "#34d399" : "#065f46", fontSize: "12px", fontWeight: "900", fontFamily: "monospace" }}>
                  Publish Score {asset.viralScores.overallPublishScore}/100
                </div>
              </div>

              {/* Title & Hook */}
              <div>
                <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: textTitle }}>
                  "{asset.title}"
                </h4>
                <div style={{ fontSize: "12px", color: textBody, marginTop: "4px", fontStyle: "italic" }}>
                  Hook: "{asset.hook}"
                </div>
              </div>

              {/* Metadata Badges & Universal Timeline Seek */}
              <div style={{ display: "flex", gap: "16px", fontSize: "11px", color: textBody, background: isDark ? "rgba(0,0,0,0.2)" : "#f1f5f9", padding: "8px 12px", borderRadius: "8px", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", border: isDark ? "none" : "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  <span>Length: <strong style={{ color: isDark ? "#60a5fa" : "#2563eb" }}>{asset.recommendedDuration}</strong></span>
                  <span>Platform: <strong style={{ color: isDark ? "#34d399" : "#059669" }}>{asset.bestPlatform}</strong></span>
                  <span>Difficulty: <strong style={{ color: isDark ? "#c084fc" : "#7c3aed" }}>{asset.difficulty}</strong></span>
                  <span>Target: <strong style={{ color: textTitle }}>{asset.expectedAudience}</strong></span>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button
                    title="Inspect raw telemetry evidence: viewers, chat velocity, sentiment & replay score"
                    onClick={() => TimelineNavigator.seek("15:20:00", `Evidence for ${asset.title}`, "Publishing Strategy Evidence")}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      background: isDark ? "rgba(168, 85, 247, 0.15)" : "#f3e8ff",
                      border: isDark ? "1px solid rgba(168, 85, 247, 0.3)" : "1px solid #e9d5ff",
                      color: isDark ? "#c084fc" : "#6b21a8",
                      fontSize: "11px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    🔍 Show Evidence
                  </button>
                  <button
                    title="Jump to video: Seek stream player to asset position"
                    onClick={() => TimelineNavigator.seek("15:20:00", `Asset #${index + 1} (${asset.title})`, "Publishing Strategy")}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      background: isDark ? "rgba(56, 189, 248, 0.15)" : "#e0f2fe",
                      border: isDark ? "1px solid rgba(56, 189, 248, 0.3)" : "1px solid #bae6fd",
                      color: isDark ? "#38bdf8" : "#0284c7",
                      fontSize: "11px",
                      fontWeight: "700",
                      cursor: "pointer",
                    }}
                  >
                    ⏱️ Jump to Video
                  </button>
                </div>
              </div>

              {/* Why AI Selected & Evidence */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "11px" }}>
                <div style={{ padding: "10px", borderRadius: "8px", background: innerBg, border: innerBorder }}>
                  <div style={{ fontWeight: "700", color: isDark ? "#c084fc" : "#7c3aed", marginBottom: "4px" }}>Why AI Selected It:</div>
                  <div style={{ color: textBody, lineHeight: 1.5 }}>{asset.whyAiSelected}</div>
                </div>

                <div style={{ padding: "10px", borderRadius: "8px", background: innerBg, border: innerBorder }}>
                  <div style={{ fontWeight: "700", color: isDark ? "#34d399" : "#059669", marginBottom: "4px" }}>Verified Stream Evidence:</div>
                  <ul style={{ margin: 0, paddingLeft: "14px", color: textBody, lineHeight: 1.5 }}>
                    {asset.evidence.map((ev, idx) => (
                      <li key={idx}>{ev}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Creator Action Checklist */}
              <div style={{ padding: "10px", borderRadius: "8px", background: isDark ? "rgba(52, 211, 153, 0.05)" : "#ecfdf5", border: isDark ? "1px solid rgba(52, 211, 153, 0.15)" : "1px solid #a7f3d0" }}>
                <div style={{ fontSize: "11px", fontWeight: "800", color: isDark ? "#34d399" : "#059669", marginBottom: "6px" }}>
                  📋 Creator Action Checklist:
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "11px", color: textBody }}>
                  {asset.checklist.map((chk, idx) => (
                    <div key={idx} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>✓</span>
                      <span>{chk}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Title Optimizer & Thumbnail Advisor Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        
        {/* Title Optimizer */}
        <div style={{ padding: "20px", borderRadius: "16px", background: cardBg, border: cardBorder, boxShadow: cardShadow, display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ fontSize: "11px", fontWeight: "800", color: isDark ? "#c084fc" : "#7c3aed", textTransform: "uppercase" }}>
            ✍️ Title Optimizer (3 Strategy Variations)
          </div>

          <div style={{ display: "flex", gap: "6px" }}>
            {titleOptions.map((opt) => (
              <button
                key={opt.type}
                onClick={() => setActiveTitleTab(opt.type)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "8px",
                  border: "none",
                  background: activeTitleTab === opt.type ? (isDark ? "rgba(168, 85, 247, 0.2)" : "#f3e8ff") : (isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9"),
                  color: activeTitleTab === opt.type ? (isDark ? "#c084fc" : "#6b21a8") : textMuted,
                  fontSize: "11px",
                  fontWeight: "700",
                  cursor: "pointer",
                }}
              >
                {opt.type}
              </button>
            ))}
          </div>

          {titleOptions
            .filter((opt) => opt.type === activeTitleTab)
            .map((opt) => (
              <div key={opt.type} style={{ padding: "14px", borderRadius: "10px", background: isDark ? "rgba(168, 85, 247, 0.06)" : "#faf5ff", border: isDark ? "1px solid rgba(168, 85, 247, 0.2)" : "1px solid #e9d5ff", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ fontSize: "14px", fontWeight: "800", color: textTitle }}>
                  "{opt.title}"
                </div>
                <div style={{ fontSize: "12px", color: textBody, lineHeight: 1.5 }}>
                  {opt.explanation}
                </div>
              </div>
            ))}
        </div>

        {/* Thumbnail Advisor */}
        <div style={{ padding: "20px", borderRadius: "16px", background: cardBg, border: cardBorder, boxShadow: cardShadow, display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ fontSize: "11px", fontWeight: "800", color: isDark ? "#eab308" : "#d97706", textTransform: "uppercase" }}>
            🖼️ Thumbnail Advisor
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px", color: textBody }}>
            <div style={{ padding: "10px", borderRadius: "8px", background: innerBg, border: innerBorder }}>
              <span style={{ color: textMuted }}>Face Reaction:</span> <strong style={{ color: textTitle }}>{thumbnailAdvice.faceReaction}</strong>
            </div>
            <div style={{ padding: "10px", borderRadius: "8px", background: innerBg, border: innerBorder }}>
              <span style={{ color: textMuted }}>Text Overlay:</span> <strong style={{ color: isDark ? "#eab308" : "#d97706" }}>"{thumbnailAdvice.recommendedText}"</strong>
            </div>
            <div style={{ padding: "10px", borderRadius: "8px", background: innerBg, border: innerBorder }}>
              <span style={{ color: textMuted }}>Concept:</span> <span style={{ color: textBody }}>{thumbnailAdvice.conceptDescription}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Hook Optimizer & Publishing Calendar Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        
        {/* Hook Optimizer */}
        <div style={{ padding: "20px", borderRadius: "16px", background: cardBg, border: cardBorder, boxShadow: cardShadow, display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontSize: "11px", fontWeight: "800", color: isDark ? "#34d399" : "#059669", textTransform: "uppercase" }}>
            🪝 Hook Optimizer (First 5 Seconds)
          </div>

          <div style={{ fontSize: "12px", color: textBody, display: "flex", flexDirection: "column", gap: "8px" }}>
            <div>• <strong style={{ color: isDark ? "#34d399" : "#059669" }}>Visual Sequence:</strong> {hookStrategy.visualSequence}</div>
            <div>• <strong style={{ color: isDark ? "#60a5fa" : "#2563eb" }}>Opening Sentence:</strong> "{hookStrategy.openingSentence}"</div>
            <div>• <strong style={{ color: isDark ? "#c084fc" : "#7c3aed" }}>Pacing:</strong> {hookStrategy.recommendedPacing}</div>
            <div>• <strong style={{ color: isDark ? "#eab308" : "#d97706" }}>Captions Style:</strong> {hookStrategy.captionsStyle}</div>
          </div>
        </div>

        {/* Publishing Calendar */}
        <div style={{ padding: "20px", borderRadius: "16px", background: cardBg, border: cardBorder, boxShadow: cardShadow, display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontSize: "11px", fontWeight: "800", color: isDark ? "#60a5fa" : "#2563eb", textTransform: "uppercase" }}>
            📅 Content Publishing Calendar
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {publishingCalendar.map((cal, idx) => (
              <div key={idx} style={{ padding: "8px 12px", borderRadius: "8px", background: innerBg, border: innerBorder, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px" }}>
                <span style={{ fontWeight: "800", color: isDark ? "#60a5fa" : "#2563eb", width: "90px" }}>{cal.dayLabel}</span>
                <span style={{ color: textTitle, flex: 1 }}>{cal.assetTitle}</span>
                <span style={{ color: isDark ? "#34d399" : "#059669", fontWeight: "700" }}>{cal.platform}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Missed Opportunities & Next Stream Checklist */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        
        {/* Missed Opportunities */}
        <div style={{ padding: "20px", borderRadius: "16px", background: cardBg, border: cardBorder, boxShadow: cardShadow, display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontSize: "11px", fontWeight: "800", color: isDark ? "#fb7185" : "#e11d48", textTransform: "uppercase" }}>
            ⚠️ Content Opportunities Missed
          </div>

          {missedOpportunities.map((m, idx) => (
            <div key={idx} style={{ padding: "10px", borderRadius: "8px", background: isDark ? "rgba(251, 113, 133, 0.06)" : "#fff1f2", border: isDark ? "1px solid rgba(251, 113, 133, 0.2)" : "1px solid #fecdd3", fontSize: "11px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ fontWeight: "800", color: isDark ? "#fb7185" : "#e11d48" }}>{m.title}</div>
              <div style={{ color: textBody }}>{m.reasonIgnored}</div>
            </div>
          ))}
        </div>

        {/* Next Stream Checklist */}
        <div style={{ padding: "20px", borderRadius: "16px", background: cardBg, border: cardBorder, boxShadow: cardShadow, display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontSize: "11px", fontWeight: "800", color: isDark ? "#34d399" : "#059669", textTransform: "uppercase" }}>
            ✅ Next Stream Preparation Checklist
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px", color: textBody }}>
            {nextStreamChecklist.map((chk, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 10px", borderRadius: "6px", background: innerBg, border: innerBorder }}>
                <span>[ ]</span>
                <span>{chk.item}</span>
                <span style={{ marginLeft: "auto", fontSize: "9px", color: textMuted }}>{chk.category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
