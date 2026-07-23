"use client";

import React, { useState } from "react";

export interface TimelineEvent {
  id: string;
  timestamp: string;
  category: "hype" | "laughter" | "clip" | "alert" | "milestone";
  title: string;
  description?: string;
}

const mockTimelineEvents: TimelineEvent[] = [
  { id: "1", timestamp: "00:14", category: "laughter", title: "😂 Chat loved the joke", description: "Laughter spike across 84 viewer messages" },
  { id: "2", timestamp: "00:29", category: "hype", title: "🔥 Viewer & CPM Spike", description: "Chat velocity reached 420 messages/min" },
  { id: "3", timestamp: "00:46", category: "milestone", title: "🎁 Giveaway announced", description: "Positive sentiment jumped to 96%" },
  { id: "4", timestamp: "01:12", category: "clip", title: "🚀 Viral Clip Candidate detected", description: "AI detected 15s high-excitement moment" },
  { id: "5", timestamp: "01:18", category: "alert", title: "⚠️ Toxicity spike detected", description: "Auto-flagged spam trigger word" },
];

export const SignatureTimeline: React.FC<{ events?: TimelineEvent[] }> = ({ events = mockTimelineEvents }) => {
  const [filter, setFilter] = useState<string>("all");

  const filteredEvents = events.filter((e) => {
    if (filter === "all") return true;
    return e.category === filter;
  });

  const getCategoryBadge = (cat: TimelineEvent["category"]) => {
    switch (cat) {
      case "hype":
        return { bg: "bg-purple-500/10 text-purple-400 border-purple-500/30", label: "🔥 HYPE" };
      case "laughter":
        return { bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30", label: "😂 LAUGHTER" };
      case "clip":
        return { bg: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30", label: "🚀 VIRAL CLIP" };
      case "alert":
        return { bg: "bg-rose-500/10 text-rose-400 border-rose-500/30", label: "⚠️ ALERT" };
      case "milestone":
        return { bg: "bg-amber-500/10 text-amber-400 border-amber-500/30", label: "🎁 MILESTONE" };
      default:
        return { bg: "bg-slate-800 text-slate-300 border-slate-700", label: "EVENT" };
    }
  };

  return (
    <div className="glass p-6 space-y-5">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2 font-sans">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
            Signature Interactive Timeline
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            AI-flagged highlights, sentiment spikes, and viral moment candidates.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 font-mono text-xs">
          {[
            { id: "all", label: "All" },
            { id: "hype", label: "Hype 🔥" },
            { id: "laughter", label: "Laughter 😂" },
            { id: "clip", label: "Clips 🚀" },
            { id: "alert", label: "Alerts ⚠️" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`px-3 py-1.5 rounded-lg border transition-all ${
                filter === item.id
                  ? "bg-purple-500/20 text-purple-300 border-purple-500/50 font-bold"
                  : "bg-slate-900/50 text-slate-400 border-white/5 hover:bg-slate-800 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Event Feed */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-purple-500/50 before:via-cyan-500/30 before:to-transparent">
        {filteredEvents.map((evt) => {
          const badge = getCategoryBadge(evt.category);
          return (
            <div key={evt.id} className="relative group">
              {/* Timeline Marker Dot */}
              <div className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-slate-900 border-2 border-purple-400 group-hover:scale-125 transition-transform" />

              {/* Event Content Container */}
              <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 group-hover:border-purple-500/30 group-hover:bg-slate-900/70 transition-all">
                <div className="flex items-center justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                      {evt.timestamp}
                    </span>
                    <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${badge.bg}`}>
                      {badge.label}
                    </span>
                  </div>
                  <button className="text-xs text-purple-400 hover:text-purple-300 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                    Clip 🎬
                  </button>
                </div>

                <h4 className="text-sm font-semibold text-white font-sans">{evt.title}</h4>
                {evt.description && (
                  <p className="text-xs text-slate-400 mt-1 font-sans">{evt.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
