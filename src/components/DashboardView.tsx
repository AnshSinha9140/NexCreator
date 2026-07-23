"use client";

import React from "react";
import { useApp } from "../context/AppContext";
import { LivePulseScore } from "./dashboard/LivePulseScore";
import { MetricCard } from "./dashboard/MetricCard";
import { SignatureTimeline } from "./dashboard/SignatureTimeline";
import { AICreatorCoach } from "./dashboard/AICreatorCoach";

export const DashboardView: React.FC<{ setActiveTab: (tab: string) => void }> = ({ setActiveTab }) => {
  const { brandDeals, calendarEvents, tasks, currentUser, activeLiveJob } = useApp();

  const totalPayout = brandDeals
    .filter((d) => d.status !== "completed")
    .reduce((sum, d) => sum + d.payout, 0);

  const activeTasksCount = tasks.filter((t) => t.status !== "done").length;

  return (
    <div className="animate-fade-in space-y-8">
      {/* 1. Hero Live Pulse Score Section */}
      <LivePulseScore
        score={92}
        isLive={!!activeLiveJob}
        messagesCount={activeLiveJob?.messagesCount || 0}
        statusText="Top 2% Creator Peak Engagement • Community Hype Active"
      />

      {/* 2. 4-Grid SaaS Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard
          title="Audience Sentiment"
          value="88% Positive"
          change="+14%"
          isPositive={true}
          accentColor="emerald"
          subtitle="88% Positive, 8% Neutral, 4% Negative"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <MetricCard
          title="Chat Velocity (CPM)"
          value="420 CPM"
          change="+32%"
          isPositive={true}
          accentColor="blue"
          subtitle="420 messages per minute peak"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />

        <MetricCard
          title="Active Sponsor Value"
          value={`$${totalPayout.toLocaleString()}`}
          change="+25%"
          isPositive={true}
          accentColor="purple"
          subtitle="3 active brand campaigns"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <MetricCard
          title="Toxicity Shield"
          value="SECURE"
          change="0 Alerts"
          isPositive={true}
          accentColor="emerald"
          subtitle="Auto-moderation filter 100% active"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          }
        />
      </div>

      {/* 3. Split Layout: Signature Interactive Timeline & AI Creator Coach */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Signature Timeline */}
        <div className="lg:col-span-2">
          <SignatureTimeline />
        </div>

        {/* Right Col: AI Creator Coach */}
        <div className="lg:col-span-1">
          <AICreatorCoach progressMessage={activeLiveJob?.progressMessage} />
        </div>
      </div>

      {/* 4. Production & Sponsor Pipeline Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Content Pipeline */}
        <div className="glass p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-sans">Upcoming Content Schedule</h3>
            <button className="btn btn-secondary text-xs py-1.5 font-mono" onClick={() => setActiveTab("calendar")}>
              Calendar ➔
            </button>
          </div>
          <div className="space-y-3">
            {calendarEvents.slice(0, 3).map((evt) => (
              <div key={evt.id} className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{evt.type === "video" ? "📹" : evt.type === "stream" ? "🎮" : "🤝"}</span>
                  <div>
                    <h4 className="text-xs font-bold text-white font-sans">{evt.title}</h4>
                    <p className="text-[11px] text-slate-400 font-sans">{evt.description}</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-purple-400">{evt.date}</span>
              </div>
            ))}
            {calendarEvents.length === 0 && (
              <p className="text-xs text-slate-500 py-6 text-center">No upcoming content scheduled.</p>
            )}
          </div>
        </div>

        {/* Sponsor Pipeline */}
        <div className="glass p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white font-sans">Sponsors & Brand Pipeline</h3>
            <button className="btn btn-secondary text-xs py-1.5 font-mono" onClick={() => setActiveTab("crm")}>
              CRM ➔
            </button>
          </div>
          <div className="space-y-3">
            {brandDeals.slice(0, 3).map((deal) => (
              <div key={deal.id} className="p-3.5 rounded-xl bg-slate-900/50 border border-white/5 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white font-sans">{deal.title}</h4>
                  <p className="text-[11px] text-slate-400 font-sans">Brand: <strong className="text-slate-200">{deal.brand}</strong> | {deal.platform}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-emerald-400 block">${deal.payout}</span>
                  <span className="text-[10px] font-mono text-purple-300 uppercase">{deal.status}</span>
                </div>
              </div>
            ))}
            {brandDeals.length === 0 && (
              <p className="text-xs text-slate-500 py-6 text-center">No active brand deals in pipeline.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

