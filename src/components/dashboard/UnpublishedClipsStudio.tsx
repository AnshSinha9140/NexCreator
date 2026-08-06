"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Sparkles } from "lucide-react";

export interface ClipCandidate {
  id: string;
  title: string;
  hookText?: string;
  platform?: string;
  viralityScore?: number;
  reason?: string;
}

export interface UnpublishedClipsStudioProps {
  clips?: ClipCandidate[];
}

export const UnpublishedClipsStudio: React.FC<UnpublishedClipsStudioProps> = ({ clips }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const defaultClips: ClipCandidate[] = [
    {
      id: "clip-1",
      title: "INSANE Clutch Moment & Chat Explosion Reaction",
      hookText: "Watch what happened when chat went crazy during the last round! 😱 #kick #gaming",
      platform: "YouTube Shorts",
      viralityScore: 95,
      reason: "High Chat Velocity & Spike in Viewer Reactions",
    },
    {
      id: "clip-2",
      title: "Top Tier Outplay & Unfiltered Victory Speech",
      hookText: "They didn't see this coming! ⚡ #streamer #clips",
      platform: "TikTok",
      viralityScore: 91,
      reason: "Peak Audience Emotion & High Retention",
    },
    {
      id: "clip-3",
      title: "Hilarious Audience Q&A Roast Session",
      hookText: "Chat asked the wrong question at the worst time 😂",
      platform: "Instagram Reels",
      viralityScore: 88,
      reason: "Humor Sentiment & Organic Question Peak",
    },
  ];

  const clipList = clips && clips.length > 0 ? clips.slice(0, 3) : defaultClips;

  const handleCopy = (clip: ClipCandidate) => {
    const textToCopy = `${clip.title}\n\nHook: ${clip.hookText || clip.title}`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(clip.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="w-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs text-purple-400 uppercase tracking-widest font-extrabold flex items-center gap-2 font-mono">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Ready to Publish (Top Highlights)</span>
        </h3>
        <span className="text-[10px] font-mono text-slate-500 uppercase">
          {clipList.length} Clip Candidates
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {clipList.map((clip) => {
          const score = clip.viralityScore ?? 90;
          const isCopied = copiedId === clip.id;

          return (
            <motion.div
              key={clip.id}
              whileHover={{ y: -2 }}
              className="rounded-xl bg-slate-900/60 border border-white/10 p-4 flex flex-col justify-between gap-3 shadow-md hover:border-purple-500/40 transition-all duration-200"
            >
              {/* Header Pill & Virality Score */}
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 text-[10px] font-mono font-bold uppercase tracking-wider">
                  {clip.platform || "Shorts"}
                </span>

                <span className="px-2 py-0.5 rounded-md bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 text-[11px] font-bold font-mono flex items-center gap-1">
                  <span>🔥</span> Virality: {score}/100
                </span>
              </div>

              {/* Clip Title */}
              <div className="flex flex-col gap-1 my-1">
                <h4 className="line-clamp-2 text-slate-100 font-semibold text-sm leading-snug">
                  {clip.title}
                </h4>
                {clip.reason && (
                  <p className="text-[11px] text-slate-400 line-clamp-1 italic">
                    {clip.reason}
                  </p>
                )}
              </div>

              {/* Primary Copy Button */}
              <button
                onClick={() => handleCopy(clip)}
                className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-purple-900/40 to-indigo-900/40 hover:from-purple-600 hover:to-indigo-600 border border-purple-500/30 text-purple-300 hover:text-white text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-[0.98]"
              >
                {isCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-300" />
                    <span className="text-emerald-200">Copied Title & Hook!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Title & Hook</span>
                  </>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
