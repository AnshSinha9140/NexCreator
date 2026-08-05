"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useApp } from "../context/AppContext";

export interface SynthesisStepItem {
  id: string;
  title: string;
  detail: string;
  status: "completed" | "active" | "pending";
  tags?: string[];
}

export const PendingView: React.FC = () => {
  const { currentUser, setCurrentUser, logout } = useApp();
  const [checking, setChecking] = useState(false);
  const [pollingStatus, setPollingStatus] = useState<"idle" | "polling" | "approved">("idle");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Dynamic Synthesis Stepper State (simulated progress / backend WebSocket target)
  const [activeStepIndex, setActiveStepIndex] = useState<number>(2); // Step 3 active by default

  // Canonical session polling: check /api/auth/session every 8 seconds
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && data.user && data.user.status === "verified") {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setPollingStatus("approved");
          const updatedUser = { ...data.user };
          setCurrentUser(updatedUser);
          localStorage.setItem("cm_current_user", JSON.stringify(updatedUser));
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 1800);
        }
      } catch (e) {
        // Silently retry
      }
    };

    setPollingStatus("polling");
    poll();
    intervalRef.current = setInterval(poll, 600000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [setCurrentUser]);

  const handleManualCheck = async () => {
    setChecking(true);
    try {
      const res = await fetch("/api/auth/session", { cache: "no-store" });
      const data = await res.json();
      if (data.success && data.user && data.user.status === "verified") {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setPollingStatus("approved");
        setCurrentUser(data.user);
        localStorage.setItem("cm_current_user", JSON.stringify(data.user));
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      }
    } catch (e) {
      // Silently handle
    } finally {
      setChecking(false);
    }
  };

  // Connected platform links & metadata extraction
  const userPlatforms = (currentUser as any)?.connectedPlatforms || [];
  const ytUrl =
    currentUser?.youtubeLink ||
    userPlatforms.find((p: any) => p.platform === "youtube")?.channelUrl ||
    "";
  const twUrl =
    currentUser?.twitchLink ||
    userPlatforms.find((p: any) => p.platform === "twitch")?.channelUrl ||
    "";
  const kcUrl =
    currentUser?.kickLink ||
    userPlatforms.find((p: any) => p.platform === "kick")?.channelUrl ||
    "";

  // Creator display name fallback
  const creatorDisplayName =
    currentUser?.displayName ||
    currentUser?.name ||
    (currentUser as any)?.email?.split("@")[0] ||
    "Creator";

  // Goal text for AI Thinking prompt
  const userGoal =
    (currentUser as any)?.goals?.targetViewers ||
    (currentUser as any)?.goals?.primaryGoal ||
    "reach 1,000 Concurrent Viewers & boost engagement";

  const synthesisSteps: SynthesisStepItem[] = [
    {
      id: "ingest",
      title: "Ingesting channel history & platform metadata...",
      detail: "Normalized past stream VOD telemetry and live API configurations.",
      status: activeStepIndex > 0 ? "completed" : activeStepIndex === 0 ? "active" : "pending",
      tags: ["YouTube API: OK", "Kick Pusher: ACTIVE"],
    },
    {
      id: "sentiment",
      title: "Analyzing chat sentiment & velocity baselines...",
      detail: "Calibrating baseline Messages Per Minute (MPM) and audience mood profiles.",
      status: activeStepIndex > 1 ? "completed" : activeStepIndex === 1 ? "active" : "pending",
      tags: ["MPM Delta: Ready", "Mood Map: 92% Positive"],
    },
    {
      id: "dna",
      title: "Constructing Creator DNA Matrix...",
      detail: "Building custom retention curves, persona hooks, and pacing archetypes.",
      status: activeStepIndex > 2 ? "completed" : activeStepIndex === 2 ? "active" : "pending",
      tags: ["Active Tuning", "Prompt Cache Warm"],
    },
    {
      id: "copilot",
      title: "Initializing Predictive Copilot Models...",
      detail: "Pre-loading real-time action suggestions and stream decision trees.",
      status: activeStepIndex > 3 ? "completed" : activeStepIndex === 3 ? "active" : "pending",
      tags: ["Awaiting Final Sync"],
    },
  ];

  // Approved State Transition View
  if (pollingStatus === "approved") {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#060810",
          color: "#f8fafc",
          fontFamily: "'Inter', sans-serif",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          style={{
            maxWidth: "480px",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, rgba(16, 185, 129, 0.3) 0%, rgba(59, 130, 246, 0.2) 100%)",
              border: "1px solid rgba(16, 185, 129, 0.6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "36px",
              boxShadow: "0 0 40px rgba(16, 185, 129, 0.4)",
            }}
          >
            🧠
          </div>

          <div>
            <h2 style={{ fontSize: "24px", fontWeight: "800", color: "#ffffff", marginBottom: "8px" }}>
              Synthesis Complete. Welcome Back.
            </h2>
            <p style={{ fontSize: "14px", color: "#94a3b8", lineHeight: "1.6" }}>
              I&apos;ve finished constructing your Creator DNA Matrix.<br />
              <span style={{ color: "#34d399", fontWeight: "600" }}>Your AI Command Center is online.</span>
            </p>
          </div>

          <div style={{ fontSize: "13px", color: "#64748b", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
            Opening your custom workspace…
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "radial-gradient(circle at 30% 20%, rgba(147, 51, 234, 0.14) 0%, transparent 60%), radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%), #060810",
        color: "#e2e8f0",
        fontFamily: "'Inter', sans-serif",
        padding: "32px 16px",
        boxSizing: "border-box",
        overflowY: "auto",
      }}
    >
      {/* Container with robust grid layout and responsive columns */}
      <div
        style={{
          width: "100%",
          maxWidth: "1140px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "24px",
          alignItems: "start",
        }}
      >
        {/* =================================================================== */}
        {/* LEFT COLUMN: Main Synthesis Experience & Terminal Stepper           */}
        {/* =================================================================== */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(18, 22, 40, 0.95) 0%, rgba(10, 13, 24, 0.98) 100%)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "24px",
            padding: "32px 28px",
            boxShadow: "0 24px 64px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
            display: "flex",
            flexDirection: "column",
            gap: "24px",
            boxSizing: "border-box",
          }}
        >
          {/* Status Badge & Auto-Poll Indicator */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "6px 14px",
                borderRadius: "99px",
                background: "rgba(168, 85, 247, 0.12)",
                border: "1px solid rgba(168, 85, 247, 0.35)",
                color: "#c084fc",
                fontSize: "11px",
                fontWeight: "700",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#10b981",
                  boxShadow: "0 0 10px #10b981",
                  display: "inline-block",
                }}
              />
              ● SYNTHESIZING CREATOR DNA...
            </div>

            <span style={{ fontSize: "11px", color: "#64748b", fontFamily: "monospace" }}>
              AUTO_POLL // 10 MINS
            </span>
          </div>

          {/* Title Header & Reassuring Copy */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "12px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "16px",
                  background: "linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(99, 102, 241, 0.15) 100%)",
                  border: "1px solid rgba(168, 85, 247, 0.4)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                  boxShadow: "0 8px 24px rgba(168, 85, 247, 0.25)",
                }}
              >
                🧠
              </div>
              <h1 style={{ fontSize: "26px", fontWeight: "800", color: "#ffffff", letterSpacing: "-0.5px", margin: 0 }}>
                Synthesizing Your AI Brain
              </h1>
            </div>

            <p style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: "1.6", margin: 0 }}>
              Building your custom AI Manager takes a little time while we process your channel telemetry.{" "}
              <span style={{ color: "#c084fc", fontWeight: "600" }}>You can keep this tab open or close it</span>—I&apos;ll send you an email the moment your command center is online.
            </p>
          </div>

          {/* Vertical Synthesis Stepper Terminal */}
          <div
            style={{
              background: "rgba(10, 13, 24, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              borderRadius: "18px",
              padding: "20px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "11px",
                fontWeight: "700",
                color: "#c084fc",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                paddingBottom: "10px",
                borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#c084fc" }} />
                LIVE_SYNTHESIS_TERMINAL
              </span>
              <span style={{ color: "#64748b" }}>STAGE 3 / 4</span>
            </div>

            {/* Stepper Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {synthesisSteps.map((step) => {
                const isCompleted = step.status === "completed";
                const isActive = step.status === "active";

                return (
                  <div
                    key={step.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      padding: "12px 14px",
                      borderRadius: "14px",
                      background: isActive
                        ? "rgba(168, 85, 247, 0.12)"
                        : "rgba(255, 255, 255, 0.02)",
                      border: isActive
                        ? "1px solid rgba(168, 85, 247, 0.35)"
                        : "1px solid rgba(255, 255, 255, 0.04)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {/* Circle Status Icon */}
                    <div style={{ marginTop: "2px", flexShrink: 0 }}>
                      {isCompleted && (
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            background: "rgba(16, 185, 129, 0.2)",
                            border: "1px solid rgba(16, 185, 129, 0.5)",
                            color: "#34d399",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: "bold",
                          }}
                        >
                          ✓
                        </div>
                      )}

                      {isActive && (
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            background: "rgba(168, 85, 247, 0.25)",
                            border: "1.5px solid #c084fc",
                            color: "#c084fc",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "12px",
                            fontWeight: "bold",
                            boxShadow: "0 0 12px rgba(168, 85, 247, 0.4)",
                          }}
                        >
                          ⚡
                        </div>
                      )}

                      {step.status === "pending" && (
                        <div
                          style={{
                            width: "24px",
                            height: "24px",
                            borderRadius: "50%",
                            background: "rgba(255, 255, 255, 0.04)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            color: "#475569",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "11px",
                          }}
                        >
                          ○
                        </div>
                      )}
                    </div>

                    {/* Step Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                        <h4
                          style={{
                            fontSize: "13px",
                            fontWeight: "700",
                            margin: 0,
                            color: isCompleted ? "#34d399" : isActive ? "#f8fafc" : "#64748b",
                          }}
                        >
                          {step.title}
                        </h4>

                        {isActive && (
                          <span
                            style={{
                              fontSize: "10px",
                              fontWeight: "700",
                              background: "rgba(168, 85, 247, 0.2)",
                              color: "#c084fc",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontFamily: "monospace",
                            }}
                          >
                            ACTIVE TUNING
                          </span>
                        )}
                      </div>

                      <p style={{ fontSize: "12px", color: "#94a3b8", margin: "4px 0 6px 0", lineHeight: "1.4" }}>
                        {step.detail}
                      </p>

                      {step.tags && (
                        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                          {step.tags.map((tag) => (
                            <span
                              key={tag}
                              style={{
                                fontSize: "10px",
                                fontFamily: "monospace",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                background: isCompleted
                                  ? "rgba(16, 185, 129, 0.1)"
                                  : "rgba(168, 85, 247, 0.1)",
                                border: isCompleted
                                  ? "1px solid rgba(16, 185, 129, 0.3)"
                                  : "1px solid rgba(168, 85, 247, 0.3)",
                                color: isCompleted ? "#34d399" : "#c084fc",
                              }}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Action Footer */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px", paddingTop: "8px" }}>
            <div style={{ display: "flex", gap: "12px" }}>
              <button
                onClick={logout}
                style={{
                  padding: "12px 18px",
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  color: "#cbd5e1",
                  fontSize: "13px",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                Log Out
              </button>

              <button
                onClick={handleManualCheck}
                disabled={checking}
                style={{
                  flex: 1,
                  padding: "12px 18px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
                  border: "none",
                  color: "#ffffff",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: checking ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 16px rgba(168, 85, 247, 0.35)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                {checking ? "Checking Engine Status…" : "Re-sync Engine Status 🔄"}
              </button>
            </div>

            <div style={{ fontSize: "11px", color: "#64748b", textAlign: "center" }}>
              💡 <strong>Admin Notice:</strong> Log in as an administrator (e.g. <span style={{ color: "#c084fc" }}>admin@nexcreator.com</span>) to review pending accounts.
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* RIGHT COLUMN: Persistent Context Panel                              */}
        {/* =================================================================== */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          
          {/* Card 1: Creator Snapshot */}
          <div
            style={{
              padding: "20px",
              borderRadius: "20px",
              background: "rgba(18, 22, 40, 0.8)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: "800", color: "#c084fc", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              👤 Creator Snapshot
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                <span style={{ color: "#94a3b8" }}>Creator Name</span>
                <span style={{ color: "#f8fafc", fontWeight: "700", textAlign: "right", wordBreak: "break-word" }}>
                  {creatorDisplayName}
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                <span style={{ color: "#94a3b8" }}>Workspace Status</span>
                <span style={{ color: "#c084fc", fontWeight: "700", background: "rgba(168, 85, 247, 0.15)", padding: "2px 8px", borderRadius: "6px", fontSize: "11px" }}>
                  Synthesizing...
                </span>
              </div>
            </div>

            {/* Connected Telemetry Section */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>
                CONNECTED TELEMETRY
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { label: "YouTube", color: "#ef4444", bg: "rgba(239, 68, 68, 0.15)", url: ytUrl },
                  { label: "Twitch", color: "#a855f7", bg: "rgba(168, 85, 247, 0.15)", url: twUrl },
                  { label: "Kick", color: "#53fc18", bg: "rgba(83, 252, 24, 0.15)", url: kcUrl },
                ].map(({ label, color, bg, url }) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 12px",
                      borderRadius: "10px",
                      background: "rgba(0,0,0,0.25)",
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <span style={{ color, background: bg, padding: "2px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "700" }}>
                      {label}
                    </span>

                    {url ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        style={{ color: "#60a5fa", textDecoration: "none", fontSize: "12px", fontWeight: "600" }}
                      >
                        View Link ↗
                      </a>
                    ) : (
                      <span style={{ color: "#64748b", fontSize: "11px" }}>Not Linked</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2: What I've Learned */}
          <div
            style={{
              padding: "20px",
              borderRadius: "20px",
              background: "rgba(18, 22, 40, 0.8)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: "800", color: "#c084fc", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              📝 WHAT I&apos;VE LEARNED
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
              {[
                "Creator Name",
                "Content Focus",
                "Platform Selection",
                "Growth Goals",
                "Manager Promise",
              ].map((item) => (
                <div key={item} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: "rgba(16, 185, 129, 0.2)",
                      border: "1px solid rgba(16, 185, 129, 0.5)",
                      color: "#34d399",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
                      fontWeight: "bold",
                    }}
                  >
                    ✓
                  </div>
                  <span style={{ color: "#e2e8f0", fontWeight: "600" }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: AI Synthesis Thinking */}
          <div
            style={{
              padding: "20px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(99, 102, 241, 0.1) 100%)",
              border: "1px solid rgba(168, 85, 247, 0.3)",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "11px", fontWeight: "800", color: "#c084fc", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                🧠 AI SYNTHESIS THINKING
              </span>

              {/* 3-dot pulse */}
              <div style={{ display: "flex", gap: "4px" }}>
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#c084fc", animation: "pulse 1.2s infinite" }} />
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#c084fc", animation: "pulse 1.2s infinite 0.2s" }} />
                <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#c084fc", animation: "pulse 1.2s infinite 0.4s" }} />
              </div>
            </div>

            <p style={{ fontSize: "13px", color: "#cbd5e1", lineHeight: "1.5", fontStyle: "italic", margin: 0 }}>
              &quot;Compiling your custom strategy based on your goal to {userGoal}.&quot;
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: "10px",
                borderTop: "1px solid rgba(255,255,255,0.08)",
                fontSize: "11px",
              }}
            >
              <span style={{ color: "#94a3b8" }}>Target Baseline</span>
              <span style={{ color: "#c084fc", fontWeight: "700", fontFamily: "monospace" }}>100% Personalization</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
