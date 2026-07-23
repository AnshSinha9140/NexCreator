"use client";

import React from "react";
import { useApp } from "@/context/AppContext";

export const TopNav: React.FC = () => {
  const { activeLiveJob } = useApp();

  return (
    <header className="h-16 border-b border-white/5 bg-[#080a11]/80 backdrop-blur-md sticky top-0 z-10 px-8 flex items-center justify-between font-sans">
      {/* Quick Search Command Bar (Raycast / Linear style) */}
      <div className="flex items-center gap-3">
        <div className="relative w-72 md:w-96">
          <input
            type="text"
            placeholder="Search channels, VODs, viral clips... (Cmd+K)"
            className="w-full bg-slate-900/60 border border-white/10 rounded-xl py-2 px-3.5 pl-9 text-xs text-white placeholder-slate-500 focus:border-purple-500/50"
          />
          <svg className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Status Indicator */}
        {activeLiveJob ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-semibold">
            <span className="live-pulse-dot" />
            <span>Monitoring: {activeLiveJob.videoId}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/60 border border-white/5 text-slate-400 font-mono text-xs">
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span>System Standby</span>
          </div>
        )}

        {/* Notifications Icon */}
        <button className="p-2 rounded-xl bg-slate-900/60 border border-white/10 text-slate-400 hover:text-white transition-colors relative">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-purple-500" />
        </button>

        {/* Upgrade / Pro Pill */}
        <button className="btn btn-primary text-xs py-1.5 px-3.5 font-mono">
          ⚡ Pro Engine
        </button>
      </div>
    </header>
  );
};
