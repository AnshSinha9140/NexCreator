"use client";

import React, { useState } from "react";
import { CompletedSessionBundle } from "@/lib/session/completedBundle";
import { FinalSessionSummary } from "@/lib/session/lifecycle";
import { ContentStrategyEngine } from "@/lib/contentStrategy/generator";
import { TimelineNavigator } from "@/lib/timeline/navigator";

interface CompletedContentStrategyProps {
  bundle?: CompletedSessionBundle | null;
  sessionSummary?: FinalSessionSummary | null;
}

export const CompletedContentStrategy: React.FC<CompletedContentStrategyProps> = ({
  bundle,
  sessionSummary,
}) => {
  const [activeTitleTab, setActiveTitleTab] = useState<string>("Curiosity");
  const report = ContentStrategyEngine.generateReport(bundle || null);
  const { executiveBrief, topAssets, titleOptions, thumbnailAdvice, hookStrategy, publishingCalendar, missedOpportunities, nextStreamChecklist } = report;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", fontFamily: "'Inter', sans-serif" }}>
      
      {/* 1. Executive Publishing Brief Banner */}
      <div
        style={{
          padding: "24px",
          borderRadius: "20px",
          background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%)",
          border: "1px solid rgba(99, 102, 241, 0.35)",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "4px 10px", borderRadius: "12px", background: "rgba(99, 102, 241, 0.25)", color: "#818cf8", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>
            📈 EXECUTIVE PUBLISHING BRIEF
          </div>
          <div style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "700" }}>
            Generated Post-Broadcast Strategy
          </div>
        </div>

        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#f8fafc" }}>
          Stream Content Yield
        </h3>

        <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1", lineHeight: 1.6 }}>
          "{executiveBrief.summaryText}"
        </p>

        {/* Tally Metrics Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginTop: "4px" }}>
          <div style={{ padding: "10px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>Shorts</div>
            <div style={{ fontSize: "16px", fontWeight: "900", color: "#34d399" }}>{executiveBrief.shortsCount} Assets</div>
          </div>
          <div style={{ padding: "10px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>Highlights</div>
            <div style={{ fontSize: "16px", fontWeight: "900", color: "#60a5fa" }}>{executiveBrief.highlightsCount} Video</div>
          </div>
          <div style={{ padding: "10px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>Thumbnails</div>
            <div style={{ fontSize: "16px", fontWeight: "900", color: "#c084fc" }}>{executiveBrief.thumbnailCandidatesCount} Candidate</div>
          </div>
          <div style={{ padding: "10px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", textAlign: "center" }}>
            <div style={{ fontSize: "10px", color: "#94a3b8" }}>Top Priority</div>
            <div style={{ fontSize: "12px", fontWeight: "800", color: "#fb7185", marginTop: "2px" }}>Within 12 Hours</div>
          </div>
        </div>

        {/* Highest Priority Action Callout */}
        <div style={{ padding: "12px 14px", borderRadius: "10px", background: "rgba(52, 211, 153, 0.08)", border: "1px solid rgba(52, 211, 153, 0.3)", fontSize: "12px", color: "#34d399", fontWeight: "700" }}>
          💡 Action Priority: {executiveBrief.highestPriorityAction}
        </div>
      </div>

      {/* 2. Top 5 Publishable Content Assets Grid */}
      <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ fontSize: "11px", fontWeight: "800", color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          🎯 Top 5 Publishable Content Assets
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {topAssets.map((asset, index) => (
            <div key={asset.id} style={{ padding: "18px", borderRadius: "14px", background: "rgba(255, 255, 255, 0.02)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "12px" }}>
              
              {/* Asset Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ padding: "4px 10px", borderRadius: "8px", background: "rgba(96, 165, 250, 0.2)", color: "#60a5fa", fontSize: "11px", fontWeight: "800", textTransform: "uppercase" }}>
                    #{index + 1} {asset.assetType}
                  </span>
                  <span style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "6px", background: asset.priority === "Critical" ? "rgba(251, 113, 133, 0.2)" : "rgba(234, 179, 8, 0.2)", color: asset.priority === "Critical" ? "#fb7185" : "#eab308", fontWeight: "800" }}>
                    {asset.priority} Priority
                  </span>
                </div>

                <div style={{ padding: "4px 10px", borderRadius: "8px", background: "rgba(52, 211, 153, 0.15)", color: "#34d399", fontSize: "12px", fontWeight: "900", fontFamily: "monospace" }}>
                  Publish Score {asset.viralScores.overallPublishScore}/100
                </div>
              </div>

              {/* Title & Hook */}
              <div>
                <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#f8fafc" }}>
                  "{asset.title}"
                </h4>
                <div style={{ fontSize: "12px", color: "#cbd5e1", marginTop: "4px", fontStyle: "italic" }}>
                  Hook: "{asset.hook}"
                </div>
              </div>

              {/* Metadata Badges & Universal Timeline Seek */}
              <div style={{ display: "flex", gap: "16px", fontSize: "11px", color: "#cbd5e1", background: "rgba(0,0,0,0.2)", padding: "8px 12px", borderRadius: "8px", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  <span>Length: <strong style={{ color: "#60a5fa" }}>{asset.recommendedDuration}</strong></span>
                  <span>Platform: <strong style={{ color: "#34d399" }}>{asset.bestPlatform}</strong></span>
                  <span>Difficulty: <strong style={{ color: "#c084fc" }}>{asset.difficulty}</strong></span>
                  <span>Target: <strong style={{ color: "#f8fafc" }}>{asset.expectedAudience}</strong></span>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button
                    title="Inspect raw telemetry evidence: viewers, chat velocity, sentiment & replay score"
                    onClick={() => TimelineNavigator.seek("15:20:00", `Evidence for ${asset.title}`, "Publishing Strategy Evidence")}
                    style={{
                      padding: "4px 10px",
                      borderRadius: "6px",
                      background: "rgba(168, 85, 247, 0.15)",
                      border: "1px solid rgba(168, 85, 247, 0.3)",
                      color: "#c084fc",
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
                      background: "rgba(56, 189, 248, 0.15)",
                      border: "1px solid rgba(56, 189, 248, 0.3)",
                      color: "#38bdf8",
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
                <div style={{ padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.02)" }}>
                  <div style={{ fontWeight: "700", color: "#c084fc", marginBottom: "4px" }}>Why AI Selected It:</div>
                  <div style={{ color: "#cbd5e1", lineHeight: 1.5 }}>{asset.whyAiSelected}</div>
                </div>

                <div style={{ padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.02)" }}>
                  <div style={{ fontWeight: "700", color: "#34d399", marginBottom: "4px" }}>Verified Stream Evidence:</div>
                  <ul style={{ margin: 0, paddingLeft: "14px", color: "#cbd5e1", lineHeight: 1.5 }}>
                    {asset.evidence.map((ev, idx) => (
                      <li key={idx}>{ev}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Creator Action Checklist */}
              <div style={{ padding: "10px", borderRadius: "8px", background: "rgba(52, 211, 153, 0.05)", border: "1px solid rgba(52, 211, 153, 0.15)" }}>
                <div style={{ fontSize: "11px", fontWeight: "800", color: "#34d399", marginBottom: "6px" }}>
                  📋 Creator Action Checklist:
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", fontSize: "11px", color: "#cbd5e1" }}>
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
        <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ fontSize: "11px", fontWeight: "800", color: "#c084fc", textTransform: "uppercase" }}>
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
                  background: activeTitleTab === opt.type ? "rgba(168, 85, 247, 0.2)" : "rgba(255,255,255,0.04)",
                  color: activeTitleTab === opt.type ? "#c084fc" : "#94a3b8",
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
              <div key={opt.type} style={{ padding: "14px", borderRadius: "10px", background: "rgba(168, 85, 247, 0.06)", border: "1px solid rgba(168, 85, 247, 0.2)", display: "flex", flexDirection: "column", gap: "8px" }}>
                <div style={{ fontSize: "14px", fontWeight: "800", color: "#f8fafc" }}>
                  "{opt.title}"
                </div>
                <div style={{ fontSize: "12px", color: "#cbd5e1", lineHeight: 1.5 }}>
                  {opt.explanation}
                </div>
              </div>
            ))}
        </div>

        {/* Thumbnail Advisor */}
        <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ fontSize: "11px", fontWeight: "800", color: "#eab308", textTransform: "uppercase" }}>
            🖼️ Thumbnail Advisor
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12px", color: "#cbd5e1" }}>
            <div style={{ padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.03)" }}>
              <span style={{ color: "#94a3b8" }}>Face Reaction:</span> <strong style={{ color: "#f8fafc" }}>{thumbnailAdvice.faceReaction}</strong>
            </div>
            <div style={{ padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.03)" }}>
              <span style={{ color: "#94a3b8" }}>Text Overlay:</span> <strong style={{ color: "#eab308" }}>"{thumbnailAdvice.recommendedText}"</strong>
            </div>
            <div style={{ padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.03)" }}>
              <span style={{ color: "#94a3b8" }}>Concept:</span> <span style={{ color: "#cbd5e1" }}>{thumbnailAdvice.conceptDescription}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Hook Optimizer & Publishing Calendar Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        
        {/* Hook Optimizer */}
        <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontSize: "11px", fontWeight: "800", color: "#34d399", textTransform: "uppercase" }}>
            🪝 Hook Optimizer (First 5 Seconds)
          </div>

          <div style={{ fontSize: "12px", color: "#cbd5e1", display: "flex", flexDirection: "column", gap: "8px" }}>
            <div>• <strong style={{ color: "#34d399" }}>Visual Sequence:</strong> {hookStrategy.visualSequence}</div>
            <div>• <strong style={{ color: "#60a5fa" }}>Opening Sentence:</strong> "{hookStrategy.openingSentence}"</div>
            <div>• <strong style={{ color: "#c084fc" }}>Pacing:</strong> {hookStrategy.recommendedPacing}</div>
            <div>• <strong style={{ color: "#eab308" }}>Captions Style:</strong> {hookStrategy.captionsStyle}</div>
          </div>
        </div>

        {/* Publishing Calendar */}
        <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontSize: "11px", fontWeight: "800", color: "#60a5fa", textTransform: "uppercase" }}>
            📅 Content Publishing Calendar
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {publishingCalendar.map((cal, idx) => (
              <div key={idx} style={{ padding: "8px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px" }}>
                <span style={{ fontWeight: "800", color: "#60a5fa", width: "90px" }}>{cal.dayLabel}</span>
                <span style={{ color: "#f8fafc", flex: 1 }}>{cal.assetTitle}</span>
                <span style={{ color: "#34d399", fontWeight: "700" }}>{cal.platform}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Missed Opportunities & Next Stream Checklist */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        
        {/* Missed Opportunities */}
        <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontSize: "11px", fontWeight: "800", color: "#fb7185", textTransform: "uppercase" }}>
            ⚠️ Content Opportunities Missed
          </div>

          {missedOpportunities.map((m, idx) => (
            <div key={idx} style={{ padding: "10px", borderRadius: "8px", background: "rgba(251, 113, 133, 0.06)", border: "1px solid rgba(251, 113, 133, 0.2)", fontSize: "11px", display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ fontWeight: "800", color: "#fb7185" }}>{m.title}</div>
              <div style={{ color: "#cbd5e1" }}>{m.reasonIgnored}</div>
            </div>
          ))}
        </div>

        {/* Next Stream Checklist */}
        <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", flexDirection: "column", gap: "12px" }}>
          <div style={{ fontSize: "11px", fontWeight: "800", color: "#34d399", textTransform: "uppercase" }}>
            ✅ Next Stream Preparation Checklist
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "11px", color: "#cbd5e1" }}>
            {nextStreamChecklist.map((chk, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "6px 10px", borderRadius: "6px", background: "rgba(255,255,255,0.02)" }}>
                <span>[ ]</span>
                <span>{chk.item}</span>
                <span style={{ marginLeft: "auto", fontSize: "9px", color: "#94a3b8" }}>{chk.category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
