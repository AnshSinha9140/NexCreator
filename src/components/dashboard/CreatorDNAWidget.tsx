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
    typicalAudienceMood: "Hyped",
  };

  const metrics = [
    {
      id: "career-streams",
      label: "Career Streams",
      value: profile.totalStreamsAnalyzed,
      format: (val: number | string) => `${val}`,
      icon: "📡",
      subtext: "Total Analyzed",
      color: "text-emerald-400",
    },
    {
      id: "avg-health",
      label: "Avg Health",
      value: profile.avgBroadcastScore,
      format: (val: number | string) => `${val}/100`,
      icon: "💚",
      subtext: "Broadcast Quality",
      color: "text-purple-400",
    },
    {
      id: "baseline-velocity",
      label: "Baseline Velocity",
      value: profile.avgMessagesPerMinute,
      format: (val: number | string) => `${val} msgs/min`,
      icon: "💬",
      subtext: "Audience Engagement",
      color: "text-blue-400",
    },
    {
      id: "audience-mood",
      label: "Audience Mood",
      value: profile.typicalAudienceMood,
      format: (val: number | string) => `${val}`,
      icon: "🔥",
      subtext: "Calibrated Sentiment",
      color: "text-amber-400",
    },
  ];

  return (
    <div className="w-full rounded-2xl bg-slate-900/50 border border-slate-800 p-6 backdrop-blur-xl shadow-xl flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs text-slate-400 uppercase tracking-wider font-extrabold flex items-center gap-2">
          <span>🧬</span> Creator DNA & Telemetry Benchmarks
        </h3>
        <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full uppercase">
          Live Profile
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {metrics.map((m) => (
          <motion.div
            key={m.id}
            whileHover={{ scale: 1.015 }}
            className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-4 flex flex-col justify-between gap-2 shadow-sm hover:border-purple-500/30 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                {m.label}
              </span>
              <span className="text-lg">{m.icon}</span>
            </div>

            <div className="text-2xl font-bold text-white tracking-tight">
              {m.format(m.value)}
            </div>

            <div className="text-[10px] font-mono text-slate-500 flex items-center justify-between">
              <span>{m.subtext}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
