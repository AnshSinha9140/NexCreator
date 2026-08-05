"use client";

import React from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, MessageSquareQuote, Play, ShieldCheck } from "lucide-react";

interface DashboardWelcomeProps {
  creatorName?: string;
  onStartFirstSession?: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export const DashboardWelcome: React.FC<DashboardWelcomeProps> = ({
  creatorName = "Anshtests",
  onStartFirstSession,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full min-h-screen bg-[#0B0C10] text-[#f8fafc] font-sans p-6 sm:p-8 flex flex-col gap-6"
    >
      {/* 1. Top Section: Welcome Card */}
      <motion.div
        variants={cardVariants}
        className="bg-slate-950/65 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden flex flex-col justify-between gap-4"
      >
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
        
        {/* Header Header Info */}
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              {getGreeting()}, {creatorName}
            </h1>
            <p className="text-purple-400 text-sm font-bold tracking-wide uppercase">
              Your Creator Intelligence Foundation is Complete.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold tracking-wider uppercase select-none">
            <ShieldCheck className="w-3.5 h-3.5" />
            System Ready
          </span>
        </div>

        {/* Body Text */}
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl mt-2">
          I&apos;ve studied your content history, community, goals, and creator DNA. Now I need to watch you create. Your first monitored stream is where our real live coaching begins.
        </p>
      </motion.div>

      {/* 2. Middle Section: 2-Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Card: Workspace Status */}
        <motion.div
          variants={cardVariants}
          className="bg-slate-950/65 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-lg flex flex-col gap-4"
        >
          <h3 className="text-xs font-extrabold tracking-widest text-purple-400 uppercase">
            Workspace Status
          </h3>
          <div className="flex flex-col gap-3">
            {[
              { label: "Creator Research Complete", completed: true },
              { label: "Creator DNA Ready", completed: true },
              { label: "Mission Established", completed: true },
              { label: "AI Relationship Ready", completed: true },
              { label: "Waiting For First Monitored Stream", completed: false },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-center gap-3 py-1 text-sm transition-all duration-200"
              >
                {item.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-600 flex-shrink-0" />
                )}
                <span className={item.completed ? "text-slate-200" : "text-slate-500 italic font-medium"}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Right Card: AI Manager Note */}
        <motion.div
          variants={cardVariants}
          className="bg-[#13151A] border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col gap-4 justify-between"
        >
          <div className="flex items-center gap-2 text-purple-400">
            <MessageSquareQuote className="w-4 h-4" />
            <h3 className="text-xs font-extrabold tracking-widest uppercase">
              AI Manager Note
            </h3>
          </div>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed italic font-medium">
            &quot;Every stream is a live conversation between you and your audience. I won&apos;t look at just stats; I&apos;m calibrating specifically to capture the tone, rhythm, and character dynamics that define your voice.&quot;
          </p>
          <div className="text-right text-xs font-bold text-slate-500">
            — Your AI Creator Manager
          </div>
        </motion.div>
      </div>

      {/* 3. Bottom Section: CTA & Journey Timeline */}
      <motion.div
        variants={cardVariants}
        className="flex flex-col gap-6"
      >
        {/* CTA Card */}
        <div className="border border-emerald-500/20 bg-emerald-950/10 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
          <div className="flex flex-col gap-1.5 z-10">
            <h2 className="text-lg font-bold text-white tracking-wide">
              Your First Stream
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md">
              Initiate monitoring. Let&apos;s build real-time retention hooks and start tracking insights.
            </p>
          </div>
          <button
            onClick={onStartFirstSession}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#10B981] hover:bg-emerald-400 text-slate-950 text-xs font-bold tracking-wider uppercase shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 select-none z-10 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Start First Monitoring Session
          </button>
        </div>

        {/* Journey Timeline */}
        <div className="bg-slate-950/65 border border-white/10 rounded-2xl p-6 backdrop-blur-md shadow-lg overflow-x-auto">
          <h3 className="text-xs font-extrabold tracking-widest text-purple-400 uppercase mb-6">
            Journey Timeline
          </h3>
          
          <div className="min-w-[700px] flex items-center justify-between relative px-4">
            {/* Background Line */}
            <div className="absolute left-[3%] right-[3%] top-1/2 -translate-y-1/2 h-[2px] bg-slate-800 z-0" />

            {[
              { step: 1, label: "Research", completed: true },
              { step: 2, label: "Alignment", completed: true },
              { step: 3, label: "First Monitored Stream", active: true },
              { step: 4, label: "3 Sessions Completed" },
              { step: 5, label: "First AI Report" },
              { step: 6, label: "Highlights Generated" },
              { step: 7, label: "Long-Term Memory Growing" },
            ].map((stepItem, idx) => {
              const isCompleted = stepItem.completed;
              const isActive = stepItem.active;

              return (
                <div key={idx} className="flex flex-col items-center gap-3 z-10 w-[12%] text-center">
                  {/* Step Node */}
                  {isCompleted ? (
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                  ) : isActive ? (
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="w-8 h-8 rounded-full bg-purple-500/20 border-2 border-purple-500 text-purple-300 flex items-center justify-center text-xs font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                    >
                      3
                    </motion.div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 text-slate-600 flex items-center justify-center text-xs font-bold">
                      {stepItem.step}
                    </div>
                  )}

                  {/* Step Label */}
                  <span
                    className={`text-[10px] font-semibold leading-tight max-w-[90px] block ${
                      isCompleted ? "text-slate-300" : isActive ? "text-purple-300 font-bold" : "text-slate-600"
                    }`}
                  >
                    {stepItem.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};
