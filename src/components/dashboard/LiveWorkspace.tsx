"use client";

import React, { useState } from "react";
import { useLiveSession } from "@/context/LiveSessionContext";
import { LivePulseTab } from "./LivePulseTab";
import { AIProducerTab } from "./AIProducerTab";
import { TimelineTab } from "./TimelineTab";
import { LiveChatTab } from "./LiveChatTab";
import { HighlightsTab } from "./HighlightsTab";
import { LiveInitializationDashboard } from "./LiveInitializationDashboard";
import { LiveTelemetryPanel } from "./LiveTelemetryPanel";
import { CreatorIntelligenceTab } from "./CreatorIntelligenceTab";

import { useApp } from "@/context/AppContext";

export type LiveModuleTab = "intelligence" | "pulse" | "producer" | "timeline" | "chat" | "highlights";


const LIVE_NAV: { id: LiveModuleTab; name: string; icon: string; desc: string }[] = [
  { id: "intelligence", name: "AI Manager",  icon: "🧠", desc: "Real-time AI Creator Manager coaching & audience mood" },
  { id: "pulse",        name: "Live Pulse",   icon: "🔴", desc: "Real-time stream health & sentiment velocity index" },
  { id: "producer",     name: "AI Producer",  icon: "🤖", desc: "Real-time AI recommendations & action guidance" },
  { id: "timeline",     name: "Timeline",     icon: "⏱️", desc: "Automated event markers, hype spikes & milestones" },
  { id: "chat",         name: "Live Chat",    icon: "💬", desc: "Aggregated live stream chat feed & sentiment tracking" },
  { id: "highlights",   name: "Highlights",   icon: "🚀", desc: "Auto-detected viral clip candidates & peak moments" },
];


interface LiveWorkspaceProps {
  isStopping: boolean;
  onStopSession: () => void;
  onUpdateInsight?: (id: string, updates: any) => void;
}

export const LiveWorkspace: React.FC<LiveWorkspaceProps> = ({
  isStopping,
  onStopSession,
  onUpdateInsight,
}) => {
  const [activeModule, setActiveModule] = useState<LiveModuleTab>("intelligence");
  const { state, isLoading } = useLiveSession();
  const { theme } = useApp();
  const isDark = theme === "dark";


  if (isLoading || !state) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "60vh",
          color: isDark ? "#94a3b8" : "#64748b",
          gap: "16px",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "50%",
            border: "3px solid #a855f7",
            borderTopColor: "transparent",
            animation: "spin 1s linear infinite",
          }}
        />
        <div style={{ fontSize: "13px", fontWeight: "600", fontFamily: "monospace" }}>
          Connecting Single-Source Live Telemetry Context...
        </div>
      </div>
    );
  }

  // Phase check: If in building first window phase (0 snapshots generated), render LiveInitializationDashboard
  const isBuildingFirstWindow = state.phase === "BUILDING_FIRST_WINDOW" || (state.analytics.snapshotsCount === 0 && state.phase !== "LIVE");

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
        color: isDark ? "#f8fafc" : "#0f172a",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* 1. Live Navigation Bar (if first snapshot ready) */}
      {!isBuildingFirstWindow && (
        <div
          style={{
            display: "flex",
            gap: "8px",
            padding: "6px",
            borderRadius: "14px",
            background: isDark ? "rgba(13, 16, 27, 0.85)" : "#ffffff",
            backdropFilter: "blur(20px)",
            border: isDark ? "1px solid rgba(255, 255, 255, 0.08)" : "1px solid rgba(0, 0, 0, 0.08)",
            boxShadow: isDark ? "none" : "0 4px 20px rgba(0, 0, 0, 0.06)",
            width: "fit-content",
          }}
        >
          {LIVE_NAV.map((tab) => {
            const isActive = activeModule === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveModule(tab.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 16px",
                  borderRadius: "10px",
                  border: "none",
                  background: isActive
                    ? (isDark ? "rgba(168, 85, 247, 0.15)" : "rgba(168, 85, 247, 0.1)")
                    : "transparent",
                  color: isActive
                    ? (isDark ? "#c084fc" : "#7c3aed")
                    : (isDark ? "#94a3b8" : "#64748b"),
                  fontSize: "13px",
                  fontWeight: isActive ? "700" : "500",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  boxShadow: isActive ? "0 0 12px rgba(168, 85, 247, 0.2)" : "none",
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* 2. Main Live Workspace Grid */}
      <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>
        {/* Active Module Tab Content or Initialization Dashboard */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {isBuildingFirstWindow ? (
            <LiveInitializationDashboard state={state} />
          ) : (
            <>
              {activeModule === "intelligence" && (
                <CreatorIntelligenceTab intelligence={state.intelligence} isLoading={false} />
              )}

              {activeModule === "pulse" && (
                <LivePulseTab
                  snapshots={state.livePulse.snapshots}
                  currentSession={state.session}
                  isLoading={false}
                />
              )}

              {activeModule === "producer" && (
                <AIProducerTab
                  insights={state.aiProducer.insights}
                  isLoading={false}
                  onUpdateInsight={onUpdateInsight}
                />
              )}

              {activeModule === "timeline" && (
                <TimelineTab
                  session={state.session}
                  snapshots={state.livePulse.snapshots}
                  insights={state.aiProducer.insights}
                  isLoading={false}
                />
              )}

              {activeModule === "chat" && (
                <LiveChatTab
                  messages={state.chat.messages}
                  telemetry={state.telemetry}
                  isLoading={false}
                />
              )}

              {activeModule === "highlights" && (
                <HighlightsTab
                  sessionId={state.session.id}
                />
              )}
            </>
          )}
        </div>

        {/* Live Telemetry Panel (Presentation component consuming unified context) */}
        <LiveTelemetryPanel
          state={state}
          isStopping={isStopping}
          onStopSession={onStopSession}
        />
      </div>
    </div>
  );
};
