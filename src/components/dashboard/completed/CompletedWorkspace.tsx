"use client";

import React, { useState } from "react";
import { FinalSessionSummary } from "@/lib/session/lifecycle";
import { CompletedHeader } from "./CompletedHeader";
import { CompletedSessionSummary } from "./CompletedSessionSummary";
import { CompletedActions } from "./CompletedActions";
import { ContextualSidebar } from "./ContextualSidebar";
import { CompletedAIReport } from "./CompletedAIReport";
import { CompletedTimeline } from "./CompletedTimeline";
import { CompletedChatArchive } from "./CompletedChatArchive";
import { CompletedHighlights } from "./CompletedHighlights";
import { CompletedCreatorIntelligence } from "./CompletedCreatorIntelligence";
import { CompletedContentStrategy } from "./CompletedContentStrategy";
import { useApp } from "@/context/AppContext";


export type CompletedModuleTab = "intelligence" | "strategy" | "overview" | "producer" | "timeline" | "chat" | "highlights";

const COMPLETED_NAV: { id: CompletedModuleTab; name: string; icon: string; desc: string }[] = [
  { id: "intelligence", name: "Manager Executive Review", icon: "🧠", desc: "Your AI Creator Manager session briefing" },
  { id: "strategy",     name: "Publishing Strategy",      icon: "📈", desc: "Post-production strategy & publishing plan" },
  { id: "overview",     name: "Overview",                 icon: "📊", desc: "Broadcast performance summary & key metrics" },
  { id: "producer",     name: "Manager Action Plan",      icon: "📋", desc: "Performance analysis & action recommendations" },
  { id: "timeline",     name: "Broadcast Timeline",       icon: "⏱️", desc: "Historical event markers & milestone log" },
  { id: "chat",         name: "Chat Archive",             icon: "💬", desc: "Broadcast chat log & message filtering" },
  { id: "highlights",   name: "Highlights Studio",        icon: "🎬", desc: "Editorial highlight candidates & clips" },
];


interface CompletedWorkspaceProps {
  session: any;
  sessionSummary?: FinalSessionSummary | null;
  snapshots?: any[];
  insights?: any[];
  messages?: any[];
  onStartNewMonitoring: () => void;
}

export const CompletedWorkspace: React.FC<CompletedWorkspaceProps> = ({
  session,
  sessionSummary,
  snapshots = [],
  insights = [],
  messages = [],
  onStartNewMonitoring,
}) => {
  const [activeTab, setActiveTab] = useState<CompletedModuleTab>("intelligence");
  const [bundle, setBundle] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  React.useEffect(() => {
    const sessionId = session?.id || sessionSummary?.sessionId;
    if (!sessionId) return;

    fetch(`/api/session/completed?sessionId=${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setBundle(data);
        }
      })
      .catch((e) => console.warn("Failed to load completed session bundle:", e))
      .finally(() => setIsLoading(false));
  }, [session?.id, sessionSummary?.sessionId]);



  const { theme } = useApp();
  const isDark = theme === "dark";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0 24px 24px 24px",
        minHeight: "100vh",
        background: "transparent",
        color: isDark ? "#f8fafc" : "#0f172a",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* 1. Header Banner */}
      <CompletedHeader
        platformDisplayName={sessionSummary?.platformDisplayName || session?.platformDisplayName || session?.platform}
        streamTitle={session?.streamTitle}
        durationMinutes={sessionSummary?.durationMinutes || (session?.sessionDuration ? Math.round(session.sessionDuration / 60) : 26)}
        completedAt={sessionSummary?.completedAt || session?.updatedAt}
      />

      {/* 2. Primary Navigation Bar */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          padding: "6px",
          borderRadius: "14px",
          background: isDark ? "rgba(13, 16, 27, 0.85)" : "#ffffff",
          backdropFilter: "blur(20px)",
          border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
          boxShadow: isDark ? "none" : "0 4px 16px rgba(0, 0, 0, 0.04)",
          width: "fit-content",
        }}
      >
        {COMPLETED_NAV.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                borderRadius: "10px",
                border: "none",
                background: isActive ? (isDark ? "rgba(52, 211, 153, 0.15)" : "#d1fae5") : "transparent",
                color: isActive ? (isDark ? "#34d399" : "#065f46") : (isDark ? "#94a3b8" : "#64748b"),
                fontSize: "13px",
                fontWeight: isActive ? "700" : "500",
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxShadow: isActive ? (isDark ? "0 0 12px rgba(52, 211, 153, 0.15)" : "0 2px 8px rgba(16, 185, 129, 0.15)") : "none",
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Main Workspace Grid */}
      <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
        {/* Left / Center Tab Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {activeTab === "intelligence" && (
            <CompletedCreatorIntelligence summary={sessionSummary} intelligence={bundle?.creatorIntelligence || (sessionSummary as any)?.intelligence} />
          )}

          {activeTab === "strategy" && (
            <CompletedContentStrategy bundle={bundle} sessionSummary={sessionSummary} />
          )}


          {activeTab === "overview" && (
            <>
              <CompletedSessionSummary summary={sessionSummary} session={session} bundle={bundle} />
              <CompletedActions
                onStartNewMonitoring={onStartNewMonitoring}
                onNavigateTab={(tab) => setActiveTab(tab as CompletedModuleTab)}
              />
            </>
          )}

          {activeTab === "producer" && (
            <CompletedAIReport insights={bundle?.aiReport ? [bundle.aiReport] : insights} session={session} summary={sessionSummary} bundle={bundle} />
          )}

          {activeTab === "timeline" && (
            <CompletedTimeline summary={sessionSummary} session={session} snapshots={bundle?.snapshots || snapshots} insights={insights} timelineEvents={bundle?.sessionIntelligence?.timeline?.events || bundle?.timeline?.events} bundle={bundle} />
          )}

          {activeTab === "chat" && (
            <CompletedChatArchive messages={bundle?.chatArchive || messages} session={session} />
          )}

          {activeTab === "highlights" && (
            <CompletedHighlights session={session} summary={sessionSummary} highlights={bundle?.sessionIntelligence?.highlights || bundle?.highlights || []} />
          )}
        </div>

        {/* Right Sidebar: Contextual Sidebar per active tab */}
        <ContextualSidebar activeTab={activeTab} session={session} sessionSummary={sessionSummary} bundle={bundle} />

      </div>
    </div>
  );
};
