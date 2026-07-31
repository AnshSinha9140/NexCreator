"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MonitoringSession, ConnectedPlatformAccount } from "@/types";

import { LivePulseTab } from "./dashboard/LivePulseTab";
import { AIProducerTab } from "./dashboard/AIProducerTab";
import { TimelineTab } from "./dashboard/TimelineTab";
import { LiveChatTab } from "./dashboard/LiveChatTab";
import { HighlightsTab } from "./dashboard/HighlightsTab";
import { CompletedSessionSummaryCard } from "./dashboard/CompletedSessionSummaryCard";
import { CompletedWorkspace } from "./dashboard/completed/CompletedWorkspace";
import { LiveWorkspace } from "./dashboard/LiveWorkspace";
import { LiveSessionProvider } from "@/context/LiveSessionContext";
import { HomeDashboard } from "./dashboard/HomeDashboard";
import { CreatorInbox } from "./dashboard/CreatorInbox";
import { StreamComparison } from "./dashboard/StreamComparison";
import { CommandPalette } from "./dashboard/CommandPalette";
import { NotificationCenterPanel } from "./dashboard/NotificationCenterPanel";

type OsTab = "home" | "inbox" | "live" | "intelligence" | "strategy" | "compare" | "history";

type LiveModuleTab = "pulse" | "producer" | "timeline" | "chat" | "highlights";


const LIVE_NAV: { id: LiveModuleTab; name: string; icon: string; desc: string }[] = [
  { id: "pulse",      name: "Live Pulse",   icon: "🔴", desc: "Real-time stream health & sentiment velocity index" },
  { id: "producer",   name: "AI Producer",  icon: "🤖", desc: "Real-time AI recommendations & action guidance" },
  { id: "timeline",   name: "Timeline",     icon: "⏱️", desc: "Automated event markers, hype spikes & milestones" },
  { id: "chat",       name: "Live Chat",    icon: "💬", desc: "Aggregated live stream chat feed & sentiment tracking" },
  { id: "highlights", name: "Highlights",   icon: "🚀", desc: "Auto-detected viral clip candidates & peak moments" },
];

type StartStep = "idle" | "starting" | "connecting" | "initializing" | "active";

interface ErrorState {
  type: "offline" | "connection_lost" | "detection_failed" | "stopped" | "unexpected";
  title: string;
  whatHappened: string;
  whatNexCreatorIsDoing: string;
  whatCreatorCanDo: string;
}

const formatDuration = (session: MonitoringSession | null): string => {
  if (!session) return "0m";

  // Priority 1: Deriving duration from startedAt or createdAt timestamp
  const startStr = session.startedAt || session.createdAt;
  if (startStr) {
    const startTime = new Date(startStr).getTime();
    if (!isNaN(startTime) && startTime > 0) {
      const elapsedSec = Math.max(0, Math.floor((Date.now() - startTime) / 1000));
      const hours = Math.floor(elapsedSec / 3600);
      const minutes = Math.floor((elapsedSec % 3600) / 60);

      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      return `${minutes}m`;
    }
  }

  // Priority 2: Fallback to sessionDuration in seconds if positive and valid
  if (typeof session.sessionDuration === "number" && !isNaN(session.sessionDuration) && session.sessionDuration > 0) {
    const hours = Math.floor(session.sessionDuration / 3600);
    const minutes = Math.floor((session.sessionDuration % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  return "0m";
};

export const DashboardView: React.FC<{ setActiveTab: (tab: string) => void }> = ({
  setActiveTab,
}) => {
  // Sprint 18.9 Creator Operating System Navigation & Dialog States
  const [osTab, setOsTab] = useState<OsTab>("home");
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setIsCommandPaletteOpen((prev) => !prev);
    window.addEventListener("toggle-command-palette", handleToggle);
    return () => window.removeEventListener("toggle-command-palette", handleToggle);
  }, []);

  // Navigation & Session State
  const [activeModule, setActiveModule] = useState<LiveModuleTab>("pulse");

  const [activeSession, setActiveSession] = useState<MonitoringSession | null>(null);
  const [connectedPlatform, setConnectedPlatform] = useState<ConnectedPlatformAccount | null>(null);
  const [connectedPlatformsList, setConnectedPlatformsList] = useState<ConnectedPlatformAccount[]>([]);
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [selectedPlatformChoice, setSelectedPlatformChoice] = useState<string>("auto");
  const [detectionMetadata, setDetectionMetadata] = useState<any>(null);

  // Real Backend Pipeline Data
  const [snapshots, setSnapshots] = useState<any[]>([]);
  const [insights, setInsights] = useState<any[]>([]);
  const [liveMessages, setLiveMessages] = useState<any[]>([]);
  const [telemetryData, setTelemetryData] = useState<any>(null);

  // Loading & Transition States
  const [isLoading, setIsLoading] = useState(true);
  const [startStep, setStartStep] = useState<StartStep>("idle");
  const [errorState, setErrorState] = useState<ErrorState | null>(null);

  // Sprint 17: Multi-Step Graceful Finalization States
  const [isStopping, setIsStopping] = useState<boolean>(false);
  const [stoppingStep, setStoppingStep] = useState<string>("Closing collectors...");
  const [sessionSummary, setSessionSummary] = useState<any>(null);

  // Telemetry & Browser Countdown Timers (0 Network Overhead)
  const [lastPolledAt, setLastPolledAt] = useState<string | null>(null);
  const [lastCheckedSeconds, setLastCheckedSeconds] = useState<number>(0);
  const [nextCheckSeconds, setNextCheckSeconds] = useState<number>(10);

  const pollerTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Helper: Dynamic Platform Branding & UX Text
  const getPlatformBranding = (platform?: string) => {
    const p = (platform || "").toLowerCase().trim();
    if (p === "kick") {
      return {
        name: "Kick",
        color: "#53FC18",
        bgGradient: "linear-gradient(135deg, rgba(83,252,24,0.15) 0%, rgba(16,185,129,0.1) 100%)",
        border: "rgba(83,252,24,0.3)",
        badgeBg: "rgba(83,252,24,0.1)",
        badgeText: "#53FC18",
        icon: "🟢",
        waitingText: "Waiting for your Kick stream...",
        collectorName: "Kick Collector (WebSocket)"
      };
    }
    if (p === "youtube") {
      return {
        name: "YouTube",
        color: "#FF0000",
        bgGradient: "linear-gradient(135deg, rgba(255,0,0,0.15) 0%, rgba(225,29,72,0.1) 100%)",
        border: "rgba(255,0,0,0.3)",
        badgeBg: "rgba(255,0,0,0.1)",
        badgeText: "#ff4d4d",
        icon: "🔴",
        waitingText: "Waiting for your YouTube stream...",
        collectorName: "YouTube Collector (Polling API)"
      };
    }
    return {
      name: "Auto Detect",
      color: "#9146FF",
      bgGradient: "linear-gradient(135deg, rgba(145,70,255,0.15) 0%, rgba(168,85,247,0.1) 100%)",
      border: "rgba(145,70,255,0.3)",
      badgeBg: "rgba(145,70,255,0.1)",
      badgeText: "#c084fc",
      icon: "📡",
      waitingText: "Watching Kick & YouTube for live stream...",
      collectorName: "Multi-Platform Auto Detector"
    };
  };

  // ─── PART 1: CONSOLIDATED INITIAL TELEMETRY FETCH (ONCE ON MOUNT / RECONNECT) ───
  useEffect(() => {
    let isMounted = true;

    const fetchInitialTelemetry = async () => {
      setIsLoading(true);
      try {
        // Fetch connected platforms AND active session in parallel once on page load
        const [platRes, detectionRes] = await Promise.all([
          fetch("/api/platforms/connected"),
          fetch("/api/detection"),
        ]);

        if (!isMounted) return;

        // 1. Process Platform Info
        if (platRes.ok) {
          const platData = await platRes.json();
          if (platData.success) {
            const list = platData.platforms || (platData.defaultPlatform ? [platData.defaultPlatform] : []);
            setConnectedPlatformsList(list);
            if (platData.defaultPlatform) setConnectedPlatform(platData.defaultPlatform);
            else if (list.length > 0) setConnectedPlatform(list[0]);
          }
        }

        // 2. Process Detection Session Info
        if (detectionRes.ok) {
          const detData = await detectionRes.json();
          if (detData.success && detData.session) {
            setActiveSession(detData.session);
            if (detData.metadata) setDetectionMetadata(detData.metadata);
            const timestamp = detData.lastPolledAt || detData.session.updatedAt || new Date().toISOString();
            setLastPolledAt(timestamp);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch initial monitoring telemetry:", err);
        setErrorState({
          type: "connection_lost",
          title: "Connection Lost",
          whatHappened: "Unable to communicate with the NexCreator backend telemetry service.",
          whatNexCreatorIsDoing: "Attempting automatic background reconnection...",
          whatCreatorCanDo: "Check your internet connection or click Refresh Telemetry.",
        });
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchInitialTelemetry();

    return () => {
      isMounted = false;
    };
  }, []);

  // ─── PART 2: PASSIVE SESSION STATUS POLLING (10 SECOND BACKEND SYNC) ───
  useEffect(() => {
    if (activeSession && ["waiting", "starting", "live", "offline_pending"].includes(activeSession.status)) {
      const runPassiveStateSync = async () => {
        try {
          const res = await fetch(`/api/detection?sessionId=${activeSession.id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.session) {
              setActiveSession(data.session);
              if (data.metadata) setDetectionMetadata(data.metadata);
              const timestamp = data.lastPolledAt || data.session.updatedAt || new Date().toISOString();
              setLastPolledAt(timestamp);

              // Auto-dismiss transient connection errors on successful sync
              setErrorState((prev) => (prev?.type === "connection_lost" ? null : prev));
            }
          } else {
            console.warn("Passive state sync received non-OK response:", res.status);
          }
        } catch (err) {
          console.warn("Passive state sync network error:", err);
          setErrorState({
            type: "connection_lost",
            title: "Telemetry Sync Interrupted",
            whatHappened: "Temporary network delay while reading session telemetry.",
            whatNexCreatorIsDoing: "Retrying passive synchronization automatically in 10 seconds...",
            whatCreatorCanDo: "Keep this browser tab open; monitoring is actively running in the backend daemon.",
          });
        }
      };

      // Poll passive endpoint every 10s
      pollerTimerRef.current = setInterval(runPassiveStateSync, 10000);
    } else {
      if (pollerTimerRef.current) {
        clearInterval(pollerTimerRef.current);
        pollerTimerRef.current = null;
      }
    }

    return () => {
      if (pollerTimerRef.current) {
        clearInterval(pollerTimerRef.current);
        pollerTimerRef.current = null;
      }
    };
  }, [activeSession?.id, activeSession?.status]);

  const handleUpdateInsight = useCallback(async (id: string, updates: any) => {
    try {
      setInsights((prev) =>
        prev.map((item) => (item.id === id || item._id?.toString() === id ? { ...item, ...updates } : item))
      );
      await fetch("/api/ai/insights", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
    } catch (e) {
      console.warn("[Dashboard] Failed to update insight:", e);
    }
  }, []);



  const executeStartSession = useCallback(async (targetPlatformChoice?: string) => {
    setErrorState(null);
    setStartStep("starting");
    setIsSelectModalOpen(false);

    const platformToUse = targetPlatformChoice || selectedPlatformChoice || "auto";

    try {
      await new Promise((r) => setTimeout(r, 400));
      setStartStep("connecting");

      await new Promise((r) => setTimeout(r, 400));
      setStartStep("initializing");

      let resolvedChatroomId: string | undefined;
      const targetPlatformAccount = connectedPlatformsList.find(p => p.platform === platformToUse) || connectedPlatform;

      if (targetPlatformAccount && targetPlatformAccount.platform === "kick") {
        const kickUsername = targetPlatformAccount.username || targetPlatformAccount.channelUrl?.split("kick.com/")[1]?.split("/")[0];
        if (kickUsername) {
          try {
            const chatroomRes = await fetch(`/api/kick/chatroom?slug=${encodeURIComponent(kickUsername.toLowerCase())}`);
            if (chatroomRes.ok) {
              const chatroomData = await chatroomRes.json();
              if (chatroomData?.chatroomId) {
                resolvedChatroomId = String(chatroomData.chatroomId);
              }
            }
          } catch (e) {
            console.warn("[Dashboard] Could not resolve chatroom.id:", e);
          }
        }
      }

      const res = await fetch("/api/detection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          connectedPlatformId: targetPlatformAccount?.id || "auto",
          platform: platformToUse,
          ...(resolvedChatroomId ? { chatroomId: resolvedChatroomId } : {}),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        const errorMsg =
          typeof data.error === "string"
            ? data.error
            : data.error?.message || "Failed to initialize detection session.";
        throw new Error(errorMsg);
      }

      setStartStep("active");
      await new Promise((r) => setTimeout(r, 500));

      if (data.session) {
        setActiveSession(data.session);
      } else {
        const branding = getPlatformBranding(platformToUse);
        setActiveSession({
          id: data.sessionId,
          userId: targetPlatformAccount?.username || "creator",
          platform: platformToUse,
          platformDisplayName: branding.name,
          monitoringMode: platformToUse === "auto" ? "auto" : "single",
          connectedPlatformId: targetPlatformAccount?.id || "auto",
          status: data.status || "waiting",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastHeartbeat: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
          sessionDuration: 0,
          viewerCount: 0,
          peakViewerCount: 0,
          monitoringEnabled: true,
          streamCategory: "Gaming",
          streamTitle: `${branding.name} Live Stream`,
        });
      }

      setLastPolledAt(new Date().toISOString());
    } catch (e: any) {
      console.error("Failed to start detection session:", e);
      setErrorState({
        type: "detection_failed",
        title: "Detection Engine Initialization Failed",
        whatHappened: e.message || "Unable to start backend monitoring daemon.",
        whatNexCreatorIsDoing: "Logged failure and reset state.",
        whatCreatorCanDo: "Ensure your channel link is valid in Connected Platforms settings and try again.",
      });
    } finally {
      setStartStep("idle");
    }
  }, [connectedPlatform, connectedPlatformsList, selectedPlatformChoice]);

  // ─── PART 6: TRIGGER START SESSION WITH SELECTION CHECK ─────────────────
  const handleStartSession = useCallback(() => {
    if (!connectedPlatformsList || connectedPlatformsList.length === 0) {
      setActiveTab("settings");
      return;
    }

    if (connectedPlatformsList.length > 1) {
      setIsSelectModalOpen(true);
    } else {
      executeStartSession(connectedPlatformsList[0].platform);
    }
  }, [connectedPlatformsList, executeStartSession, setActiveTab]);

  // ─── STOP SESSION HANDLER (SPRINT 17 GRACEFUL FINALIZATION) ───────────────
  const handleStopSession = useCallback(async () => {
    if (!activeSession || isStopping) return;
    setIsStopping(true);
    setStoppingStep("Closing collectors & saving analytics...");

    try {
      setStoppingStep("Generating final pulse snapshot & AI synthesis...");
      const res = await fetch("/api/detection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "stop",
          sessionId: activeSession.id,
        }),
      });

      setStoppingStep("Finalizing session summary & archiving stream...");
      const data = await res.json();
      if (data.summary) {
        setSessionSummary(data.summary);
      }

      // Transition session to COMPLETED mode (workspace remains active!)
      setActiveSession({
        ...activeSession,
        status: "completed",
      });
      setErrorState(null);
    } catch (e: any) {
      console.error("Failed to finalize session:", e);
    } finally {
      setIsStopping(false);
    }
  }, [activeSession, isStopping]);

  // ─── PART 7: ERROR STATES RENDERER COMPONENT ─────────────────────────────────
  const renderErrorBanner = () => {
    if (!errorState) return null;

    const isStopped = errorState.type === "stopped";
    const bgGradient = isStopped
      ? "rgba(99,102,241,0.08)"
      : "rgba(244,63,94,0.08)";
    const borderColor = isStopped
      ? "rgba(99,102,241,0.25)"
      : "rgba(244,63,94,0.25)";
    const textColor = isStopped ? "#818cf8" : "#fb7185";

    return (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        style={{
          width: "100%",
          maxWidth: "680px",
          margin: "0 auto 24px",
          padding: "16px 20px",
          borderRadius: "14px",
          background: bgGradient,
          border: `1px solid ${borderColor}`,
          fontFamily: "'Inter', sans-serif",
          textAlign: "left",
        }}
        role="alert"
        aria-live="polite"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "700", fontSize: "14px", color: textColor }}>
            <span>{isStopped ? "ℹ️" : "⚠️"}</span>
            <span>{errorState.title}</span>
          </div>
          <button
            onClick={() => setErrorState(null)}
            style={{
              background: "transparent",
              border: "none",
              color: "#64748b",
              fontSize: "14px",
              cursor: "pointer",
            }}
            aria-label="Dismiss message"
          >
            ✕
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", fontSize: "11px", lineHeight: 1.5 }}>
          <div>
            <span style={{ color: "#94a3b8", fontWeight: "600" }}>What happened:</span>
            <div style={{ color: "#cbd5e1", marginTop: "2px" }}>{errorState.whatHappened}</div>
          </div>
          <div>
            <span style={{ color: "#94a3b8", fontWeight: "600" }}>What NexCreator is doing:</span>
            <div style={{ color: "#cbd5e1", marginTop: "2px" }}>{errorState.whatNexCreatorIsDoing}</div>
          </div>
          <div>
            <span style={{ color: "#94a3b8", fontWeight: "600" }}>What you can do:</span>
            <div style={{ color: "#cbd5e1", marginTop: "2px" }}>{errorState.whatCreatorCanDo}</div>
          </div>
        </div>
      </motion.div>
    );
  };


  // ─── COMPLETED WORKSPACE RENDER (SPRINT 17.1 ARCHITECTURE) ───────────────────
  if (activeSession && activeSession.status === "completed") {
    return (
      <CompletedWorkspace
        session={activeSession}
        sessionSummary={sessionSummary}
        snapshots={snapshots}
        insights={insights}
        messages={liveMessages}
        onStartNewMonitoring={() => {
          setActiveSession(null);
          setSessionSummary(null);
          setErrorState(null);
        }}
      />
    );
  }

  // ─── LIVE WORKSPACE RENDER (SPRINT 17.3 SINGLE-SOURCE ARCHITECTURE) ─────────
  if (activeSession && ["waiting", "starting", "live", "paused", "offline_pending"].includes(activeSession.status)) {
    return (
      <LiveSessionProvider sessionId={activeSession.id} pollingIntervalMs={5000}>
        {renderErrorBanner()}
        <LiveWorkspace
          isStopping={isStopping}
          onStopSession={handleStopSession}
          onUpdateInsight={handleUpdateInsight}
        />

        {/* Stopping Progress Overlay */}
        <AnimatePresence>
          {isStopping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "rgba(10, 14, 26, 0.85)",
                backdropFilter: "blur(16px)",
                zIndex: 9999,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <div
                style={{
                  width: "420px",
                  padding: "32px",
                  borderRadius: "20px",
                  background: "rgba(13, 16, 27, 0.95)",
                  border: "1px solid rgba(168, 85, 247, 0.3)",
                  boxShadow: "0 25px 50px rgba(0,0,0,0.6)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  gap: "20px",
                }}
              >
                <div
                  style={{
                    width: "56px",
                    height: "56px",
                    borderRadius: "50%",
                    border: "3px solid rgba(168, 85, 247, 0.2)",
                    borderTopColor: "#c084fc",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <div>
                  <h3 style={{ margin: "0 0 6px", fontSize: "18px", fontWeight: "800", color: "#f8fafc" }}>
                    Finalizing Monitoring Session...
                  </h3>
                  <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8", fontFamily: "monospace" }}>
                    {stoppingStep}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </LiveSessionProvider>
    );
  }

  // ─── 1. LOADING INITIAL TELEMETRY STATE ────────────────────────────────────
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "75vh",
          color: "#94a3b8",
          gap: "16px",
        }}
        role="status"
        aria-live="polite"
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
          Synchronizing Live Monitoring Telemetry...
        </div>
      </div>
    );
  }

  // ─── 2. CREATOR OPERATING SYSTEM WORKSPACE (NON-LIVE / DAILY EXPERIENCE) ──────────────
  if (!activeSession) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "1400px", margin: "0 auto", padding: "20px", fontFamily: "'Inter', sans-serif" }}>
        
        {/* Top OS Navigation & Search Bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", borderRadius: "16px", background: "rgba(13, 16, 27, 0.85)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {[
              { id: "home", label: "🏠 Home", desc: "Daily Overview" },
              { id: "inbox", label: "📬 Inbox", desc: "AI Manager Updates" },
              { id: "compare", label: "📊 Compare", desc: "Benchmark Workspace" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setOsTab(tab.id as OsTab)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "10px",
                  border: "none",
                  background: osTab === tab.id ? "rgba(52, 211, 153, 0.15)" : "transparent",
                  color: osTab === tab.id ? "#34d399" : "#94a3b8",
                  fontSize: "13px",
                  fontWeight: osTab === tab.id ? "800" : "600",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Quick Action Ctrl + K Search Trigger */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              style={{
                padding: "8px 14px",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#94a3b8",
                fontSize: "12px",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>🔍 Search Workspace</span>
              <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", background: "rgba(255,255,255,0.08)", color: "#cbd5e1" }}>Ctrl + K</span>
            </button>

            {/* Notification Bell */}
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              style={{
                padding: "8px 12px",
                borderRadius: "10px",
                background: "rgba(255, 255, 255, 0.04)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                color: "#f8fafc",
                fontSize: "14px",
                cursor: "pointer",
                position: "relative",
              }}
            >
              🔔
            </button>
          </div>

          <NotificationCenterPanel isOpen={isNotificationOpen} onClose={() => setIsNotificationOpen(false)} />
        </div>

        {/* Global Command Palette */}
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          onNavigate={(tab) => setOsTab(tab as OsTab)}
          onStartMonitoring={() => setIsSelectModalOpen(true)}
        />

        {/* Main Operating System Active View */}
        {osTab === "home" && (
          <HomeDashboard
            onStartMonitoring={() => setIsSelectModalOpen(true)}
            onOpenLastReport={() => setActiveTab("history")}
            onReviewContentStrategy={() => setOsTab("compare")}
            onCompareStreams={() => setOsTab("compare")}
          />
        )}

        {osTab === "inbox" && <CreatorInbox />}

        {osTab === "compare" && <StreamComparison />}

        {/* Floating Quick Action Bar */}
        <div style={{ position: "fixed", bottom: "24px", right: "24px", display: "flex", gap: "10px", zIndex: 900 }}>
          <button
            onClick={() => setIsSelectModalOpen(true)}
            style={{
              padding: "12px 20px",
              borderRadius: "30px",
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              border: "none",
              color: "#ffffff",
              fontSize: "13px",
              fontWeight: "800",
              cursor: "pointer",
              boxShadow: "0 10px 25px rgba(16, 185, 129, 0.4)",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>📡</span> Start Live Monitoring
          </button>
        </div>

        {/* Multi-Platform Selection Modal */}
        {isSelectModalOpen && (

          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(6, 8, 16, 0.85)",
              backdropFilter: "blur(12px)",
              zIndex: 9999,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              style={{
                width: "100%",
                maxWidth: "520px",
                background: "rgba(15, 18, 32, 0.95)",
                border: "1px solid rgba(168, 85, 247, 0.3)",
                borderRadius: "20px",
                padding: "28px",
                boxShadow: "0 24px 64px rgba(0, 0, 0, 0.8), 0 0 40px rgba(168, 85, 247, 0.15)",
                textAlign: "left",
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid rgba(255, 255, 255, 0.08)" }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "800", color: "#f8fafc", display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "22px" }}>📡</span> Select Platform to Monitor
                  </h3>
                  <p style={{ margin: "6px 0 0", fontSize: "13px", color: "#94a3b8", lineHeight: 1.4 }}>
                    Choose a target platform or let NexCreator auto-detect live broadcasts.
                  </p>
                </div>
                <button
                  onClick={() => setIsSelectModalOpen(false)}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "10px",
                    background: "rgba(255, 255, 255, 0.06)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    color: "#94a3b8",
                    fontWeight: "bold",
                    fontSize: "14px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                  aria-label="Close Modal"
                >
                  ✕
                </button>
              </div>

              {/* Options List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
                {/* 1. Auto Detect Option */}
                <div
                  onClick={() => setSelectedPlatformChoice("auto")}
                  style={{
                    padding: "16px",
                    borderRadius: "14px",
                    border: selectedPlatformChoice === "auto" ? "1.5px solid #9146FF" : "1px solid rgba(255, 255, 255, 0.08)",
                    background: selectedPlatformChoice === "auto" ? "rgba(145, 70, 255, 0.12)" : "rgba(255, 255, 255, 0.02)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "16px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <div
                      style={{
                        width: "42px",
                        height: "42px",
                        borderRadius: "12px",
                        background: "rgba(145, 70, 255, 0.15)",
                        border: "1px solid rgba(145, 70, 255, 0.3)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "20px",
                        flexShrink: 0,
                      }}
                    >
                      📡
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <span style={{ fontWeight: "800", fontSize: "15px", color: "#f8fafc" }}>Auto Detect</span>
                        <span
                          style={{
                            fontSize: "10px",
                            fontWeight: "700",
                            padding: "2px 8px",
                            borderRadius: "10px",
                            background: "rgba(168, 85, 247, 0.2)",
                            border: "1px solid rgba(168, 85, 247, 0.4)",
                            color: "#c084fc",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                          }}
                        >
                          Recommended
                        </span>
                      </div>
                      <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "3px" }}>
                        Monitors all connected channels (Kick & YouTube) simultaneously
                      </div>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="platformChoice"
                    checked={selectedPlatformChoice === "auto"}
                    onChange={() => setSelectedPlatformChoice("auto")}
                    style={{ width: "18px", height: "18px", accentColor: "#9146FF", cursor: "pointer", flexShrink: 0 }}
                  />
                </div>

                {/* 2. Connected Platform Cards */}
                {connectedPlatformsList.map((cp) => {
                  const platName = cp.platform.toLowerCase();
                  const isKick = platName === "kick";
                  const isSelected = selectedPlatformChoice === platName;
                  const brandColor = isKick ? "#53FC18" : "#FF0000";
                  const brandBg = isKick ? "rgba(83, 252, 24, 0.12)" : "rgba(255, 0, 0, 0.12)";
                  const brandBorder = isKick ? "rgba(83, 252, 24, 0.3)" : "rgba(255, 0, 0, 0.3)";

                  return (
                    <div
                      key={cp.id}
                      onClick={() => setSelectedPlatformChoice(platName)}
                      style={{
                        padding: "16px",
                        borderRadius: "14px",
                        border: isSelected ? `1.5px solid ${brandColor}` : "1px solid rgba(255, 255, 255, 0.08)",
                        background: isSelected ? brandBg : "rgba(255, 255, 255, 0.02)",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: "16px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <div
                          style={{
                            width: "42px",
                            height: "42px",
                            borderRadius: "12px",
                            background: brandBg,
                            border: `1px solid ${brandBorder}`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "20px",
                            flexShrink: 0,
                          }}
                        >
                          {isKick ? "🟢" : "🔴"}
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontWeight: "800", fontSize: "15px", color: "#f8fafc" }}>
                              {cp.displayName || cp.username || cp.platform}
                            </span>
                            <span
                              style={{
                                fontSize: "10px",
                                fontWeight: "700",
                                padding: "2px 8px",
                                borderRadius: "10px",
                                background: brandBg,
                                border: `1px solid ${brandBorder}`,
                                color: isKick ? "#53FC18" : "#ff4d4d",
                                textTransform: "uppercase",
                              }}
                            >
                              {cp.platform}
                            </span>
                          </div>
                          <div style={{ fontSize: "12px", color: "#94a3b8", marginTop: "3px", fontFamily: "'JetBrains Mono', monospace" }}>
                            {cp.username || cp.channelUrl}
                          </div>
                        </div>
                      </div>
                      <input
                        type="radio"
                        name="platformChoice"
                        checked={isSelected}
                        onChange={() => setSelectedPlatformChoice(platName)}
                        style={{ width: "18px", height: "18px", accentColor: brandColor, cursor: "pointer", flexShrink: 0 }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer / Action Button */}
              <div style={{ paddingTop: "8px" }}>
                <button
                  onClick={() => executeStartSession(selectedPlatformChoice)}
                  className="btn btn-primary"
                  style={{
                    width: "100%",
                    padding: "14px 24px",
                    fontSize: "15px",
                    fontWeight: "800",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)",
                    color: "#ffffff",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 8px 24px rgba(168, 85, 247, 0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  Start Live Monitoring Session →
                </button>
              </div>
            </motion.div>
          </div>
        )}

        <div
          style={{
            width: "80px",
            height: "80px",
            borderRadius: "24px",
            background: "linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(99,102,241,0.1) 100%)",
            border: "1px solid rgba(168,85,247,0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "36px",
            marginBottom: "24px",
            boxShadow: "0 12px 36px rgba(168,85,247,0.25)",
          }}
        >
          📡
        </div>

        <h2 style={{ fontSize: "26px", fontWeight: "800", color: "#f8fafc", marginBottom: "8px" }}>
          No Active Monitoring Session
        </h2>
        <p style={{ fontSize: "14px", color: "#94a3b8", maxWidth: "480px", lineHeight: 1.6, marginBottom: "32px" }}>
          Start monitoring your channel to enable autonomous live stream detection, real-time telemetry metrics, and AI Producer assistance.
        </p>

        {/* PART 6: STEP-BY-STEP ANIMATED START BUTTON */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <button
            onClick={handleStartSession}
            disabled={startStep !== "idle"}
            className="btn btn-primary"
            style={{ padding: "12px 28px", fontSize: "14px", minWidth: "220px", display: "flex", alignItems: "center", justifyContent: "center" }}
            aria-label="Start Live Monitoring Session"
          >
            <AnimatePresence mode="wait">
              {startStep === "idle" && (
                <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Start Monitoring Session →
                </motion.span>
              )}
              {startStep === "starting" && (
                <motion.span key="starting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Starting Monitoring...
                </motion.span>
              )}
              {startStep === "connecting" && (
                <motion.span key="connecting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Connecting Daemon...
                </motion.span>
              )}
              {startStep === "initializing" && (
                <motion.span key="initializing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  Initializing Detection...
                </motion.span>
              )}
              {startStep === "active" && (
                <motion.span key="active" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  ✓ Monitoring Active
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <button
            onClick={() => setActiveTab("command_center")}
            className="btn btn-secondary"
            style={{ padding: "12px 24px", fontSize: "14px" }}
          >
            Return to Command Center
          </button>
        </div>
      </div>
    );
  }




  // ─── PART 3 & 4: PREMIUM WAITING STATE UX WITH TELEMETRY & TIMELINE ────────
  if (activeSession.status === "waiting") {
    const branding = getPlatformBranding(activeSession.platform);

    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          maxWidth: "840px",
          margin: "0 auto",
          padding: "36px 20px",
          textAlign: "center",
        }}
      >
        {renderErrorBanner()}

        {/* 🟡 Header Status Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 14px",
            borderRadius: "20px",
            background: branding.badgeBg,
            border: `1px solid ${branding.border}`,
            color: branding.badgeText,
            fontSize: "12px",
            fontWeight: "700",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            fontFamily: "'JetBrains Mono', monospace",
            marginBottom: "16px",
          }}
          role="status"
          aria-live="polite"
        >
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: branding.color,
              boxShadow: `0 0 10px ${branding.color}`,
              animation: "pulse 1.8s infinite",
            }}
          />
          {branding.icon} {branding.name} Monitoring Active
        </div>

        <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#f8fafc", marginBottom: "8px" }}>
          Live Stream Monitor
        </h2>
        <p style={{ fontSize: "14px", color: "#94a3b8", maxWidth: "520px", lineHeight: 1.6, marginBottom: "32px" }}>
          {branding.waitingText} We'll automatically activate your Live Workspace as soon as broadcast begins.
        </p>

        {/* PART 3 & 4: TELEMETRY GRID CARD */}
        <div
          style={{
            width: "100%",
            background: "rgba(13,16,27,0.7)",
            backdropFilter: "blur(16px)",
            border: `1px solid ${branding.border}`,
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "28px",
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
            textAlign: "left",
            fontFamily: "'Inter', sans-serif",
          }}
        >
          <div>
            <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "600" }}>Monitoring Mode</div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: branding.badgeText, marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>{branding.icon}</span> {activeSession.monitoringMode === "auto" || activeSession.platform === "auto" ? "Auto Detect" : "Single Platform"}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "600" }}>Platform</div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#f8fafc", marginTop: "4px" }}>
              {branding.name}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "600" }}>Detection Interval</div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#c084fc", marginTop: "4px", fontFamily: "monospace" }}>
              10 seconds
            </div>
          </div>

          <div>
            <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "600" }}>Last Checked</div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#f8fafc", marginTop: "4px", fontFamily: "monospace" }}>
              {lastCheckedSeconds} seconds ago
            </div>
          </div>

          <div>
            <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "600" }}>Next Check</div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#60a5fa", marginTop: "4px", fontFamily: "monospace" }}>
              in {nextCheckSeconds}s
            </div>
          </div>

          <div>
            <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "600" }}>Heartbeat</div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#10b981", marginTop: "4px" }}>
              Healthy ●
            </div>
          </div>

          <div style={{ gridColumn: "span 3", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: "11px", color: "#64748b" }}>
              Session ID: <span style={{ fontFamily: "monospace", color: "#cbd5e1" }}>{activeSession.id}</span>
            </div>
            <div style={{ fontSize: "11px", color: "#64748b" }}>
              Backend Poller: <span style={{ color: "#34d399", fontWeight: "600" }}>Connected</span>
            </div>
          </div>
        </div>

        {/* PART 3: STATUS TIMELINE */}
        <div
          style={{
            width: "100%",
            background: "rgba(13,16,27,0.5)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "16px",
            padding: "20px 24px",
            marginBottom: "32px",
            textAlign: "left",
          }}
        >
          <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.08em", marginBottom: "16px" }}>
            Status Timeline
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
            {/* Step 1 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#10b981", color: "#060810", fontSize: "11px", fontWeight: "900", display: "flex", alignItems: "center", justifyContent: "center" }}>✓</div>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#f8fafc" }}>Monitoring Started</span>
              </div>
              <span style={{ fontSize: "10px", color: "#64748b" }}>Session initialized</span>
            </div>

            {/* Step 2 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#10b981", color: "#060810", fontSize: "11px", fontWeight: "900", display: "flex", alignItems: "center", justifyContent: "center" }}>✓</div>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#f8fafc" }}>Detection Engine</span>
              </div>
              <span style={{ fontSize: "10px", color: "#64748b" }}>Daemon running</span>
            </div>

            {/* Step 3 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "rgba(234,179,8,0.2)", border: "1px solid #eab308", color: "#fde047", fontSize: "11px", fontWeight: "900", display: "flex", alignItems: "center", justifyContent: "center" }}>🟡</div>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#fde047" }}>Waiting for Stream</span>
              </div>
              <span style={{ fontSize: "10px", color: "#eab308" }}>Active polling</span>
            </div>

            {/* Step 4 */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", opacity: 0.4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "20px", height: "20px", borderRadius: "50%", border: "1px solid #64748b", color: "#64748b", fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center" }}>○</div>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "#cbd5e1" }}>Live Detected</span>
              </div>
              <span style={{ fontSize: "10px", color: "#64748b" }}>Pending stream start</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleStopSession}
          style={{
            padding: "10px 20px",
            borderRadius: "10px",
            background: "rgba(244, 63, 94, 0.1)",
            border: "1px solid rgba(244, 63, 94, 0.25)",
            color: "#fb7185",
            fontSize: "13px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          aria-label="Stop Monitoring Engine"
        >
          Stop Monitoring Engine
        </button>
      </motion.div>
    );
  }

  // ─── COMPLETED WORKSPACE RENDER (SPRINT 17.1 ARCHITECTURE) ───────────────────
  if (activeSession && activeSession.status === "completed") {
    return (
      <CompletedWorkspace
        session={activeSession}
        sessionSummary={sessionSummary}
        snapshots={snapshots}
        insights={insights}
        messages={liveMessages}
        onStartNewMonitoring={() => {
          setActiveSession(null);
          setSessionSummary(null);
          setErrorState(null);
        }}
      />
    );
  }



  // ─── IDLE WORKSPACE RENDER (START MONITORING PROMPT) ──────────────────────
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "75vh",
        gap: "20px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {renderErrorBanner()}
      <div
        style={{
          padding: "40px",
          borderRadius: "24px",
          background: "rgba(13, 16, 27, 0.85)",
          backdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          textAlign: "center",
          maxWidth: "480px",
        }}
      >
        <div style={{ fontSize: "40px", marginBottom: "16px" }}>📡</div>
        <h2 style={{ fontSize: "22px", fontWeight: "900", color: "#f8fafc", margin: "0 0 8px" }}>
          Creator Control Workspace
        </h2>
        <p style={{ fontSize: "14px", color: "#94a3b8", margin: "0 0 24px" }}>
          Initialize live telemetry monitoring or view auto-detected stream reports.
        </p>

        <button
          onClick={handleStartSession}
          disabled={startStep !== "idle"}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #a855f7, #6366f1)",
            border: "none",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: "800",
            cursor: startStep !== "idle" ? "not-allowed" : "pointer",
            boxShadow: "0 4px 20px rgba(168, 85, 247, 0.3)",
          }}
        >
          {startStep !== "idle" ? "Initializing Telemetry..." : "🚀 Start Monitoring Session"}
        </button>
      </div>
    </div>
  );
};

