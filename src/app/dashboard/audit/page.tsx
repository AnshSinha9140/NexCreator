"use client";

import React, { useState, useEffect } from "react";
import { CreatorIntelligenceBundle } from "@/types/intelligence";
import {
  FileText,
  Sparkles,
  Zap,
  TrendingUp,
  ShieldAlert,
  Compass,
  CheckCircle2,
  Clock,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

export default function AuditPage() {
  const [data, setData] = useState<CreatorIntelligenceBundle | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"overview" | "roadmap" | "telemetry">("overview");

  const fetchAudit = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/intelligence/baselines?userId=default_user");
      const result = await res.json();
      if (result.success && result.baselines) {
        // If DB has document, fetch whole document or trigger generate
        const genRes = await fetch("/api/intelligence/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ creatorName: "Creator", creatorEmail: "creator@nexcreator.com" }),
        });
        const genData = await genRes.json();
        if (genData.success) {
          setData(genData.data);
        }
      } else {
        // Trigger initial generation
        await generateAudit();
      }
    } catch (err) {
      console.error("Failed to load audit:", err);
    } finally {
      setLoading(false);
    }
  };

  const generateAudit = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/intelligence/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorName: "AlphaCreator",
          creatorEmail: "alpha@nexcreator.com",
          kickUrl: "https://kick.com/alphacreator",
          youtubeUrl: "https://youtube.com/@alphacreator",
          vodTranscriptsSummary: "High energy variety streaming, strong chat interaction, 5-hour broadcasts.",
        }),
      });
      const result = await res.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (err) {
      console.error("Failed to generate audit:", err);
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, []);

  if (loading || generating) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
        <div className="flex flex-col items-center space-y-4 max-w-md text-center">
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 animate-pulse">
            <Sparkles className="w-10 h-10 text-purple-600 dark:text-purple-400 animate-spin" />
          </div>
          <h2 className="text-xl font-bold tracking-tight">Synthesizing 2-Stage Creator Intelligence...</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Extracting content archetypes, quantitative telemetry baselines, and building your 90-day growth roadmap.
          </p>
        </div>
      </div>
    );
  }

  const stage1 = data?.stage1;
  const stage2 = data?.stage2;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-6 md:p-10 font-sans transition-colors">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-950/60 px-2.5 py-1 rounded-full border border-purple-200 dark:border-purple-800/50">
                2-Stage Intelligence Audit
              </span>
              <span className="text-xs text-slate-400">• Verified Executive Report</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50 mt-2">
              {stage1?.creator.name || "Creator"} Intelligence Audit
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Generated on {data?.generatedAt ? new Date(data.generatedAt).toLocaleDateString() : "Today"} • Identity: {stage1?.creator.identity || "Varied Streamer"}
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={generateAudit}
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold shadow-lg shadow-purple-500/20 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Regenerate Audit</span>
            </button>
          </div>
        </div>

        {/* SECTION 1: Executive Letter Memo Card */}
        {stage2?.executiveLetter && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Executive Talent Memo</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Directly from your AI Creator Manager</p>
              </div>
            </div>

            <div className="space-y-4 text-slate-700 dark:text-slate-300 leading-relaxed text-sm md:text-base border-l-2 border-purple-500 pl-4 py-1">
              <p className="font-semibold text-slate-900 dark:text-slate-100">{stage2.executiveLetter.opening}</p>
              {stage2.executiveLetter.bodyParagraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
              <div className="pt-2 text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                Commitment: {stage2.executiveLetter.closingCommitment}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: Content Archetype & Cross-Pollination Banner */}
        {stage1 && (
          <div className="bg-gradient-to-r from-purple-900/10 via-indigo-900/10 to-slate-900/10 border border-purple-500/20 dark:border-purple-500/30 rounded-2xl p-6 md:p-8 relative overflow-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center space-x-2">
                  <Compass className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                    Genre & Content Archetype Hook
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
                  {stage1.creator.contentArchetype}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Brand Tone: <span className="font-semibold text-purple-600 dark:text-purple-300">{stage1.creator.brandTone}</span> • Category: {stage1.creator.category}
                </p>
              </div>

              {/* Cross-Pollination Strategies */}
              <div className="flex-1 max-w-xl space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Archetype Cross-Pollination Strategies
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {stage1.archetypeCrossPollination.map((strat, i) => (
                    <div
                      key={i}
                      className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900 dark:text-slate-100">
                        <span>Inspired by {strat.sourceGameOrCreator}</span>
                        <span className="text-purple-600 dark:text-purple-400">Strategy</span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 font-medium">{strat.winningStrategy}</p>
                      <p className="text-slate-500 dark:text-slate-400 italic">Target Application: {strat.applicableToCreator}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: Strengths & Weaknesses Grid (2-Column Layout) */}
        {stage1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                <Zap className="w-5 h-5 text-amber-500" />
                <span>Evidence-Backed Core Diagnostic Grid</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Column 1: Strengths & Drivers */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Validated Strengths & Growth Drivers</span>
                </div>

                {stage1.strengths.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-sm hover:border-emerald-500/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">{item.title}</h4>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                        {item.classification}
                      </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-100 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      <div className="font-bold text-slate-700 dark:text-slate-200">Observed Evidence:</div>
                      <p>{item.evidence}</p>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Strategic Impact: </span>
                      {item.reasoning}
                    </div>
                  </div>
                ))}
              </div>

              {/* Column 2: Weaknesses & Bottlenecks */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400 font-bold text-sm">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Retention Bottlenecks & Audience Friction</span>
                </div>

                {stage1.weaknesses.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-3 shadow-sm hover:border-rose-500/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base">{item.title}</h4>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/50">
                        {item.classification}
                      </span>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-100 dark:border-slate-800/60 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      <div className="font-bold text-slate-700 dark:text-slate-200">Observed Evidence:</div>
                      <p>{item.evidence}</p>
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-slate-700 dark:text-slate-300">Root Cause Analysis: </span>
                      {item.reasoning}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: 90-Day Interactive Growth Roadmap */}
        {stage2?.growthRoadmap && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <span>Evidence-Justified 90-Day Growth Roadmap</span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  1-Year Vision: <span className="font-semibold text-slate-700 dark:text-slate-300">{stage2.growthRoadmap.oneYearVision}</span>
                </p>
              </div>
            </div>

            {/* Interactive Timeline */}
            <div className="relative border-l-2 border-purple-500/30 dark:border-purple-500/40 ml-4 space-y-8 pl-6 py-2">
              {stage2.growthRoadmap.ninetyDayPlan.map((phaseItem, index) => (
                <div key={index} className="relative group">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-purple-600 border-4 border-white dark:border-slate-900 shadow-md group-hover:scale-125 transition-transform" />

                  <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                        {phaseItem.phase}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center space-x-2">
                      <ArrowRight className="w-4 h-4 text-purple-500 flex-shrink-0" />
                      <span>{phaseItem.actionItem}</span>
                    </h4>

                    <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                      <span className="font-bold text-purple-600 dark:text-purple-400">Stage 1 Evidence Justification: </span>
                      {phaseItem.evidenceJustification}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 5: Quantitative Live Telemetry Baselines & Rules */}
        {stage1?.liveMonitoringBaselines && stage2?.liveMonitoringRules && (
          <div className="bg-slate-900 text-slate-100 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-50 flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  <span>Real-Time Live Dashboard Telemetry Baselines</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Active thresholds powering Live Pulse, AI Manager, and AI Producer</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Baseline Metrics */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">Extracted Baseline Thresholds</div>
                <div className="bg-slate-800/80 rounded-xl p-4 space-y-3 text-xs border border-slate-700">
                  <div className="flex justify-between items-center border-b border-slate-700/60 pb-2">
                    <span className="text-slate-400">Target Chat Velocity:</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      {stage1.liveMonitoringBaselines.averageChatVelocityMsgsPerMin} msgs/min
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-b border-slate-700/60 pb-2">
                    <span className="text-slate-400">Fatigue Threshold Point:</span>
                    <span className="font-bold text-amber-400 text-sm">
                      Hour {stage1.liveMonitoringBaselines.typicalFatiguePointHours}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block mb-1">High Engagement Triggers:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {stage1.liveMonitoringBaselines.highEngagementTriggers.map((trig, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                          {trig}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Rules */}
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-purple-400">Active Live Monitoring Rules</div>
                <div className="bg-slate-800/80 rounded-xl p-4 space-y-2.5 text-xs border border-slate-700">
                  {stage2.liveMonitoringRules.map((rule, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-slate-200">
                      <span className="text-purple-400 font-bold">•</span>
                      <span>{rule}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
