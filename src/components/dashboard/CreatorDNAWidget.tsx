"use client";

import React from "react";
import { motion } from "framer-motion";
import { Flame, MessageSquare, Radio, Sparkles, TrendingUp } from "lucide-react";

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
        background: "rgba(13,16,27,0.7)",
        border: "1px solid rgba(255,255,255,0.07)",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        height: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div
          style={{
            fontSize: "12px",
            fontWeight: "700",
            color: "#c084fc",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          <Sparkles style={{ width: "14px", height: "14px", color: "#a855f7" }} />
          <span>Creator DNA & Telemetry</span>
        </div>
        <span
          style={{
            fontSize: "9px",
            fontWeight: "700",
            padding: "2px 8px",
            borderRadius: "99px",
            background: "rgba(168, 85, 247, 0.15)",
            color: "#c084fc",
            border: "1px solid rgba(168, 85, 247, 0.3)",
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
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "4px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Career Streams
            </span>
            <Radio style={{ width: "12px", height: "12px", color: "#34d399" }} />
          </div>
          <div style={{ fontSize: "18px", fontWeight: "900", color: "#f8fafc", margin: "2px 0" }}>
            {profile.totalStreamsAnalyzed}
          </div>
          <div style={{ fontSize: "10px", color: "#64748b" }}>
            Total Analyzed
          </div>
        </motion.div>

        {/* Metric 2: Avg Health */}
        <motion.div
          whileHover={{ y: -1 }}
          style={{
            padding: "10px 12px",
            borderRadius: "10px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "4px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Avg Health
            </span>
            <TrendingUp style={{ width: "12px", height: "12px", color: "#c084fc" }} />
          </div>
          <div style={{ fontSize: "18px", fontWeight: "900", color: "#34d399", margin: "2px 0", display: "flex", alignItems: "baseline" }}>
            <span>{profile.avgBroadcastScore}</span>
            <span style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", marginLeft: "3px" }}>/100</span>
          </div>
          <div style={{ fontSize: "10px", color: "#64748b" }}>
            Broadcast Quality
          </div>
        </motion.div>

        {/* Metric 3: Baseline Velocity */}
        <motion.div
          whileHover={{ y: -1 }}
          style={{
            padding: "10px 12px",
            borderRadius: "10px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "4px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Baseline Velocity
            </span>
            <MessageSquare style={{ width: "12px", height: "12px", color: "#60a5fa" }} />
          </div>
          <div style={{ fontSize: "18px", fontWeight: "900", color: "#60a5fa", margin: "2px 0", display: "flex", alignItems: "baseline" }}>
            <span>{profile.avgMessagesPerMinute}</span>
            <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: "600", marginLeft: "4px" }}>msgs/min</span>
          </div>
          <div style={{ fontSize: "10px", color: "#64748b" }}>
            Audience Engagement
          </div>
        </motion.div>

        {/* Metric 4: Audience Mood */}
        <motion.div
          whileHover={{ y: -1 }}
          style={{
            padding: "10px 12px",
            borderRadius: "10px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "4px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "10px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Audience Mood
            </span>
            <Flame style={{ width: "12px", height: "12px", color: "#fbbf24" }} />
          </div>
          <div style={{ margin: "2px 0" }}>
            <span
              style={{
                fontSize: "11px",
                fontWeight: "800",
                color: "#fbbf24",
                background: "rgba(245, 158, 11, 0.12)",
                border: "1px solid rgba(245, 158, 11, 0.25)",
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
          <div style={{ fontSize: "10px", color: "#64748b" }}>
            Calibrated Sentiment
          </div>
        </motion.div>
      </div>
    </div>
  );
};
