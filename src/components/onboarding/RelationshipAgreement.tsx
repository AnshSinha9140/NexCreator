"use client";

import React from "react";
import { motion } from "framer-motion";

interface RelationshipAgreementProps {
  onAccept: () => void;
  onBack?: () => void;
}

const PROMISES = [
  "I'll tell you when I think you're making mistakes.",
  "I'll celebrate genuine progress.",
  "I'll admit when I don't know.",
  "I'll never optimize your content at the expense of who you are.",
];

// Framer Motion Variants for Staggered Animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.25,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: "easeOut" as const },
  },
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { delay: 1.25, duration: 0.4, ease: "easeOut" as const },
  },
};

export const RelationshipAgreement: React.FC<RelationshipAgreementProps> = ({ onAccept, onBack }) => {
  return (
    <div className="w-full max-w-xl mx-auto bg-[#0B0C10] border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden text-center">
      {/* Top Ambient Glow Bar */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

      {/* Header Section */}
      <div className="mb-8">
        <span className="text-[11px] font-extrabold tracking-[0.2em] text-purple-400 uppercase block mb-2 select-none">
          RELATIONSHIP AGREEMENT
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          My Promise To You
        </h1>
      </div>

      {/* Promises List (Staggered Entrance) */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-4 text-left mb-8"
      >
        {PROMISES.map((promise, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className="bg-[#13151A] border-l-2 border-purple-500 rounded-r-xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.25)] hover:border-l-[3px] hover:bg-[#181a21] transition-all duration-200"
          >
            <p className="text-slate-200 text-sm font-semibold leading-relaxed">
              {promise}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Action CTA & Back Button */}
      <motion.div
        variants={buttonVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col sm:flex-row items-center justify-center gap-3"
      >
        {onBack && (
          <button
            onClick={onBack}
            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold transition-all duration-150"
          >
            Back
          </button>
        )}

        <button
          onClick={onAccept}
          className="w-full sm:w-auto px-8 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.45)] hover:shadow-[0_0_25px_rgba(16,185,129,0.65)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          I Want You To Coach Me
        </button>
      </motion.div>
    </div>
  );
};
