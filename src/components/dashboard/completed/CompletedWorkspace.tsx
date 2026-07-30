"use client";

import React, { useState } from "react";
import { FinalSessionSummary } from "@/lib/session/lifecycle";
import { CompletedHeader } from "./CompletedHeader";
import { CompletedSessionSummary } from "./CompletedSessionSummary";
import { CompletedActions } from "./CompletedActions";
import { CompletedSessionOverview } from "./CompletedSessionOverview";
import { CompletedAIReport } from "./CompletedAIReport";
import { CompletedTimeline } from "./CompletedTimeline";
import { CompletedChatArchive } from "./CompletedChatArchive";
import { CompletedHighlights } from "./CompletedHighlights";
import { CompletedCreatorIntelligence } from "./CompletedCreatorIntelligence";

export type CompletedModuleTab = "intelligence" | "overview" | "producer" | "timeline" | "chat" | "highlights";

const COMPLETED_NAV: { id: CompletedModuleTab; name: string; icon: string; desc: string }[] = [
  { id: "intelligence", name: "Creator Intelligence", icon: "🧠", desc: "Executive Manager report & behaviour score" },
  { id: "overview",     name: "Overview",             icon: "📊", desc: "Broadcast performance summary & key metrics" },
  { id: "producer",     name: "Final AI Report",      icon: "🤖", desc: "AI performance analysis & action recommendations" },
  { id: "timeline",     name: "Broadcast Timeline",   icon: "⏱️", desc: "Historical event markers & milestone log" },
  { id: "chat",         name: "Chat Archive",         icon: "💬", desc: "Broadcast chat log & message filtering" },
  { id: "highlights",   name: "Highlights",           icon: "🚀", desc: "Auto-detected highlight candidates & clips" },
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



  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "24px",
        minHeight: "100vh",
        background: "transparent",
        color: "#f8fafc",
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
          background: "rgba(13, 16, 27, 0.85)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
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
                background: isActive ? "rgba(52, 211, 153, 0.12)" : "transparent",
                color: isActive ? "#34d399" : "#94a3b8",
                fontSize: "13px",
                fontWeight: isActive ? "700" : "500",
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxShadow: isActive ? "0 0 12px rgba(52, 211, 153, 0.15)" : "none",
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
            <CompletedAIReport insights={bundle?.aiReport ? [bundle.aiReport] : insights} session={session} summary={sessionSummary} />
          )}

          {activeTab === "timeline" && (
            <CompletedTimeline summary={sessionSummary} session={session} snapshots={bundle?.snapshots || snapshots} insights={insights} timelineEvents={bundle?.timeline?.events} />
          )}

          {activeTab === "chat" && (
            <CompletedChatArchive messages={bundle?.chatArchive || messages} session={session} />
          )}

          {activeTab === "highlights" && (
            <CompletedHighlights session={session} summary={sessionSummary} highlights={bundle?.highlights || []} />
          )}
        </div>

        {/* Right Sidebar: Completed Session Overview (Immutable Report Metadata) */}
        <CompletedSessionOverview summary={sessionSummary} session={session} bundle={bundle} />

      </div>
    </div>
  );
};
