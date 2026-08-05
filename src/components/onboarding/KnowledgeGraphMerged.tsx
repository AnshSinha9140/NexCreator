"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export const KnowledgeGraphMerged: React.FC = () => {
  const router = useRouter();

  const handleEnterWorkspace = () => {
    router.push("/dashboard");
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-[#0B0C10] border border-white/10 rounded-2xl p-8 sm:p-10 backdrop-blur-md shadow-2xl relative overflow-hidden text-center flex flex-col items-center justify-center">
      {/* Top Ambient Glow Bar */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

      {/* Glowing Brain Circle (Spring + Breathing animation) */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [0, 1.15, 1],
          opacity: 1,
        }}
        transition={{
          type: "spring",
          stiffness: 160,
          damping: 15,
          delay: 0.15,
        }}
        className="relative mb-6"
      >
        <motion.div
          animate={{
            scale: [1, 1.06, 1],
            boxShadow: [
              "0 0 25px rgba(168,85,247,0.35)",
              "0 0 40px rgba(168,85,247,0.6)",
              "0 0 25px rgba(168,85,247,0.35)",
            ],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="w-18 h-18 sm:w-20 sm:h-20 rounded-full bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(168,85,247,0.4)] select-none"
        >
          🧠
        </motion.div>
      </motion.div>

      {/* Typography Content (Fades & Slides Up) */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.65, ease: "easeOut" }}
        className="flex flex-col items-center gap-3 mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Knowledge Graph Merged
        </h1>
        <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-sm">
          Deep Research observations have been successfully merged with your personal beliefs. Relationship Memory updated. Coaching priorities established.
        </p>
      </motion.div>

      {/* CTA Button (Fades In Last) */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 1.15, ease: "easeOut" }}
        className="w-full"
      >
        <button
          onClick={handleEnterWorkspace}
          className="w-full px-8 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold tracking-wider uppercase shadow-[0_4px_20px_rgba(168,85,247,0.3)] hover:shadow-[0_4px_25px_rgba(168,85,247,0.5)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          Enter Creator Workspace
        </button>
      </motion.div>
    </div>
  );
};
