"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  Brain,
  CheckCircle2,
  Film,
  Flame,
  MessageSquare,
  Play,
  Radio,
  Sparkles,
  TrendingUp,
  Tv,
  Upload,
  Users,
} from "lucide-react";

// ─── TYPES & INTERFACES ──────────────────────────────────────────────────────

export interface CreatorProfileData {
  totalStreamsAnalyzed: number;
  avgBroadcastScore: number;
  avgMessagesPerMinute: number;
  typicalAudienceMood: string;
}

export interface SessionItemData {
  id: string;
  streamTitle?: string;
  platform?: string;
  createdAt?: string;
  startedAt?: string;
  sessionDuration?: number;
  durationFormatted?: string;
  peakViewers?: number;
  peakViewerCount?: number;
  totalMessages?: number;
  highlights?: any[];
  highlightsCount?: number;
  status?: string;
}

export interface DashboardWelcomeProps {
  creatorName?: string;
  creatorProfile?: CreatorProfileData;
  sessions?: SessionItemData[];
  unpublishedHighlightsCount?: number;
  onStartLiveMonitoring?: () => void;
  onUploadVOD?: () => void;
  onReviewClips?: () => void;
}

// ─── FRAMER MOTION VARIANTS ──────────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const },
  },
};

// ─── 1. HERO ZONE (AI EXECUTIVE BRIEFING) ────────────────────────────────────

export const HeroZone: React.FC<{
  creatorName: string;
  managerNote: string;
}> = ({ creatorName, managerNote }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <motion.div
      variants={cardVariants}
      className="relative w-full rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900/80 to-slate-950 border border-purple-500/30 p-6 sm:p-8 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col gap-5"
    >
      {/* Top Accent Line */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent" />

      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-50 tracking-tight flex items-center gap-3">
            {getGreeting()}, <span className="text-purple-400">{creatorName}</span>
          </h1>
          <p className="text-xs sm:text-sm font-medium text-slate-400 mt-1">
            NexCreator Executive Briefing · Single Source of Truth Workspace
          </p>
        </div>

        {/* Glowing Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs font-bold font-mono tracking-wide shadow-[0_0_15px_rgba(168,85,247,0.25)]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <Brain className="w-3.5 h-3.5 text-purple-400" />
          <span>AI Manager Online</span>
        </div>
      </div>

      {/* Today's Manager Note */}
      <div className="rounded-xl bg-slate-950/60 border border-purple-500/20 p-4 sm:p-5 flex flex-col gap-2 relative">
        <div className="flex items-center gap-2 text-purple-400 text-xs font-extrabold tracking-wider uppercase">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Today&apos;s Manager Note</span>
        </div>
        <p className="text-slate-200 text-sm sm:text-base font-semibold leading-relaxed">
          &quot;{managerNote}&quot;
        </p>
      </div>
    </motion.div>
  );
};

// ─── 2. LIVE COMMAND BAR (QUICK ACTIONS) ─────────────────────────────────────

export const LiveCommandBar: React.FC<{
  unpublishedHighlightsCount: number;
  onStartLiveMonitoring?: () => void;
  onUploadVOD?: () => void;
  onReviewClips?: () => void;
}> = ({
  unpublishedHighlightsCount,
  onStartLiveMonitoring,
  onUploadVOD,
  onReviewClips,
}) => {
  return (
    <motion.div variants={cardVariants} className="w-full">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Action 1: Start Live Monitoring */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStartLiveMonitoring}
          className="relative group rounded-xl p-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-900/30 border border-purple-400/30 flex items-center justify-between transition-all duration-200 cursor-pointer overflow-hidden"
        >
          <div className="flex items-center gap-3 z-10">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="text-left">
              <div className="text-xs uppercase text-purple-200 font-extrabold tracking-wider">Live Control</div>
              <div className="text-sm font-extrabold text-white">Start Live Monitoring</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-purple-200 group-hover:translate-x-1 transition-transform z-10" />
        </motion.button>

        {/* Action 2: Upload VOD */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onUploadVOD}
          className="relative group rounded-xl p-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-sm flex items-center justify-between transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Upload className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-left">
              <div className="text-xs uppercase text-slate-400 font-extrabold tracking-wider">Content Studio</div>
              <div className="text-sm font-extrabold text-slate-100">Upload VOD</div>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
        </motion.button>

        {/* Action 3: Review Ready Clips */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onReviewClips}
          className="relative group rounded-xl p-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-sm flex items-center justify-between transition-all duration-200 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center relative">
              <Film className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-left">
              <div className="text-xs uppercase text-slate-400 font-extrabold tracking-wider">Highlights</div>
              <div className="text-sm font-extrabold text-slate-100">Review Ready Clips</div>
            </div>
          </div>

          {/* Dynamic Notification Badge */}
          {unpublishedHighlightsCount > 0 ? (
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500 text-white text-xs font-black tracking-wide shadow-md animate-bounce">
              🎬 {unpublishedHighlightsCount} Ready
            </span>
          ) : (
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
          )}
        </motion.button>
      </div>
    </motion.div>
  );
};

// ─── 3. CREATOR DNA & BENCHMARKS WIDGET ──────────────────────────────────────

export const CreatorDNAWidget: React.FC<{
  profile: CreatorProfileData;
}> = ({ profile }) => {
  return (
    <motion.div
      variants={cardVariants}
      className="w-full rounded-2xl bg-slate-950/80 border border-slate-800/80 p-6 backdrop-blur-xl shadow-xl flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-extrabold tracking-widest text-purple-400 uppercase flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-400" />
          <span>Creator DNA & Telemetry Benchmarks</span>
        </h3>
        <span className="text-[10px] font-mono text-slate-500 uppercase">Live Calibrated</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Streams Analyzed */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Streams Analyzed</span>
            <Tv className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-400">
            {profile.totalStreamsAnalyzed}
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Sessions Processed</span>
        </div>

        {/* Metric 2: Avg. Stream Health */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Avg. Stream Health</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-purple-400">
            {profile.avgBroadcastScore}<span className="text-sm font-semibold text-slate-500">/100</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-purple-500 h-full rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, profile.avgBroadcastScore))}%` }}
            />
          </div>
        </div>

        {/* Metric 3: Avg. Chat Velocity */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Avg. Chat Velocity</span>
            <MessageSquare className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-blue-400">
            {profile.avgMessagesPerMinute} <span className="text-xs font-bold text-slate-400">msgs/min</span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">Real-time Audience Tempo</span>
        </div>

        {/* Metric 4: Audience Mood */}
        <div className="rounded-xl bg-slate-900/70 border border-slate-800 p-4 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Audience Mood</span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-amber-300">
            {profile.typicalAudienceMood}
          </div>
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Calibrated Sentiment
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// ─── 4. INTERACTIVE SESSION HISTORY (BROADCAST HUB) ──────────────────────────

export const SessionHistoryList: React.FC<{
  sessions: SessionItemData[];
}> = ({ sessions }) => {
  return (
    <motion.div
      variants={cardVariants}
      className="w-full rounded-2xl bg-slate-950/80 border border-slate-800/80 p-6 backdrop-blur-xl shadow-xl flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-extrabold tracking-widest text-purple-400 uppercase flex items-center gap-2">
          <Tv className="w-4 h-4 text-purple-400" />
          <span>Interactive Session History (Broadcast Hub)</span>
        </h3>
        <span className="text-[10px] font-mono text-slate-500 uppercase">
          {sessions.length} {sessions.length === 1 ? "Session" : "Sessions"} Archived
        </span>
      </div>

      {sessions.length > 0 ? (
        <div className="flex flex-col gap-3">
          {sessions.map((session) => {
            const sessionId = session.id;
            const peakViewers = session.peakViewerCount ?? session.peakViewers ?? 0;
            const totalMessages = session.totalMessages ?? 0;
            const highlightsList = session.highlights || [];
            const clipsCount = highlightsList.length > 0 ? highlightsList.length : (session.highlightsCount ?? 0);
            
            const dateStr = session.createdAt || session.startedAt
              ? new Date(session.createdAt || session.startedAt!).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "Recent";

            const durationStr = session.durationFormatted || (session.sessionDuration ? `${Math.floor(session.sessionDuration / 60)}m` : null);

            return (
              <Link
                key={sessionId}
                href={`/dashboard/sessions/${sessionId}`}
                className="block group"
              >
                <div className="hover:bg-slate-800/50 cursor-pointer transition-colors duration-200 border border-slate-800/80 hover:border-purple-500/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Info */}
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                      <Tv className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-100 group-hover:text-purple-300 transition-colors">
                        {session.streamTitle || "Monitored Broadcast Session"}
                      </h4>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">
                        {(session.platform || "KICK").toUpperCase()} · {dateStr} {durationStr ? `· ${durationStr}` : ""}
                      </p>
                    </div>
                  </div>

                  {/* Right: Dynamic Data Pills */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Peak Viewers */}
                    <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold font-mono flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-blue-400" />
                      👥 {peakViewers.toLocaleString()}
                    </span>

                    {/* Total Messages */}
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold font-mono flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                      💬 {totalMessages.toLocaleString()}
                    </span>

                    {/* Highlight Clips */}
                    {clipsCount > 0 ? (
                      <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-bold font-mono flex items-center gap-1.5">
                        <Film className="w-3.5 h-3.5 text-purple-400" />
                        🎬 {clipsCount} {clipsCount === 1 ? "Clip" : "Clips"}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold font-mono uppercase">
                        {session.status || "COMPLETED"}
                      </span>
                    )}

                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl">
          <p className="text-xs text-slate-500">
            No monitoring sessions recorded yet. Start live monitoring or upload a VOD above to build your broadcast hub.
          </p>
        </div>
      )}
    </motion.div>
  );
};

// ─── MAIN DASHBOARD COMPONENT (`DashboardWelcome`) ────────────────────────────

export const DashboardWelcome: React.FC<DashboardWelcomeProps> = ({
  creatorName = "Creator",
  creatorProfile,
  sessions,
  unpublishedHighlightsCount,
  onStartLiveMonitoring,
  onUploadVOD,
  onReviewClips,
}) => {
  const [workspaceData, setWorkspaceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch real telemetry if not passed directly via props
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await fetch("/api/workspace/state");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.workspaceState) {
            setWorkspaceData(data.workspaceState);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch workspace state in DashboardWelcome:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTelemetry();
  }, []);

  // Resolve Values
  const effectiveCreatorName =
    creatorName !== "Creator" ? creatorName : workspaceData?.creatorName || "Creator";

  const latestIntel = workspaceData?.latestSessionIntelligence;
  const latestSession = workspaceData?.latestCompletedSession;
  const managerNote =
    latestIntel?.coaching?.managerJournal?.nextStreamPriority ||
    latestIntel?.coaching?.nextAdvice?.recommendation ||
    latestSession?.coaching?.nextAdvice?.recommendation ||
    workspaceData?.nextRecommendedAction ||
    "Focus on increasing audience chat engagement during high-intensity moments in your next stream.";

  const effectiveProfile: CreatorProfileData = creatorProfile || {
    totalStreamsAnalyzed: workspaceData?.completedSessionsCount ?? 12,
    avgBroadcastScore: workspaceData?.latestCompletedSession?.broadcastScore?.overallScore ?? 88,
    avgMessagesPerMinute: 42.5,
    typicalAudienceMood: "Hyped & Engaged",
  };

  const effectiveSessions: SessionItemData[] = sessions || workspaceData?.recentSessions || [
    {
      id: "session-101",
      streamTitle: "High Stakes Kick Ranked Stream",
      platform: "kick",
      createdAt: new Date().toISOString(),
      sessionDuration: 7200,
      peakViewers: 1420,
      totalMessages: 3840,
      highlightsCount: 4,
      status: "completed",
    },
    {
      id: "session-100",
      streamTitle: "Community Tournament Final Round",
      platform: "kick",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      sessionDuration: 9000,
      peakViewers: 2150,
      totalMessages: 5120,
      highlightsCount: 6,
      status: "completed",
    },
  ];

  const effectiveUnpublishedCount =
    unpublishedHighlightsCount ?? workspaceData?.latestHighlights?.length ?? 3;

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full min-h-screen bg-[#0B0C10] text-[#f8fafc] font-sans p-6 sm:p-8 flex flex-col gap-6"
    >
      {/* 1. Hero Zone (AI Executive Briefing) */}
      <HeroZone creatorName={effectiveCreatorName} managerNote={managerNote} />

      {/* 2. Live Command Bar (Quick Actions) */}
      <LiveCommandBar
        unpublishedHighlightsCount={effectiveUnpublishedCount}
        onStartLiveMonitoring={onStartLiveMonitoring}
        onUploadVOD={onUploadVOD}
        onReviewClips={onReviewClips}
      />

      {/* 3. Creator DNA & Benchmarks Widget */}
      <CreatorDNAWidget profile={effectiveProfile} />

      {/* 4. Interactive Session History (Broadcast Hub) */}
      <SessionHistoryList sessions={effectiveSessions} />
    </motion.div>
  );
};
