"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Film, Flame, Sparkles } from "lucide-react";

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
      title: "Emote & Reaction Surge — Chat Reacts Live",
      hookText: "Watch chat explode when this reaction happened! 😱 #kick #gaming",
      platform: "Shorts",
      viralityScore: 90,
      reason: "High Chat Velocity & Emote Spike",
    },
    {
      id: "clip-2",
      title: "Emote & Reaction Surge — Chat Reacts Live (KEKW Spam)",
      hookText: "They spammed KEKW endlessly during this play! ⚡ #clips",
      platform: "Shorts",
      viralityScore: 90,
      reason: "Peak Audience Emotion & Retention",
    },
    {
      id: "clip-3",
      title: "Viewer Q&A Surge: 7 Questions Asked in Chat",
      hookText: "Chat asked the ultimate question at the worst moment 😂",
      platform: "Shorts",
      viralityScore: 90,
      reason: "High Engagement & Audience Q&A Peak",
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
    <div className="w-full flex flex-col gap-3 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs text-purple-400 uppercase tracking-wider font-extrabold flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Ready to Publish (Top Highlights)</span>
        </h3>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
          {clipList.length} Clip Candidates
        </span>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {clipList.map((clip) => {
          const score = clip.viralityScore ?? 90;
          const isCopied = copiedId === clip.id;

          return (
            <motion.div
              key={clip.id}
              whileHover={{ y: -2 }}
              className="rounded-2xl bg-[#0d101b]/90 border border-white/10 p-4 sm:p-5 flex flex-col justify-between gap-4 shadow-xl hover:border-purple-500/40 transition-all duration-200"
            >
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-extrabold font-mono uppercase tracking-wider">
                  {clip.platform || "Shorts"}
                </span>

                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-bold font-mono flex items-center gap-1.5">
                  <Flame className="w-3 h-3 text-emerald-400" />
                  <span>Virality: {score}/100</span>
                </span>
              </div>

              {/* Title & Context */}
              <div className="flex flex-col gap-1 my-1">
                <h4 className="line-clamp-2 text-slate-100 font-bold text-sm sm:text-base leading-snug min-h-[2.6rem]">
                  {clip.title}
                </h4>
                {clip.reason && (
                  <p className="text-[11px] text-slate-400 line-clamp-1 italic mt-1">
                    {clip.reason}
                  </p>
                )}
              </div>

              {/* Primary Action Button */}
              <button
                onClick={() => handleCopy(clip)}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-extrabold tracking-wide shadow-md shadow-purple-950/40 hover:shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 active:scale-[0.98]"
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
