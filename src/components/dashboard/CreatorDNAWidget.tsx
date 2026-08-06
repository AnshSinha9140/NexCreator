"use client";

import React from "react";
import { motion } from "framer-motion";
import { Flame, MessageSquare, Radio, Sparkles, TrendingUp } from "lucide-react";
import { useApp } from "@/context/AppContext";

export interface CreatorProfileMetrics {
  totalStreamsAnalyzed: number;
  avgBroadcastScore: number;
  avgMessagesPerMinute: number;
  typicalAudienceMood: string;
}

export interface CreatorDNAWidgetProps {
  creatorProfile?: CreatorProfileMetrics;
}

export const CreatorDNAWidget: React.FC<CreatorDNAWidgetProps> = ({ creatorProfile }) => {
  const { theme } = useApp();
  const isDark = theme === "dark";

  const profile: CreatorProfileMetrics = creatorProfile || {
    totalStreamsAnalyzed: 6,
    avgBroadcastScore: 85,
    avgMessagesPerMinute: 10,
    typicalAudienceMood: "Hyped & Engaged",
  };

  return (
    <div
      style={{
        padding: "16px",
        borderRadius: "16px",
        background: isDark ? "rgba(13,16,27,0.7)" : "#ffffff",
        border: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        height: "100%",
        boxSizing: "border-box",
        boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            fontSize: "12px",
            fontWeight: "700",
            color: isDark ? "#c084fc" : "#9333ea",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: "monospace",
          }}
        >
          <Sparkles style={{ width: "14px", height: "14px", color: isDark ? "#a855f7" : "#9333ea" }} />
          <span>Creator DNA & Telemetry</span>
        </div>
        <span
          style={{
            fontSize: "9px",
            fontWeight: "700",
            padding: "2px 8px",
            borderRadius: "99px",
            background: isDark ? "rgba(168, 85, 247, 0.15)" : "rgba(168, 85, 247, 0.08)",
            color: isDark ? "#c084fc" : "#9333ea",
            border: isDark ? "1px solid rgba(168, 85, 247, 0.3)" : "1px solid rgba(168, 85, 247, 0.2)",
            fontFamily: "monospace",
          }}
        >
          LIVE PROFILE
        </span>
      </div>

      {/* 2x2 Metric Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", flex: 1 }}>
        {/* Metric 1: Career Streams */}
        <motion.div
          whileHover={{ y: -1 }}
          style={{
            padding: "10px 12px",
            borderRadius: "10px",
            background: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc",
            border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "4px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "10px", fontWeight: "700", color: isDark ? "#94a3b8" : "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Career Streams
            </span>
            <Radio style={{ width: "12px", height: "12px", color: isDark ? "#34d399" : "#059669" }} />
          </div>
          <div style={{ fontSize: "18px", fontWeight: "900", color: isDark ? "#f8fafc" : "#0f172a", margin: "2px 0" }}>
            {profile.totalStreamsAnalyzed}
          </div>
          <div style={{ fontSize: "10px", color: isDark ? "#64748b" : "#94a3b8" }}>
            Total Analyzed
          </div>
        </motion.div>

        {/* Metric 2: Avg Health */}
        <motion.div
          whileHover={{ y: -1 }}
          style={{
            padding: "10px 12px",
            borderRadius: "10px",
            background: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc",
            border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "4px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "10px", fontWeight: "700", color: isDark ? "#94a3b8" : "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Avg Health
            </span>
            <TrendingUp style={{ width: "12px", height: "12px", color: isDark ? "#c084fc" : "#9333ea" }} />
          </div>
          <div style={{ fontSize: "18px", fontWeight: "900", color: isDark ? "#34d399" : "#059669", margin: "2px 0", display: "flex", alignItems: "baseline" }}>
            <span>{profile.avgBroadcastScore}</span>
            <span style={{ fontSize: "11px", color: isDark ? "#64748b" : "#94a3b8", fontWeight: "600", marginLeft: "3px" }}>/100</span>
          </div>
          <div style={{ fontSize: "10px", color: isDark ? "#64748b" : "#94a3b8" }}>
            Broadcast Quality
          </div>
        </motion.div>

        {/* Metric 3: Baseline Velocity */}
        <motion.div
          whileHover={{ y: -1 }}
          style={{
            padding: "10px 12px",
            borderRadius: "10px",
            background: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc",
            border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "4px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "10px", fontWeight: "700", color: isDark ? "#94a3b8" : "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Baseline Velocity
            </span>
            <MessageSquare style={{ width: "12px", height: "12px", color: isDark ? "#60a5fa" : "#2563eb" }} />
          </div>
          <div style={{ fontSize: "18px", fontWeight: "900", color: isDark ? "#60a5fa" : "#2563eb", margin: "2px 0", display: "flex", alignItems: "baseline" }}>
            <span>{profile.avgMessagesPerMinute}</span>
            <span style={{ fontSize: "11px", color: isDark ? "#94a3b8" : "#475569", fontWeight: "600", marginLeft: "4px" }}>msgs/min</span>
          </div>
          <div style={{ fontSize: "10px", color: isDark ? "#64748b" : "#94a3b8" }}>
            Audience Engagement
          </div>
        </motion.div>

        {/* Metric 4: Audience Mood */}
        <motion.div
          whileHover={{ y: -1 }}
          style={{
            padding: "10px 12px",
            borderRadius: "10px",
            background: isDark ? "rgba(255,255,255,0.02)" : "#f8fafc",
            border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid #e2e8f0",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "4px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "10px", fontWeight: "700", color: isDark ? "#94a3b8" : "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Audience Mood
            </span>
            <Flame style={{ width: "12px", height: "12px", color: isDark ? "#fbbf24" : "#d97706" }} />
          </div>
          <div style={{ margin: "2px 0" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: "800",
                color: isDark ? "#fbbf24" : "#d97706",
                background: isDark ? "rgba(245, 158, 11, 0.12)" : "rgba(245, 158, 11, 0.1)",
                border: isDark ? "1px solid rgba(245, 158, 11, 0.25)" : "1px solid rgba(245, 158, 11, 0.2)",
                padding: "2px 6px",
                borderRadius: "5px",
                display: "inline-block",
                maxWidth: "100%",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {profile.typicalAudienceMood}
            </span>
          </div>
          <div style={{ fontSize: "10px", color: isDark ? "#64748b" : "#94a3b8" }}>
            Calibrated Sentiment
          </div>
        </motion.div>
      </div>
    </div>
  );
};
