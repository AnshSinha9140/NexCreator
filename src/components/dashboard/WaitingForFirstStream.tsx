"use client";

import React from "react";
import { motion } from "framer-motion";
import { useApp } from "@/context/AppContext";

interface WaitingForFirstStreamProps {
  creatorName: string;
  setActiveTab: (tab: string) => void;
  workspaceState?: any;
}

export const WaitingForFirstStream: React.FC<WaitingForFirstStreamProps> = ({
  creatorName,
  setActiveTab,
  workspaceState,
}) => {
  const { currentUser } = useApp();

  const completedSessionsCount = workspaceState?.completedSessionsCount ?? 0;
  const milestones = workspaceState?.journeyMilestones || [
    { id: "research", label: "Research", completed: true },
    { id: "alignment", label: "Alignment", completed: true },
    { id: "first_stream", label: "First Monitored Stream", completed: completedSessionsCount >= 1, current: completedSessionsCount === 0 },
    { id: "three_sessions", label: "3 Sessions Completed", completed: completedSessionsCount >= 3 },
    { id: "first_report", label: "First AI Report", completed: completedSessionsCount >= 1 },
    { id: "highlights", label: "Highlights Generated", completed: completedSessionsCount >= 1 },
    { id: "long_term_memory", label: "Long-Term Memory Growing", completed: completedSessionsCount >= 3, locked: completedSessionsCount < 3 },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const containerStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "32px",
    maxWidth: "1000px",
    margin: "0 auto",
    fontFamily: "'Inter', sans-serif",
    color: "#f8fafc",
  };

  const sectionStyle: React.CSSProperties = {
    background: "rgba(13, 17, 30, 0.65)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    borderRadius: "20px",
    padding: "32px",
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  };

  const badgeStyle: React.CSSProperties = {
    padding: "6px 14px",
    borderRadius: "99px",
    background: "rgba(168, 85, 247, 0.1)",
    border: "1px solid rgba(168, 85, 247, 0.25)",
    color: "#c084fc",
    fontSize: "11px",
    fontWeight: "700",
    fontFamily: "'JetBrains Mono', monospace",
    alignSelf: "flex-start",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      style={containerStyle}
    >
      {/* Hero Welcome */}
      <div style={sectionStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: "900", margin: 0, color: "#f8fafc" }}>
              {getGreeting()}, {creatorName}
            </h1>
            <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#a855f7", marginTop: "6px", marginBottom: "0" }}>
              Your Creator Intelligence Foundation is Complete.
            </h2>
          </div>
          <div style={badgeStyle}>
            System Ready
          </div>
        </div>
        <p style={{ fontSize: "15px", color: "#cbd5e1", lineHeight: "1.6", margin: 0 }}>
          I've studied your content history, community, goals, and creator DNA. Now I need to watch you create.
          Your first monitored stream is where our real live coaching begins.
        </p>
      </div>

      {/* Workspace Status and AI Manager Note */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* Workspace Status (Derived Dynamically from Workspace State) */}
        <div style={sectionStyle}>
          <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#c084fc", margin: 0 }}>
            Workspace Status
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {[
              { label: "Creator Research Complete", checked: true },
              { label: "Creator DNA Ready", checked: true },
              { label: "Mission Established", checked: true },
              { label: "AI Relationship Ready", checked: true },
              { label: completedSessionsCount > 0 ? "First Monitored Stream Completed" : "Waiting For First Monitored Stream", checked: completedSessionsCount > 0 },
            ].map((step, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  border: step.checked ? "none" : "2px solid #475569",
                  background: step.checked ? "#10b981" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}>
                  {step.checked ? "✓" : ""}
                </span>
                <span style={{ fontSize: "14px", color: step.checked ? "#e2e8f0" : "#64748b", fontWeight: step.checked ? "600" : "400" }}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Manager Note */}
        <div style={{ ...sectionStyle, background: "linear-gradient(135deg, rgba(147, 51, 234, 0.08) 0%, rgba(99, 102, 241, 0.05) 100%)", border: "1px solid rgba(168,85,247,0.2)" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "800", color: "#a855f7", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
            <span>✉️</span> AI Manager Note
          </h3>
          <p style={{ fontSize: "14px", color: "#cbd5e1", lineHeight: "1.6", margin: 0, fontStyle: "italic" }}>
            "I've spent hours understanding who you are as a creator. Research tells me where you've been. Your first monitored stream will tell me how you actually perform. That's when our long-term coaching really begins."
          </p>
        </div>
      </div>

      {/* Primary Call to Action Card */}
      <div style={{
        background: "linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(10,13,24,0.95) 100%)",
        border: "1px solid rgba(16,185,129,0.3)",
        borderRadius: "20px",
        padding: "32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
      }}>
        <div style={{ flex: 1, marginRight: "24px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "800", color: "#f8fafc", margin: "0 0 6px" }}>
            Your First Stream
          </h3>
          <p style={{ fontSize: "14px", color: "#94a3b8", margin: 0, lineHeight: "1.5" }}>
            Every monitored stream teaches me something new about your pacing, storytelling, audience relationship and broadcast habits.
          </p>
        </div>
        <button
          onClick={() => setActiveTab("live")}
          style={{
            background: "#10b981",
            color: "#060810",
            border: "none",
            borderRadius: "12px",
            padding: "14px 28px",
            fontWeight: "800",
            fontSize: "14px",
            cursor: "pointer",
            boxShadow: "0 10px 20px rgba(16,185,129,0.25)"
          }}
        >
          Start First Monitoring Session
        </button>
      </div>

      {/* Dynamic Journey Timeline (Sprint 22.2 single source of truth) */}
      <div style={sectionStyle}>
        <h3 style={{ fontSize: "15px", fontWeight: "800", color: "#f8fafc", margin: 0 }}>
          Journey Timeline
        </h3>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", position: "relative", padding: "10px 0" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: "2px", background: "rgba(255,255,255,0.1)", zIndex: 0 }} />
          {milestones.map((node: any, idx: number) => (
            <div key={node.id || idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", zIndex: 1 }}>
              <div style={{
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                background: node.completed ? "#10b981" : node.current ? "#a855f7" : "#1e293b",
                border: node.current ? "2px solid #fff" : "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: "10px",
                fontWeight: "bold"
              }}>
                {node.completed ? "✓" : idx + 1}
              </div>
              <span style={{ fontSize: "11px", fontWeight: node.current ? "700" : "400", color: node.current ? "#a855f7" : node.completed ? "#10b981" : "#64748b" }}>
                {node.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

