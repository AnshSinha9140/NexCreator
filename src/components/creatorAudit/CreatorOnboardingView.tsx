"use client";

import React, { useState } from "react";
import { CreatorIntelligenceAudit } from "@/lib/creatorAudit/types";

interface CreatorOnboardingViewProps {
  audit: CreatorIntelligenceAudit;
  creatorId: string;
  onComplete: () => void;
}

export const CreatorOnboardingView: React.FC<CreatorOnboardingViewProps> = ({
  audit,
  creatorId,
  onComplete,
}) => {
  const [activeTab, setActiveTab] = useState<"letter" | "promise" | "identity" | "psychology" | "roadmap">("letter");

  const handleBegin = async () => {
    const response = await fetch("/api/creator/hydration", { method: "PATCH" });
    if (response.ok) onComplete();
  };

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "0 auto",
        padding: "40px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "32px",
        fontFamily: "'Inter', sans-serif",
        color: "#f8fafc",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "32px",
          borderRadius: "24px",
          background: "linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(59, 130, 246, 0.2))",
          border: "1px solid rgba(147, 51, 234, 0.4)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "20px" }}>👋</span>
          <span style={{ fontSize: "12px", fontWeight: "800", color: "#c084fc", textTransform: "uppercase", letterSpacing: "1px" }}>
            Welcome to NexCreator — Your AI Creator Manager
          </span>
        </div>
        <h1 style={{ margin: 0, fontSize: "28px", fontWeight: "800", lineHeight: "1.3", color: "#f8fafc" }}>
          My AI Creator Manager Already Knows Me.
        </h1>
        <p style={{ margin: 0, fontSize: "14px", color: "#cbd5e1", lineHeight: "1.6" }}>
          Before saying hello, your Senior AI Creator Manager spent time reviewing your content, community culture, and broadcast history to build your personalized growth foundation.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "8px", background: "rgba(13,16,27,0.8)", padding: "6px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)", flexWrap: "wrap" }}>
        {[
          { id: "letter", label: "✉️ Executive Letter" },
          { id: "promise", label: "🤝 Manager Promise" },
          { id: "identity", label: "👤 Identity & Tone" },
          { id: "psychology", label: "🧠 Audience Psychology" },
          { id: "roadmap", label: "🚀 90-Day Roadmap" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              flex: 1,
              minWidth: "120px",
              padding: "10px",
              borderRadius: "10px",
              border: activeTab === tab.id ? "1px solid rgba(168,85,247,0.4)" : "none",
              background: activeTab === tab.id ? "rgba(147,51,234,0.2)" : "transparent",
              color: activeTab === tab.id ? "#f8fafc" : "#94a3b8",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Section */}
      {activeTab === "letter" && (
        <div style={{ padding: "32px", borderRadius: "20px", background: "rgba(13,16,27,0.9)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ fontSize: "15px", fontWeight: "700", color: "#c084fc" }}>
            {audit.executiveLetter.opening}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "14px", color: "#e2e8f0", lineHeight: "1.7" }}>
            {audit.executiveLetter.bodyParagraphs.map((p, i) => (
              <p key={i} style={{ margin: 0 }}>{p}</p>
            ))}
          </div>
          <div style={{ padding: "16px", borderRadius: "12px", background: "rgba(59, 130, 246, 0.1)", borderLeft: "4px solid #3b82f6", fontSize: "14px", color: "#93c5fd", fontStyle: "italic" }}>
            "{audit.executiveLetter.closingCommitment}"
          </div>
        </div>
      )}
      {activeTab === "promise" && (
        <div style={{ padding: "32px", borderRadius: "20px", background: "rgba(13,16,27,0.9)", border: "1px solid rgba(168,85,247,0.3)", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ fontSize: "18px", fontWeight: "800", color: "#c084fc", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>🤝</span> My Promise To You
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px", color: "#e2e8f0" }}>
            <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", borderLeft: "3px solid #f87171" }}>
              • I won't always tell you what you want to hear — I'll tell you what I genuinely believe will help you grow.
            </div>
            <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", borderLeft: "3px solid #4ade80" }}>
              • If you're improving, I'll celebrate it. If I think you're making a mistake, I'll explain why.
            </div>
            <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", borderLeft: "3px solid #38bdf8" }}>
              • I'll admit when I'm uncertain.
            </div>
            <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", borderLeft: "3px solid #facc15" }}>
              • My goal isn't to make you feel good — my goal is to help you become the creator you want to become.
            </div>
          </div>
          <div style={{ marginTop: "12px", fontSize: "13px", color: "#94a3b8", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
            <strong>What I'll remember:</strong> your personal goals, your unique audience culture, your key strengths, and your progress across every broadcast.
          </div>
        </div>
      )}

      {activeTab === "identity" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(13,16,27,0.9)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>CONTENT CATEGORY</span>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#f8fafc" }}>{audit.creatorIdentity.category}</h3>
          </div>
          <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(13,16,27,0.9)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>CORE BROADCAST STYLE</span>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#38bdf8" }}>{audit.creatorIdentity.coreStyle}</h3>
          </div>
          <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(13,16,27,0.9)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>PRIMARY HOOK</span>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#facc15" }}>{audit.creatorIdentity.primaryHook}</h3>
          </div>
          <div style={{ padding: "20px", borderRadius: "16px", background: "rgba(13,16,27,0.9)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <span style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>BRAND TONE</span>
            <h3 style={{ margin: "0", fontSize: "16px", fontWeight: "800", color: "#4ade80" }}>{audit.creatorIdentity.brandTone}</h3>
          </div>
        </div>
      )}

      {activeTab === "psychology" && (
        <div style={{ padding: "24px", borderRadius: "20px", background: "rgba(13,16,27,0.9)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#f8fafc" }}>Audience Motivations & Culture</h3>
          <p style={{ margin: 0, fontSize: "13px", color: "#cbd5e1" }}>{audit.audiencePsychology.demographicsSummary}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {audit.audiencePsychology.primaryMotivations.map((m, i) => (
              <div key={i} style={{ padding: "10px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", fontSize: "13px", color: "#93c5fd" }}>
                • {m}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "roadmap" && (
        <div style={{ padding: "24px", borderRadius: "20px", background: "rgba(13,16,27,0.9)", border: "1px solid rgba(255,255,255,0.1)", display: "flex", flexDirection: "column", gap: "16px" }}>
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "800", color: "#f8fafc" }}>90-Day Execution Roadmap</h3>
          {audit.growthRoadmap.ninetyDayPlan.map((step, i) => (
            <div key={i} style={{ padding: "12px", borderRadius: "10px", background: "rgba(147,51,234,0.1)", border: "1px solid rgba(147,51,234,0.2)", fontSize: "13px", color: "#e9d5ff" }}>
              <strong>Phase {i + 1}:</strong> {step}
            </div>
          ))}
          <div style={{ marginTop: "8px", padding: "12px", borderRadius: "10px", background: "rgba(52,211,153,0.1)", color: "#6ee7b7", fontSize: "13px" }}>
            🎯 <strong>1-Year Vision:</strong> {audit.growthRoadmap.oneYearVision}
          </div>
        </div>
      )}

      {/* CTA Button */}
      <button
        onClick={handleBegin}
        style={{
          padding: "18px",
          borderRadius: "16px",
          background: "linear-gradient(90deg, #9333ea, #3b82f6)",
          color: "#fff",
          border: "none",
          fontSize: "16px",
          fontWeight: "800",
          cursor: "pointer",
          boxShadow: "0 10px 30px rgba(147,51,234,0.4)",
        }}
      >
        ✨ Let's Begin — Launch AI Creator Manager Workspace
      </button>
    </div>
  );
};
