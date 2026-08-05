"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ReflectionQuestion {
  key: string;
  question: string;
  placeholder: string;
}

interface ReflectionFlowProps {
  onComplete: (answers: Record<string, string>) => void;
  onBack?: () => void;
}

const QUESTIONS: ReflectionQuestion[] = [
  {
    key: "proudestMoment",
    question: "What moment in the last year made you proudest?",
    placeholder: "e.g., Hitting 1,000 concurrent viewers during my charity stream...",
  },
  {
    key: "disappointingStream",
    question: "What stream disappointed you the most, and why?",
    placeholder: "e.g., I tried a new RPG but chat was dead, and I felt like I was talking to a wall...",
  },
  {
    key: "misunderstandings",
    question: "What do viewers most frequently misunderstand about you?",
    placeholder: "e.g., That I only care about competitive ranking, when I actually just love the game's lore...",
  },
  {
    key: "fearOfGrowth",
    question: "What are you afraid of losing as your channel continues to grow?",
    placeholder: "e.g., The tight-knit inside jokes and being able to read every single chat message...",
  },
  {
    key: "audienceDisappeared",
    question: "If your audience disappeared tomorrow... would you still stream?",
    placeholder: "e.g., Honestly, probably not as much. The community is why I show up...",
  },
  {
    key: "biggestFanReason",
    question: "If I asked your biggest fan why they love you... what would they say?",
    placeholder: "e.g., Because of the small solo moments I create, like making a custom ringtone for an in-game RP phone...",
  },
];

const MAX_CHAR_LIMIT = 500;

export const ReflectionFlow: React.FC<ReflectionFlowProps> = ({ onComplete, onBack }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentValue, setCurrentValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeQuestion = QUESTIONS[currentStep];

  // Auto-focus textarea whenever step changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [currentStep]);

  // Load existing answer for current step if any
  useEffect(() => {
    setCurrentValue(answers[activeQuestion.key] || "");
  }, [currentStep, answers, activeQuestion.key]);

  // Listen for Cmd+Enter (Mac) or Ctrl+Enter (Windows)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleNext();
    }
  };

  const handleNext = () => {
    if (!currentValue.trim()) return;

    const updatedAnswers = {
      ...answers,
      [activeQuestion.key]: currentValue.trim(),
    };

    setAnswers(updatedAnswers);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setCurrentValue("");
    } else {
      onComplete(updatedAnswers);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      // Save current progress before going back
      setAnswers((prev) => ({
        ...prev,
        [activeQuestion.key]: currentValue.trim(),
      }));
      setCurrentStep((prev) => prev - 1);
    } else if (onBack) {
      onBack();
    }
  };

  const progressPercentage = ((currentStep + 1) / QUESTIONS.length) * 100;
  const isContinueDisabled = !currentValue.trim();

  return (
    <div className="w-full max-w-xl mx-auto bg-slate-950/40 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
      {/* Decorative Top Glow Bar */}
      <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />

      {/* Progress Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-xs font-mono font-extrabold tracking-widest text-purple-400 uppercase">
            Reflection {currentStep + 1} of {QUESTIONS.length}
          </span>
          <span className="text-xs font-mono text-slate-500">
            {Math.round(progressPercentage)}% Complete
          </span>
        </div>
        <div className="w-full h-1 bg-slate-800/80 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500"
          />
        </div>
      </div>

      {/* Main Question Transition Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="flex flex-col gap-5 min-h-[220px]"
        >
          {/* Question Text */}
          <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-snug">
            {activeQuestion.question}
          </h2>

          {/* Textarea Wrapper */}
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value.slice(0, MAX_CHAR_LIMIT))}
              onKeyDown={handleKeyDown}
              placeholder={activeQuestion.placeholder}
              rows={4}
              className="w-full bg-[#0B0C10] border border-white/10 rounded-xl px-4 py-3.5 pr-20 text-slate-200 text-sm placeholder-slate-600 focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 focus:outline-none transition-all duration-200 resize-none font-sans leading-relaxed"
            />
            {/* Absolute Character Counter */}
            <div className="absolute bottom-3 right-3 text-[10px] font-mono text-slate-500 select-none bg-[#0B0C10]/90 px-1.5 py-0.5 rounded">
              {currentValue.length} / {MAX_CHAR_LIMIT}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Actions & Keyboard Shortcuts Hint */}
      <div className="mt-6 pt-5 border-t border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Keyboard shortcut hint */}
        <div className="text-xs text-slate-500 font-medium select-none order-2 sm:order-1">
          <span className="font-mono bg-slate-900 border border-white/5 px-1.5 py-0.5 rounded mr-1">
            Ctrl
          </span>
          +
          <span className="font-mono bg-slate-900 border border-white/5 px-1.5 py-0.5 rounded ml-1">
            Enter
          </span>{" "}
          to continue
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
          {(currentStep > 0 || onBack) && (
            <button
              onClick={handleBack}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-xs font-semibold transition-all duration-150"
            >
              Back
            </button>
          )}

          <button
            onClick={handleNext}
            disabled={isContinueDisabled}
            className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-[0_4px_16px_rgba(168,85,247,0.25)] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {currentStep === QUESTIONS.length - 1 ? "Finish Calibration" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
};
