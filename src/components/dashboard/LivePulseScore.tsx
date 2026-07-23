"use client";

import React from "react";

interface LivePulseScoreProps {
  score?: number; // 0 to 100
  isLive?: boolean;
  statusText?: string;
  messagesCount?: number;
}

export const LivePulseScore: React.FC<LivePulseScoreProps> = ({
  score = 92,
  isLive = true,
  statusText = "Top 2% Creator Peak Engagement",
  messagesCount = 0,
}) => {
  // SVG Radial Math
  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Rating label & color
  let label = "EXCELLENT";
  let gradientId = "pulseGradientEmerald";
  let mainColor = "#10b981";

  if (score < 40) {
    label = "CRITICAL";
    gradientId = "pulseGradientRose";
    mainColor = "#ef4444";
  } else if (score < 70) {
    label = "STEADY";
    gradientId = "pulseGradientAmber";
    mainColor = "#f59e0b";
  }

  return (
    <div className="glass-premium relative overflow-hidden p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-white/10 shadow-2xl">
      {/* Background Ambient Glow */}
      <div 
        className="absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundColor: mainColor }}
      />
      
      {/* Left Details */}
      <div className="flex-1 space-y-3 z-10 text-center md:text-left">
        <div className="flex items-center justify-center md:justify-start gap-3">
          <span className="badge badge-ai">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
            AI REALTIME ENGINE
          </span>
          {isLive && (
            <span className="badge badge-live">
              <span className="live-pulse-dot" />
              LIVE PULSE ACTIVE
            </span>
          )}
        </div>

        <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-sans">
          Stream Live Pulse
        </h2>

        <p className="text-sm text-slate-400 max-w-md font-sans">
          {statusText} • <span className="text-slate-200 font-semibold">{messagesCount}</span> messages buffered over 2-min window.
        </p>

        {/* Quick Micro Stats */}
        <div className="pt-2 flex items-center justify-center md:justify-start gap-6 text-xs text-slate-400 font-mono">
          <div>
            <span className="text-slate-500 block">HYPE INDEX</span>
            <span className="text-emerald-400 font-bold text-sm">96 / 100</span>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div>
            <span className="text-slate-500 block">RETENTION</span>
            <span className="text-purple-400 font-bold text-sm">94.2%</span>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div>
            <span className="text-slate-500 block">SAFETY SHIELD</span>
            <span className="text-emerald-400 font-bold text-sm">SECURE</span>
          </div>
        </div>
      </div>

      {/* Right Radial SVG Score Gauge */}
      <div className="relative flex items-center justify-center z-10">
        <svg className="w-48 h-48 transform -rotate-90">
          <defs>
            <linearGradient id="pulseGradientEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
            <linearGradient id="pulseGradientAmber" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="pulseGradientRose" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#dc2626" />
            </linearGradient>
          </defs>
          
          {/* Track Circle */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            className="text-slate-800/60"
            fill="transparent"
          />
          {/* Animated Progress Circle */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Text inside Arc */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-5xl font-extrabold tracking-tight text-white font-sans drop-shadow-md">
            {score}
          </span>
          <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase mt-1">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
};
