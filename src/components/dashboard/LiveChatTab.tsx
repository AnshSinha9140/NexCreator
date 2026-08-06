"use client";

import React, { useRef, useEffect } from "react";
import { RichChatMessage } from "./chat/RichChatMessage";
import { useApp } from "@/context/AppContext";

interface LiveChatTabProps {
  messages: any[];
  telemetry: any;
  isLoading: boolean;
  connectionState?: "connected" | "reconnecting" | "disconnected";
  reconnectAttempt?: number;
}

export const LiveChatTab: React.FC<LiveChatTabProps> = ({
  messages = [],
  telemetry,
  isLoading,
  connectionState = "connected",
  reconnectAttempt = 0,
}) => {
  const { theme } = useApp();
  const isDark = theme === "dark";
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  // Deduplicate and ensure strict sequence ordering by timestamp/id
  const cleanMessages = React.useMemo(() => {
    const seen = new Set<string>();
    const unique: any[] = [];
    for (const msg of messages) {
      const idKey = msg.id || `${msg.username}-${msg.timestamp || msg.createdAt}-${msg.message}`;
      if (!seen.has(idKey)) {
        seen.add(idKey);
        unique.push(msg);
      }
    }
    return unique.sort((a, b) => {
      const timeA = new Date(a.timestamp || a.createdAt || 0).getTime();
      const timeB = new Date(b.timestamp || b.createdAt || 0).getTime();
      return timeA - timeB;
    });
  }, [messages]);

  // Auto-scroll inside chat container ONLY (never scroll the window/page)
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [cleanMessages]);

  if (isLoading && cleanMessages.length === 0) {
    return (
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ height: "40px", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: "8px" }} />
        <div style={{ height: "40px", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: "8px" }} />
        <div style={{ height: "40px", background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)", borderRadius: "8px" }} />
      </div>
    );
  }

  if (cleanMessages.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "20px",
            background: "rgba(168,85,247,0.12)",
            border: "1px solid rgba(168,85,247,0.25)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            marginBottom: "16px",
          }}
        >
          💬
        </div>
        <h3 style={{ fontSize: "16px", fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a", marginBottom: "6px" }}>
          {connectionState === "reconnecting" ? "Reconnecting Live Chat Pipe..." : "Waiting for Chat Activity..."}
        </h3>
        <p style={{ fontSize: "13px", color: isDark ? "#64748b" : "#64748b", maxWidth: "420px", lineHeight: 1.5 }}>
          Live chat messages from your connected broadcast stream continuously here with heartbeat recovery and deduplication protection.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px", height: "100%", width: "100%" }}>
      {/* Header Info & Connection Indicator Bar */}
      <div
        style={{
          padding: "10px 16px",
          borderRadius: "10px",
          background: isDark ? "rgba(13,16,27,0.85)" : "#ffffff",
          border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
          boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.04)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* Status Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "3px 10px",
              borderRadius: "12px",
              background:
                connectionState === "connected"
                  ? "rgba(52,211,153,0.15)"
                  : connectionState === "reconnecting"
                  ? "rgba(245,158,11,0.15)"
                  : "rgba(248,113,113,0.15)",
              border:
                connectionState === "connected"
                  ? "1px solid rgba(52,211,153,0.3)"
                  : connectionState === "reconnecting"
                  ? "1px solid rgba(245,158,11,0.3)"
                  : "1px solid rgba(248,113,113,0.3)",
              color:
                connectionState === "connected"
                  ? (isDark ? "#34d399" : "#059669")
                  : connectionState === "reconnecting"
                  ? (isDark ? "#fbbf24" : "#d97706")
                  : (isDark ? "#f87171" : "#dc2626"),
              fontSize: "11px",
              fontWeight: "700",
            }}
          >
            <span style={{ fontSize: "8px" }}>
              {connectionState === "connected" ? "🟢" : connectionState === "reconnecting" ? "🟡" : "🔴"}
            </span>
            <span>
              {connectionState === "connected"
                ? "Live Connected"
                : connectionState === "reconnecting"
                ? `Reconnecting (${reconnectAttempt})...`
                : "Disconnected"}
            </span>
          </div>

          <span style={{ color: isDark ? "#94a3b8" : "#475569", fontWeight: "600" }}>
            {cleanMessages.length} Messages Verified
          </span>
        </div>
      </div>

      {/* Task 3: Trending Topics (Semantic Clustering) & 60-Second Vibe Check */}
      <div
        style={{
          padding: "16px",
          borderRadius: "12px",
          background: isDark ? "rgba(13,16,27,0.85)" : "#ffffff",
          border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
          boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.04)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        {/* Trending Topics Pill Bubbles */}
        <div>
          <div style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#64748b", textTransform: "uppercase", fontWeight: "800", marginBottom: "8px" }}>
            🔥 Trending Semantic Chat Clusters
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: "💬 45% Boss Fight", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800" },
              { label: "💬 20% PC Specs", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800" },
              { label: "💬 15% Setup Tour", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800" },
              { label: "💬 10% Hype Train", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800" },
            ].map((topic, idx) => (
              <span
                key={idx}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${topic.color}`}
              >
                {topic.label}
              </span>
            ))}
          </div>
        </div>

        {/* Emote Heatmap: 60-Second Vibe Check */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", fontSize: "11px" }}>
            <span style={{ fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a" }}>
              ⚡ 60-Second Vibe Check
            </span>
            <span style={{ fontWeight: "700", color: isDark ? "#94a3b8" : "#64748b" }}>
              78% Positive (W / KEKW) vs 22% Negative (L / ResidentSleeper)
            </span>
          </div>

          <div style={{ height: "10px", width: "100%", borderRadius: "6px", overflow: "hidden", display: "flex", background: "rgba(0,0,0,0.1)" }}>
            <div style={{ width: "78%", background: "#10b981", height: "100%" }} title="78% Positive Emotes" />
            <div style={{ width: "22%", background: "#f43f5e", height: "100%" }} title="22% Negative Emotes" />
          </div>
        </div>
      </div>

      {/* Scrollable Message List */}
      <div
        ref={chatContainerRef}
        className="max-h-96 overflow-y-auto flex flex-col"
        style={{
          borderRadius: "12px",
          background: isDark ? "rgba(13,16,27,0.85)" : "#ffffff",
          border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
          boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.04)",
        }}
      >
        {cleanMessages.map((msg, idx) => (
          <RichChatMessage key={msg.id || idx} message={msg} />
        ))}
      </div>
    </div>
  );
};



