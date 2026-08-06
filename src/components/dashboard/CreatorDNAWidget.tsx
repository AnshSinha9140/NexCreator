"use client";

import React from "react";
import { motion } from "framer-motion";
import { Activity, Flame, MessageSquare, Radio, Sparkles, TrendingUp } from "lucide-react";

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
    <div className="w-full rounded-2xl bg-[#0d101b]/90 border border-purple-500/20 p-5 backdrop-blur-xl shadow-2xl flex flex-col justify-between gap-4 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 font-sans">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Creator DNA & Telemetry</span>
        </h3>
        <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[10px] font-bold font-mono tracking-wider uppercase">
          Live Profile
        </span>
      </div>

      {/* 2x2 Metric Grid */}
      <div className="grid grid-cols-2 gap-3 flex-1">
        {/* Metric 1: Career Streams */}
        <motion.div
          whileHover={{ y: -1 }}
          className="rounded-xl bg-slate-900/60 hover:bg-slate-900/90 border border-white/5 hover:border-purple-500/30 p-3.5 flex flex-col justify-between gap-1.5 transition-all duration-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-sans">
              Career Streams
            </span>
            <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Radio className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-white tracking-tight">
            {profile.totalStreamsAnalyzed}
          </div>
          <div className="text-[10px] text-slate-500 font-medium font-sans">
            Total Analyzed
          </div>
        </motion.div>

        {/* Metric 2: Avg Health */}
        <motion.div
          whileHover={{ y: -1 }}
          className="rounded-xl bg-slate-900/60 hover:bg-slate-900/90 border border-white/5 hover:border-purple-500/30 p-3.5 flex flex-col justify-between gap-1.5 transition-all duration-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-sans">
              Avg Health
            </span>
            <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-emerald-400 tracking-tight">
            {profile.avgBroadcastScore}
            <span className="text-xs font-semibold text-slate-500">/100</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium font-sans">
            Broadcast Quality
          </div>
        </motion.div>

        {/* Metric 3: Baseline Velocity */}
        <motion.div
          whileHover={{ y: -1 }}
          className="rounded-xl bg-slate-900/60 hover:bg-slate-900/90 border border-white/5 hover:border-purple-500/30 p-3.5 flex flex-col justify-between gap-1.5 transition-all duration-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-sans">
              Baseline Velocity
            </span>
            <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <MessageSquare className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-extrabold text-blue-400 tracking-tight">
            {profile.avgMessagesPerMinute}
            <span className="text-xs font-bold text-slate-400 ml-1">msgs/min</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium font-sans">
            Audience Engagement
          </div>
        </motion.div>

        {/* Metric 4: Audience Mood */}
        <motion.div
          whileHover={{ y: -1 }}
          className="rounded-xl bg-slate-900/60 hover:bg-slate-900/90 border border-white/5 hover:border-purple-500/30 p-3.5 flex flex-col justify-between gap-1.5 transition-all duration-200 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-sans">
              Audience Mood
            </span>
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-0.5">
            <span className="text-xs sm:text-sm font-extrabold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 inline-block max-w-full truncate">
              {profile.typicalAudienceMood}
            </span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium font-sans">
            Calibrated Sentiment
          </div>
        </motion.div>
      </div>
    </div>
  );
};
