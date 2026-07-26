"use client";

import React, { useState, useEffect } from "react";
import { InsightFeed } from "./InsightFeed";
import { InsightTimeline } from "./InsightTimeline";
import { HealthScore } from "./HealthScore";
import { ProviderIndicator } from "./ProviderIndicator";
import { CopilotInsightItem } from "./InsightCard";

interface AICopilotPanelProps {
  onNavigateToLive?: () => void;
}

const DEMO_INSIGHTS: CopilotInsightItem[] = [
  {
    id: "demo-1",
    type: "engagement_opportunity",
    priority: "high",
    confidence: 94,
    timestamp: new Date().toISOString(),
    title: "Chat Velocity Spiking (+38%)",
    summary: "Chat velocity increased rapidly after discussing your setup configuration.",
    recommendation: "Continue discussing your stream setup and ask viewers about their favorite gear.",
    why: [
      "Chat velocity increased by 38% in last 2 minutes",
      "Positive sentiment keyword ratio rose to 82%",
      "Viewer retention remains rock solid",
    ],
    isPinned: true,
  },
  {
    id: "demo-2",
    type: "retention_alert",
    priority: "critical",
    confidence: 89,
    timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    title: "Retention Drop Detected (-12%)",
    summary: "Viewer dropoff detected during extended dead air / silence.",
    recommendation: "Increase voice energy or react to chat comments to re-engage audience.",
    why: [
      "Silence duration exceeded 25 seconds",
      "Concurrently watching count dipped slightly",
      "Chat velocity slowed",
    ],
  },
  {
    id: "demo-3",
    type: "clip_opportunity",
    priority: "medium",
    confidence: 91,
    timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    title: "Hype / Laugh Peak Detected",
    summary: "Mass LMAO/KEKW chat spam detected following recent clutch moment.",
    recommendation: "Bookmark stream timestamp for post-stream highlight clip.",
    why: [
      "Emote density hit 140 emotes/min",
      "Chat message rate doubled",
    ],
  },
];

export const AICopilotPanel: React.FC<AICopilotPanelProps> = ({ onNavigateToLive }) => {
  const [activeTab, setActiveTab] = useState<"feed" | "timeline">("feed");
  const [insights, setInsights] = useState<CopilotInsightItem[]>([]);
  const [isMonitoringActive, setIsMonitoringActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [providerInfo, setProviderInfo] = useState({
    provider: "Gemini",
    model: "Gemini 2.5 Flash",
    lastUpdatedSecondsAgo: 4,
    latencyMs: 180,
    fallbackUsed: false,
  });

  const fetchData = async () => {
    try {
      // 1. Fetch live monitoring sessions
      const sessRes = await fetch("/api/sessions");
      const sessJson = await sessRes.json();
      const hasLiveSess = Boolean(
        sessJson.success &&
        Array.isArray(sessJson.sessions) &&
        sessJson.sessions.some((s: any) => s.status === "live" || s.isLive)
      );
      setIsMonitoringActive(hasLiveSess);

      // 2. Fetch AI Insights
      const res = await fetch("/api/ai/insights");
      const json = await res.json();

      if (json.success && Array.isArray(json.insights) && json.insights.length > 0) {
        setInsights(json.insights);
      } else {
        // Use demo insights when monitoring is active or for initial view
        setInsights(DEMO_INSIGHTS);
      }
    } catch (e) {
      console.error("[Copilot] Error fetching data:", e);
      setInsights(DEMO_INSIGHTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = async (id: string) => {
    setInsights((prev) => prev.map((item) => (item.id === id ? { ...item, isDismissed: true } : item)));
    try {
      await fetch("/api/ai/insights", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isDismissed: true }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handlePin = async (id: string) => {
    setInsights((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isPinned: !item.isPinned } : item))
    );
    const target = insights.find((i) => i.id === id);
    try {
      await fetch("/api/ai/insights", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isPinned: !target?.isPinned }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleComplete = async (id: string) => {
    setInsights((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isCompleted: !item.isCompleted } : item))
    );
    const target = insights.find((i) => i.id === id);
    try {
      await fetch("/api/ai/insights", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isCompleted: !target?.isCompleted }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (id: string) => {
    setInsights((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isSaved: !item.isSaved } : item))
    );
    const target = insights.find((i) => i.id === id);
    try {
      await fetch("/api/ai/insights", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isSaved: !target?.isSaved }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Banner */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
          padding: "24px 28px",
          borderRadius: "20px",
          background: "linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)",
          border: "1px solid rgba(168, 85, 247, 0.25)",
          backdropFilter: "blur(20px)",
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "22px",
              boxShadow: "0 4px 16px rgba(168, 85, 247, 0.4)",
            }}
          >
            🤖
          </div>
          <div>
            <h2 style={{ margin: "0 0 4px", fontSize: "20px", fontWeight: 800, color: "#f8fafc" }}>
              AI Live Copilot
            </h2>
            <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8" }}>
              Your real-time AI Producer observing pulse snapshots & surfacing stream recommendations
            </p>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
          <HealthScore score={92} />
          <ProviderIndicator
            provider={providerInfo.provider}
            model={providerInfo.model}
            lastUpdatedSecondsAgo={providerInfo.lastUpdatedSecondsAgo}
            latencyMs={providerInfo.latencyMs}
            fallbackUsed={providerInfo.fallbackUsed}
          />
        </div>
      </div>

      {/* Workspace Controls & Tabs */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: "12px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Navigation Tabs */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => setActiveTab("feed")}
            style={{
              padding: "10px 18px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              background: activeTab === "feed" ? "rgba(168, 85, 247, 0.15)" : "transparent",
              border: activeTab === "feed" ? "1px solid rgba(168, 85, 247, 0.35)" : "1px solid transparent",
              color: activeTab === "feed" ? "#f1f5f9" : "#64748b",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.15s ease",
            }}
          >
            <span>✨ Active Feed</span>
          </button>

          <button
            onClick={() => setActiveTab("timeline")}
            style={{
              padding: "10px 18px",
              borderRadius: "12px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              background: activeTab === "timeline" ? "rgba(168, 85, 247, 0.15)" : "transparent",
              border: activeTab === "timeline" ? "1px solid rgba(168, 85, 247, 0.35)" : "1px solid transparent",
              color: activeTab === "timeline" ? "#f1f5f9" : "#64748b",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.15s ease",
            }}
          >
            <span>⏱️ Stream Story Timeline</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div style={{ padding: "60px 0", textAlign: "center", fontSize: "13px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>
          Connecting to AI Producer Stream...
        </div>
      ) : activeTab === "feed" ? (
        <InsightFeed
          insights={insights}
          isMonitoringActive={true}
          onStartMonitoring={onNavigateToLive}
          onDismiss={handleDismiss}
          onPin={handlePin}
          onComplete={handleComplete}
          onSave={handleSave}
        />
      ) : (
        <InsightTimeline insights={insights} />
      )}
    </div>
  );
};
