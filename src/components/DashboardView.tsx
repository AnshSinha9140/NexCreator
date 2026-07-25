"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MonitoringSession, ConnectedPlatformAccount } from "@/types";

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
  // Navigation & Session State
  const [activeModule, setActiveModule] = useState<LiveModuleTab>("pulse");
  const [activeSession, setActiveSession] = useState<MonitoringSession | null>(null);
  const [connectedPlatform, setConnectedPlatform] = useState<ConnectedPlatformAccount | null>(null);
  const [detectionMetadata, setDetectionMetadata] = useState<any>(null);

  // Loading & Transition States
  const [isLoading, setIsLoading] = useState(true);
  const [startStep, setStartStep] = useState<StartStep>("idle");
  const [errorState, setErrorState] = useState<ErrorState | null>(null);

  // Telemetry & Browser Countdown Timers (0 Network Overhead)
  const [lastPolledAt, setLastPolledAt] = useState<string | null>(null);
  const [lastCheckedSeconds, setLastCheckedSeconds] = useState<number>(0);
  const [nextCheckSeconds, setNextCheckSeconds] = useState<number>(10);

  const pollerTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

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
          if (platData.success && platData.defaultPlatform) {
            setConnectedPlatform(platData.defaultPlatform);
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

  // ─── PART 5: LOCAL BROWSER COUNTDOWN TICKER (0 NETWORK REQUESTS) ─────────────
  useEffect(() => {
    if (activeSession && ["waiting", "starting", "live"].includes(activeSession.status)) {
      const updateLocalCountdown = () => {
        if (!lastPolledAt) {
          setLastCheckedSeconds(0);
          setNextCheckSeconds(10);
          return;
        }

        const now = Date.now();
        const polledTime = new Date(lastPolledAt).getTime();
        const elapsedSeconds = Math.max(0, Math.floor((now - polledTime) / 1000));
        
        setLastCheckedSeconds(elapsedSeconds);
        setNextCheckSeconds(Math.max(0, 10 - (elapsedSeconds % 10)));
      };

      updateLocalCountdown();
      countdownTimerRef.current = setInterval(updateLocalCountdown, 1000);
    } else {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    }

    return () => {
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
        countdownTimerRef.current = null;
      }
    };
  }, [activeSession?.id, activeSession?.status, lastPolledAt]);

  // ─── PART 6: ANIMATED START SESSION WITH STEP TRANSITIONS ─────────────────
  const handleStartSession = useCallback(async () => {
    if (!connectedPlatform) {
      setActiveTab("settings");
      return;
    }

    setErrorState(null);
    setStartStep("starting");

    try {
      // Step 1 ➔ 2 Transition
      await new Promise((r) => setTimeout(r, 400));
      setStartStep("connecting");

      // Step 2 ➔ 3 Transition
      await new Promise((r) => setTimeout(r, 400));
      setStartStep("initializing");

      // Resolve real Kick chatroom.id BEFORE starting session via our server-side proxy
      // (kick.com/api/v2 is CORS-blocked from browser; we proxy it server-side)
      let resolvedChatroomId: string | undefined;
      if (connectedPlatform.platform === "kick") {
        const kickUsername = connectedPlatform.username || connectedPlatform.channelUrl?.split("kick.com/")[1]?.split("/")[0];
        if (kickUsername) {
          try {
            const chatroomRes = await fetch(`/api/kick/chatroom?slug=${encodeURIComponent(kickUsername.toLowerCase())}`);
            if (chatroomRes.ok) {
              const chatroomData = await chatroomRes.json();
              if (chatroomData?.chatroomId) {
                resolvedChatroomId = String(chatroomData.chatroomId);
                console.log(`[Dashboard] ✅ Resolved Kick chatroom.id for '${kickUsername}': #${resolvedChatroomId} (via ${chatroomData.source})`);
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
          connectedPlatformId: connectedPlatform.id,
          platform: connectedPlatform.platform,
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

      // PART 1 OPTIMIZATION: Use returned session payload directly (0 extra GET requests)
      if (data.session) {
        setActiveSession(data.session);
      } else {
        // Construct clean local session state from start response
        setActiveSession({
          id: data.sessionId,
          userId: connectedPlatform.username || "creator",
          platform: connectedPlatform.platform,
          connectedPlatformId: connectedPlatform.id,
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
          streamTitle: `${connectedPlatform.displayName || connectedPlatform.platform}'s Live Stream`,
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
  }, [connectedPlatform, setActiveTab]);

  // ─── STOP SESSION HANDLER ──────────────────────────────────────────────────
  const handleStopSession = useCallback(async () => {
    if (!activeSession) return;
    try {
      await fetch("/api/detection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "stop",
          sessionId: activeSession.id,
        }),
      });

      setActiveSession(null);
      setDetectionMetadata(null);
      setLastPolledAt(null);
      setErrorState({
        type: "stopped",
        title: "Monitoring Stopped",
        whatHappened: "The live detection monitoring session was manually terminated.",
        whatNexCreatorIsDoing: "Stopped backend detection daemon and cleared local telemetry.",
        whatCreatorCanDo: "Click 'Start Monitoring Session' whenever you prepare for your next broadcast.",
      });
    } catch (e: any) {
      console.error("Failed to stop session:", e);
    }
  }, [activeSession]);

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

  // ─── 2. NO MONITORING SESSION (OFFLINE / EMPTY STATE) ────────────────
  if (!activeSession) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "75vh",
          padding: "48px 24px",
          textAlign: "center",
        }}
      >
        {renderErrorBanner()}

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
      </motion.div>
    );
  }

  // ─── PART 3 & 4: PREMIUM WAITING STATE UX WITH TELEMETRY & TIMELINE ────────
  if (activeSession.status === "waiting") {
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
            background: "rgba(234, 179, 8, 0.1)",
            border: "1px solid rgba(234, 179, 8, 0.25)",
            color: "#fde047",
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
              background: "#eab308",
              boxShadow: "0 0 10px #eab308",
              animation: "pulse 1.8s infinite",
            }}
          />
          🟡 Waiting for Stream
        </div>

        <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#f8fafc", marginBottom: "8px" }}>
          Monitoring is Active
        </h2>
        <p style={{ fontSize: "14px", color: "#94a3b8", maxWidth: "520px", lineHeight: 1.6, marginBottom: "32px" }}>
          We'll automatically detect when you go live on <strong style={{ color: "#34d399", textTransform: "uppercase" }}>{activeSession.platform}</strong> and activate your Live Workspace.
        </p>

        {/* PART 3 & 4: TELEMETRY GRID CARD */}
        <div
          style={{
            width: "100%",
            background: "rgba(13,16,27,0.7)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.08)",
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
            <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "600" }}>Monitoring Status</div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#34d399", marginTop: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontSize: "10px" }}>●</span> Active
            </div>
          </div>

          <div>
            <div style={{ fontSize: "11px", color: "#64748b", textTransform: "uppercase", fontWeight: "600" }}>Platform</div>
            <div style={{ fontSize: "14px", fontWeight: "700", color: "#f8fafc", marginTop: "4px", textTransform: "uppercase" }}>
              {activeSession.platform}
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

  // ─── PART 4: MULTI-PANEL LIVE WORKSPACE (STREAM ACTIVE STATE) ───────────────────
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "220px 1fr 300px",
        gap: "16px",
        height: "calc(100vh - 110px)",
        overflow: "hidden",
      }}
    >
      {/* ─── LEFT PANEL: LIVE MODULE NAVIGATION ─────────────────────────── */}
      <div
        style={{
          background: "rgba(13,16,27,0.7)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "16px",
          padding: "16px 12px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        <div
          style={{
            padding: "0 8px 8px",
            fontSize: "10px",
            fontWeight: "700",
            color: "#475569",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          Live Modules
        </div>

        {LIVE_NAV.map((mod) => {
          const isActive = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod.id)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "10px",
                border: isActive ? "1px solid rgba(168,85,247,0.3)" : "1px solid transparent",
                background: isActive ? "rgba(168,85,247,0.12)" : "transparent",
                color: isActive ? "#c084fc" : "#64748b",
                fontSize: "13px",
                fontWeight: isActive ? "700" : "500",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
              }}
              aria-label={`Switch to module ${mod.name}`}
            >
              <span style={{ fontSize: "14px" }}>{mod.icon}</span>
              <span>{mod.name}</span>
            </button>
          );
        })}
      </div>

      {/* ─── CENTER PANEL: SELECTED MODULE WORKSPACE CONTENT ───────────── */}
      <div
        style={{
          background: "rgba(13,16,27,0.7)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "16px",
          padding: "24px",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {/* Module Header */}
        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#f8fafc", display: "flex", alignItems: "center", gap: "10px" }}>
            <span>{LIVE_NAV.find((m) => m.id === activeModule)?.icon}</span>
            <span>{LIVE_NAV.find((m) => m.id === activeModule)?.name}</span>
          </h2>
          <p style={{ fontSize: "12px", color: "#64748b", marginTop: "4px" }}>
            {LIVE_NAV.find((m) => m.id === activeModule)?.desc}
          </p>
        </div>

        {/* Module Content Container */}
        <div
          style={{
            flex: 1,
            borderRadius: "14px",
            border: "1px dashed rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.01)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "36px",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: "36px", marginBottom: "16px" }}>
            {LIVE_NAV.find((m) => m.id === activeModule)?.icon}
          </span>
          <h3 style={{ fontSize: "16px", fontWeight: "700", color: "#e2e8f0", marginBottom: "8px" }}>
            {LIVE_NAV.find((m) => m.id === activeModule)?.name} Engine
          </h3>
          <p style={{ fontSize: "13px", color: "#64748b", maxWidth: "420px", lineHeight: 1.5 }}>
            {activeModule === "pulse" && "Real-time audience sentiment velocity, CPM chat rate, and live hype scores will render dynamically here when chat streams are connected."}
            {activeModule === "producer" && "Automated real-time recommendations, topic prompts, and retention warnings will display here during live broadcasts."}
            {activeModule === "timeline" && "Key stream markers, peak hype spikes, laughter clusters, and clip candidates will populate on an interactive live scrubber."}
            {activeModule === "chat" && "Aggregated live stream chat messages with sentiment tags and toxicity flags will stream here in real time."}
            {activeModule === "highlights" && "AI-detected 15-60s clip candidates for Shorts, TikToks, and Reels will be automatically queued here."}
          </p>
        </div>
      </div>

      {/* ─── RIGHT PANEL: REAL DETECTED SESSION TELEMETRY ─────────────────── */}
      <div
        style={{
          background: "rgba(13,16,27,0.7)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "16px",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            fontWeight: "700",
            color: "#475569",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontFamily: "'JetBrains Mono', monospace",
          }}
        >
          Session Telemetry
        </div>

        {/* Live / Offline Pending Status Badge */}
        {activeSession?.status === "offline_pending" ? (
          <div
            style={{
              padding: "12px",
              borderRadius: "12px",
              background: "rgba(234, 179, 8, 0.1)",
              border: "1px solid rgba(234, 179, 8, 0.3)",
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
            role="status"
            aria-live="polite"
          >
            <div style={{ fontSize: "12px", fontWeight: "700", color: "#fde047", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#eab308", boxShadow: "0 0 8px #eab308" }} />
              RECONNECTING (OFFLINE PENDING)
            </div>
            <div style={{ fontSize: "11px", color: "#fef08a", lineHeight: 1.4 }}>
              Stream appears to be offline. Waiting for reconnection before ending monitoring ({activeSession.metadata?.remainingGraceSeconds ? `${Math.floor(activeSession.metadata.remainingGraceSeconds / 60)}m ${activeSession.metadata.remainingGraceSeconds % 60}s` : "5m 00s"} remaining).
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: "12px",
              borderRadius: "12px",
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
            role="status"
            aria-live="polite"
          >
            <span style={{ fontSize: "12px", fontWeight: "700", color: "#34d399", display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
              LIVE STREAM DETECTED
            </span>
            <span style={{ fontSize: "10px", color: "#10b981", fontFamily: "monospace" }}>
              {activeSession?.status.toUpperCase() || "LIVE"}
            </span>
          </div>
        )}

        {/* Stream Title */}
        {activeSession?.streamTitle && (
          <div>
            <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontFamily: "monospace" }}>Stream Title</div>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#f8fafc", marginTop: "2px" }}>{activeSession.streamTitle}</div>
          </div>
        )}

        {/* PART 4: TELEMETRY METRICS LIST */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#64748b" }}>Detection Engine:</span>
            <span style={{ color: "#34d399", fontWeight: "600" }}>Running</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#64748b" }}>Backend Poller:</span>
            <span style={{ color: "#34d399", fontWeight: "600" }}>Connected</span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#64748b" }}>Monitoring Session:</span>
            <span style={{ color: activeSession?.status === "offline_pending" ? "#eab308" : "#34d399", fontWeight: "600" }}>
              {activeSession?.status === "offline_pending" ? "Offline Pending 🟡" : "Healthy ●"}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#64748b" }}>Platform:</span>
            <span style={{ color: "#f8fafc", fontWeight: "600", textTransform: "uppercase" }}>
              {activeSession?.platform || "KICK"}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#64748b" }}>Category:</span>
            <span style={{ color: "#c084fc", fontWeight: "600" }}>
              {activeSession?.streamCategory || "Gaming"}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#64748b" }}>Live Viewers:</span>
            <span style={{ color: typeof activeSession?.viewerCount === "number" && activeSession.viewerCount > 0 ? "#34d399" : "#94a3b8", fontWeight: "bold", fontFamily: "monospace" }}>
              {typeof activeSession?.viewerCount === "number" && activeSession.viewerCount > 0
                ? activeSession.viewerCount.toLocaleString()
                : "—"}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#64748b" }}>Peak Viewers:</span>
            <span style={{ color: typeof activeSession?.peakViewerCount === "number" && activeSession.peakViewerCount > 0 ? "#c084fc" : "#94a3b8", fontWeight: "bold", fontFamily: "monospace" }}>
              {typeof activeSession?.peakViewerCount === "number" && activeSession.peakViewerCount > 0
                ? activeSession.peakViewerCount.toLocaleString()
                : "—"}
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "#64748b" }}>Duration:</span>
            <span style={{ color: "#f8fafc", fontWeight: "600", fontFamily: "monospace" }}>
              {formatDuration(activeSession)}
            </span>
          </div>

          {/* PART 5: LOCAL COUNTDOWN TICKER DISPLAY */}
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "10px", marginTop: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px" }}>
              <span style={{ color: "#64748b" }}>Last Checked:</span>
              <span style={{ color: "#cbd5e1", fontFamily: "monospace" }}>{lastCheckedSeconds}s ago</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginTop: "4px" }}>
              <span style={{ color: "#64748b" }}>Next Check:</span>
              <span style={{ color: "#60a5fa", fontFamily: "monospace" }}>in {nextCheckSeconds}s</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleStopSession}
          style={{
            marginTop: "auto",
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            background: "rgba(244, 63, 94, 0.1)",
            border: "1px solid rgba(244, 63, 94, 0.25)",
            color: "#fb7185",
            fontSize: "12px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
          aria-label="Stop Monitoring Session"
        >
          Stop Monitoring
        </button>
      </div>
    </div>
  );
};
