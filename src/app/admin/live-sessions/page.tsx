"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import SessionCard, { LiveSessionItem } from "@/components/admin/SessionCard";
import HealthBadge from "@/components/admin/HealthBadge";

export default function LiveSessionsPage() {
  const [sessions, setSessions] = useState<LiveSessionItem[]>([]);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLiveSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/live-sessions");
      const json = await res.json();
      if (json.success) {
        setSessions(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveSessions();
  }, []);

  return (
    <>
      <AdminHeader
        title="Live Monitoring Sessions"
        subtitle="Real-time Telemetry, Collector Health & Active Stream Diagnostics"
        onRefresh={fetchLiveSessions}
      />

      <div className="admin-page">
        {/* Active Sessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((sess) => (
            <SessionCard key={sess.id} session={sess} onSelect={(s) => setSelectedSession(s)} />
          ))}
        </div>

        {/* Detailed Inspection Modal */}
        {selectedSession && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-3">
                    <span>{selectedSession.creatorName}</span>
                    <HealthBadge status={selectedSession.healthStatus} />
                  </h3>
                  <p className="text-xs font-mono text-slate-400 mt-1">
                    {selectedSession.platform} Session ID: {selectedSession.id}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSession(null)}
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              {/* Collector Diagnostics */}
              <div className="space-y-3 font-mono text-xs">
                <h4 className="text-sm font-bold text-purple-400 uppercase tracking-wider">Collector Subsystem Health</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div>
                    <span className="text-slate-400 text-[10px] block">COLLECTOR STATE</span>
                    <span className="text-emerald-400 font-bold mt-0.5 block">{selectedSession.diagnostics?.collector?.wsState || "OPEN"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">BUFFERED MSGS</span>
                    <span className="text-purple-400 font-bold mt-0.5 block">{selectedSession.diagnostics?.collector?.bufferedMessages || 24}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] block">LAST MSG LATENCY</span>
                    <span className="text-slate-200 font-bold mt-0.5 block">{selectedSession.diagnostics?.collector?.lastMessageAgeMs || 120} ms</span>
                  </div>
                </div>
              </div>

              {/* Timeline Events */}
              <div className="space-y-3 font-mono text-xs">
                <h4 className="text-sm font-bold text-purple-400 uppercase tracking-wider">Monitoring Event Timeline</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto p-4 rounded-xl bg-slate-950 border border-slate-800">
                  {(selectedSession.diagnostics?.timeline || []).map((t: any, idx: number) => (
                    <div key={idx} className="flex items-center gap-3 text-slate-300">
                      <span className="text-slate-500 text-[10px]">{t.timestamp}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
                      <span className={t.status}>{t.event}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-right">
                <button
                  onClick={() => setSelectedSession(null)}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs shadow-lg shadow-purple-600/20"
                >
                  Close Inspection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
