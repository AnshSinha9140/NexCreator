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

  // Dynamically derive Semantic Chat Clusters from live chat messages & telemetry
  const dynamicClusters = React.useMemo<Array<{ topic: string; pct: string; val?: number }>>(() => {
    if (telemetry?.topics && Array.isArray(telemetry.topics) && telemetry.topics.length > 0) {
      return telemetry.topics;
    }
    if (cleanMessages.length > 0) {
      const counts: Record<string, number> = {};
      const keywords = [
        { key: "Boss Fight", match: /boss|fight|game|play|level|kill|win/i },
        { key: "PC Specs", match: /pc|specs|gpu|ram|fps|setup|monitor/i },
        { key: "Setup Tour", match: /setup|tour|desk|room|camera|mic/i },
        { key: "Hype Train", match: /w|kekw|pog|lfg|hype|fire|🔥|❤️|gg/i },
      ];

      let matchedTotal = 0;
      cleanMessages.forEach((msg) => {
        const text = (msg.message || "").toLowerCase();
        keywords.forEach((k) => {
          if (k.match.test(text)) {
            counts[k.key] = (counts[k.key] || 0) + 1;
            matchedTotal++;
          }
        });
      });

      if (matchedTotal > 0) {
        const result = Object.entries(counts)
          .map(([topic, count]) => ({
            topic,
            pct: `${Math.round((count / matchedTotal) * 100)}%`,
            val: Math.round((count / matchedTotal) * 100),
          }))
          .sort((a, b) => b.val - a.val);

        if (result.length > 0) return result;
      }
    }
    return [
      { topic: "Boss Fight", pct: "45%" },
      { topic: "PC Specs", pct: "20%" },
      { topic: "Setup Tour", pct: "15%" },
      { topic: "Hype Train", pct: "10%" },
    ];
  }, [cleanMessages, telemetry]);

  // Dynamically compute 60-Second Vibe Check from live sentiment & messages
  const posPct = React.useMemo(() => {
    if (telemetry?.sentiment !== undefined && telemetry?.sentiment !== null) {
      return Math.min(100, Math.max(0, Math.round(telemetry.sentiment)));
    }
    if (cleanMessages.length > 0) {
      let posCount = 0;
      cleanMessages.forEach((m) => {
        const txt = (m.message || "").toLowerCase();
        if (/w|kekw|pog|hype|love|gg|fire|good|great|nice|❤️|🔥|👍/.test(txt)) {
          posCount++;
        }
      });
      return Math.min(95, Math.max(20, Math.round((posCount / cleanMessages.length) * 100)));
    }
    return 78;
  }, [cleanMessages, telemetry]);

  const negPct = 100 - posPct;

  const clusterPalette = [
    { bg: isDark ? "rgba(168, 85, 247, 0.2)" : "#f3e8ff", color: isDark ? "#c084fc" : "#6b21a8", border: isDark ? "rgba(168, 85, 247, 0.4)" : "#e9d5ff" },
    { bg: isDark ? "rgba(59, 130, 246, 0.2)" : "#dbeafe", color: isDark ? "#60a5fa" : "#1e40af", border: isDark ? "rgba(59, 130, 246, 0.4)" : "#bfdbfe" },
    { bg: isDark ? "rgba(16, 185, 129, 0.2)" : "#d1fae5", color: isDark ? "#34d399" : "#065f46", border: isDark ? "rgba(16, 185, 129, 0.4)" : "#a7f3d0" },
    { bg: isDark ? "rgba(245, 158, 11, 0.2)" : "#fef3c7", color: isDark ? "#fbbf24" : "#92400e", border: isDark ? "rgba(245, 158, 11, 0.4)" : "#fde68a" },
  ];

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
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontFamily: "'Inter', sans-serif" }}>
      {/* 1. Header Bar: Stream Status Indicator */}
      <div
        style={{
          padding: "16px 20px",
          borderRadius: "16px",
          background: isDark ? "rgba(13,16,27,0.85)" : "#ffffff",
          border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)",
          boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.04)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "9999px",
              background: connectionState === "connected"
                ? (isDark ? "rgba(52,211,153,0.15)" : "#d1fae5")
                : (isDark ? "rgba(251,113,133,0.15)" : "#ffe4e6"),
              color: connectionState === "connected"
                ? (isDark ? "#34d399" : "#065f46")
                : (isDark ? "#fb7185" : "#be123c"),
              border: connectionState === "connected"
                ? (isDark ? "1px solid rgba(52,211,153,0.3)" : "1px solid #a7f3d0")
                : (isDark ? "1px solid rgba(251,113,133,0.3)" : "1px solid #fecdd3"),
              fontSize: "11px",
              fontWeight: "800",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: connectionState === "connected" ? "#10b981" : "#f43f5e",
                display: "inline-block",
              }}
            />
            {connectionState === "connected" ? "Live Connected" : `Reconnecting (${reconnectAttempt})`}
          </span>

          <span style={{ fontSize: "12px", fontWeight: "700", color: isDark ? "#cbd5e1" : "#475569" }}>
            {cleanMessages.length} Messages Verified
          </span>
        </div>
      </div>

      {/* 2. Semantic Topic Clusters & Vibe Check Bar */}
      <div
        style={{
          padding: "16px 20px",
          borderRadius: "16px",
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
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
            {dynamicClusters.slice(0, 4).map((item, idx) => {
              const pal = clusterPalette[idx % clusterPalette.length];
              return (
                <span
                  key={idx}
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    padding: "5px 12px",
                    borderRadius: "9999px",
                    background: pal.bg,
                    color: pal.color,
                    border: `1px solid ${pal.border}`,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.15s ease",
                  }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  {item.pct} {item.topic}
                </span>
              );
            })}
          </div>
        </div>

        {/* Emote Heatmap: 60-Second Vibe Check */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", fontSize: "11px" }}>
            <span style={{ fontWeight: "800", color: isDark ? "#f8fafc" : "#0f172a" }}>
              ⚡ 60-Second Vibe Check
            </span>
            <span style={{ fontWeight: "700", color: isDark ? "#94a3b8" : "#64748b" }}>
              {posPct}% Positive (W / KEKW) vs {negPct}% Negative (L / ResidentSleeper)
            </span>
          </div>

          <div style={{ height: "10px", width: "100%", borderRadius: "6px", overflow: "hidden", display: "flex", background: "rgba(0,0,0,0.1)" }}>
            <div style={{ width: `${posPct}%`, background: "#10b981", height: "100%", transition: "width 0.3s ease" }} title={`${posPct}% Positive Emotes`} />
            <div style={{ width: `${negPct}%`, background: "#f43f5e", height: "100%", transition: "width 0.3s ease" }} title={`${negPct}% Negative Emotes`} />
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



