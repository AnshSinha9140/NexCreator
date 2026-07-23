"use client";

import React from "react";

interface CoachRecommendation {
  id: string;
  type: "opportunity" | "warning" | "retention";
  title: string;
  actionText: string;
  impact: string;
}

const mockRecommendations: CoachRecommendation[] = [
  {
    id: "rec1",
    type: "opportunity",
    title: "Hype Peak Active (+40% CPM)",
    actionText: "Prolong current GTA Heist segment by 15 mins",
    impact: "+18% Retention",
  },
  {
    id: "rec2",
    type: "retention",
    title: "Viewer Engagement Drop Warning",
    actionText: "Trigger chat Q&A or community giveaway",
    impact: "Recovers +250 Viewers",
  },
  {
    id: "rec3",
    type: "opportunity",
    title: "High Clip Potential (1:12)",
    actionText: "Auto-queue 60s Shorts/TikTok edit",
    impact: "Viral Candidate",
  },
];

export const AICreatorCoach: React.FC<{
  progressMessage?: string;
  isAnalyzing?: boolean;
}> = ({
  progressMessage = "Reading chat emotions & detecting viral moments...",
  isAnalyzing = false,
}) => {
  return (
    <div className="glass p-6 space-y-5 border-l-4 border-l-purple-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-sans">AI Creator Coach</h3>
            <p className="text-xs text-slate-400 font-sans">Realtime stream guidance & instant actions</p>
          </div>
        </div>

        <span className="badge badge-ai">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
          ACTIVE
        </span>
      </div>

      {/* Dynamic AI Status Bar */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/5 flex items-center gap-3">
        <div className="w-4 h-4 rounded-full border-2 border-purple-400 border-t-transparent animate-spin flex-shrink-0" />
        <span className="text-xs font-mono text-purple-300 font-medium truncate">
          {progressMessage}
        </span>
      </div>

      {/* Recommendation Feed */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
          Recommended Actions Right Now
        </span>

        {mockRecommendations.map((rec) => (
          <div
            key={rec.id}
            className="p-4 rounded-xl bg-slate-900/40 border border-white/5 hover:border-purple-500/30 transition-all flex flex-col justify-between gap-3 group"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-bold text-white font-sans">{rec.title}</span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {rec.impact}
              </span>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              👉 {rec.actionText}
            </p>

            <button className="btn btn-secondary text-xs py-2 w-full font-mono hover:border-purple-500/50 hover:text-purple-300">
              Apply Strategy Action
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
