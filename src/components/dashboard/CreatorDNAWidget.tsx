"use client";

import React from "react";
import { motion } from "framer-motion";

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
    totalStreamsAnalyzed: 12,
    avgBroadcastScore: 85,
    avgMessagesPerMinute: 10,
    typicalAudienceMood: "Hyped & Engaged",
  };

  const metrics = [
    {
      id: "career-streams",
      label: "Career Streams",
      value: profile.totalStreamsAnalyzed,
      format: (val: number | string) => `${val}`,
      icon: "📡",
      subtext: "Total Analyzed",
    },
    {
      id: "avg-health",
      label: "Avg Health",
      value: profile.avgBroadcastScore,
      format: (val: number | string) => `${val}/100`,
      icon: "💚",
      subtext: "Broadcast Quality",
    },
    {
      id: "baseline-velocity",
      label: "Baseline Velocity",
      value: profile.avgMessagesPerMinute,
      format: (val: number | string) => `${val} msgs/min`,
      icon: "💬",
      subtext: "Audience Engagement",
    },
    {
      id: "audience-mood",
      label: "Audience Mood",
      value: profile.typicalAudienceMood,
      format: (val: number | string) => `${val}`,
      icon: "🔥",
      subtext: "Calibrated Sentiment",
    },
  ];

  return (
    <div className="w-full rounded-2xl bg-slate-900/60 border border-white/10 p-4 backdrop-blur-xl shadow-xl flex flex-col justify-between gap-3 min-h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] text-purple-400 uppercase tracking-widest font-extrabold font-mono flex items-center gap-1.5">
          <span>🧬</span> Creator DNA & Telemetry Benchmarks
        </h3>
        <span className="text-[9px] font-mono font-bold text-purple-300 bg-purple-500/15 border border-purple-500/30 px-2 py-0.5 rounded-full uppercase">
          Live Profile
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 flex-1">
        {metrics.map((m) => (
          <motion.div
            key={m.id}
            whileHover={{ scale: 1.015 }}
            className="rounded-xl bg-slate-950/70 border border-white/5 p-3 flex flex-col justify-between gap-1 shadow-sm hover:border-purple-500/30 transition-all duration-150"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-extrabold font-mono truncate">
                {m.label}
              </span>
              <span className="text-sm">{m.icon}</span>
            </div>

            <div
              className="text-lg font-black text-white tracking-tight leading-snug truncate"
              title={m.format(m.value)}
            >
              {m.format(m.value)}
            </div>

            <div className="text-[9px] font-mono text-slate-500 truncate">
              {m.subtext}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
