"use client";

import { use, useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import MetricCard from "@/components/admin/MetricCard";
import HealthBadge from "@/components/admin/HealthBadge";

export default function Creator360ProfilePage({ params }: { params: Promise<{ creatorId: string }> }) {
  const { creatorId } = use(params);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetch360Profile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/creators/${creatorId}`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch360Profile();
  }, [creatorId]);

  if (loading) {
    return (
      <>
        <AdminHeader title="Creator 360° Profile" subtitle="Single Source of Truth Telemetry" />
        <div className="admin-page">
          <div className="py-20 text-center text-xs font-mono text-slate-500 animate-pulse">
            Loading Creator 360° Data...
          </div>
        </div>
      </>
    );
  }

  const p = data?.profile || {};
  const m = data?.monitoring || {};
  const ai = data?.ai || {};
  const st = data?.storage || {};

  return (
    <>
      <AdminHeader
        title={`Creator 360° Profile — ${p.displayName || creatorId}`}
        subtitle="Single Source of Truth Profile, Platform Connections, Stream Telemetry & Timeline"
        onRefresh={fetch360Profile}
      />

      <div className="admin-page">
        {/* Section 1: Profile Header Card */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center font-extrabold text-white text-xl overflow-hidden border border-purple-400/30 shrink-0">
                {p.avatarUrl ? (
                  <img src={p.avatarUrl} alt={p.displayName} className="w-full h-full object-cover" />
                ) : (
                  p.displayName?.slice(0, 2).toUpperCase()
                )}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white">{p.displayName}</h2>
                  <HealthBadge
                    status={p.verificationStatus === "verified" ? "healthy" : "warning"}
                    label={p.verificationStatus?.toUpperCase()}
                  />
                </div>
                <p className="text-xs font-mono text-slate-400 mt-1">
                  @{p.username} • {p.email} • ID: <span className="text-purple-400">{p.creatorId}</span>
                </p>
              </div>
            </div>

            <div className="text-right text-xs font-mono text-slate-400 space-y-1">
              <div>Joined Date: <span className="text-slate-200">{new Date(p.joinedDate).toLocaleDateString()}</span></div>
              <div>Last Login: <span className="text-slate-200">{new Date(p.lastLogin).toLocaleTimeString()}</span></div>
              <div>Account Status: <span className="text-emerald-400 font-bold uppercase">{p.accountStatus}</span></div>
            </div>
          </div>

          {p.adminNotes && (
            <div className="p-3 rounded-xl bg-purple-950/20 border border-purple-800/30 text-xs font-mono text-purple-300">
              <strong className="text-purple-400">Admin Notes: </strong>
              {p.adminNotes}
            </div>
          )}
        </div>

        {/* Section 2: Connected Platforms */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 backdrop-blur-md">
          <h3 className="text-sm font-bold text-white tracking-tight">Connected Platforms</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(data?.connectedPlatforms || []).map((cp: any, idx: number) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs font-mono">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{cp.platform}</span>
                    {cp.verified && <span className="px-2 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">VERIFIED</span>}
                  </div>
                  <a href={cp.channelUrl} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:underline text-[11px] mt-1 block">
                    {cp.channelUrl}
                  </a>
                </div>
                <div className="text-right">
                  <span className="text-slate-200 font-bold block">{cp.followers?.toLocaleString()} followers</span>
                  <span className="text-slate-500 text-[10px]">Since {new Date(cp.connectedSince).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 3: Monitoring & AI Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Monitoring Stats */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 backdrop-blur-md">
            <h3 className="text-sm font-bold text-white tracking-tight">Monitoring Telemetry</h3>
            <div className="grid grid-cols-2 gap-3 font-mono">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Total Streams</span>
                <span className="text-base font-bold text-white mt-0.5 block">{m.totalStreams}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Avg Duration</span>
                <span className="text-base font-bold text-purple-400 mt-0.5 block">{m.averageDurationMins} mins</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Peak Viewers</span>
                <span className="text-base font-bold text-emerald-400 mt-0.5 block">{m.peakViewers?.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Msgs Processed</span>
                <span className="text-base font-bold text-blue-400 mt-0.5 block">{m.messagesProcessed?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* AI Metrics */}
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 backdrop-blur-md">
            <h3 className="text-sm font-bold text-white tracking-tight">AI & Inference Intelligence</h3>
            <div className="grid grid-cols-2 gap-3 font-mono">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Gemini / Groq</span>
                <span className="text-base font-bold text-purple-400 mt-0.5 block">{ai.geminiCalls} / {ai.groqCalls}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Rule Engine</span>
                <span className="text-base font-bold text-emerald-400 mt-0.5 block">{ai.ruleEngineCalls?.toLocaleString()}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Cache Hit Rate</span>
                <span className="text-base font-bold text-emerald-400 mt-0.5 block">{ai.promptCacheHitRate}</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase">Avg AI Latency</span>
                <span className="text-base font-bold text-amber-400 mt-0.5 block">{ai.averageAiLatencyMs} ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Chronological Activity Timeline */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 backdrop-blur-md">
          <h3 className="text-sm font-bold text-white tracking-tight">Chronological Activity Timeline</h3>
          <div className="space-y-3 font-mono text-xs">
            {(data?.activityTimeline || []).map((act: any) => (
              <div key={act.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 shrink-0"></span>
                  <div>
                    <span className="font-bold text-white block">{act.title}</span>
                    <span className="text-slate-400 text-[11px] block mt-0.5">{act.detail}</span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-slate-800 text-purple-300 block mb-1">{act.type}</span>
                  <span className="text-slate-500 text-[10px]">{new Date(act.timestamp).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
