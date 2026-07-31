"use client";

import { useEffect, useState, useCallback } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import HealthBadge from "@/components/admin/HealthBadge";
import { useAdmin } from "@/context/AdminContext";

export default function LiveSessionsPage() {
  const { bundle, refresh } = useAdmin();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string>("");
  const [selectedSession, setSelectedSession] = useState<any | null>(null);

  const fetchLiveSessions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/live-sessions");
      const json = await res.json();
      if (json.success) {
        setSessions(json.data);
      } else if (bundle?.liveSessions?.sessions) {
        setSessions(bundle.liveSessions.sessions);
      }
    } catch {
      if (bundle?.liveSessions?.sessions) {
        setSessions(bundle.liveSessions.sessions);
      }
    } finally {
      setLoading(false);
    }
  }, [bundle]);

  useEffect(() => {
    fetchLiveSessions();
  }, [fetchLiveSessions]);

  const handleControlAction = async (action: "stop_monitoring" | "restart_collector" | "pause", sessionId: string) => {
    try {
      const res = await fetch("/api/admin/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: "session",
          action,
          targetId: sessionId,
          reason: `Admin trigger ${action} on session ${sessionId}`,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage(`Success: Session '${sessionId}' ${action} executed.`);
        setTimeout(() => setMessage(""), 4000);
        fetchLiveSessions();
        refresh();
      } else {
        setMessage(`Error: ${json.error || json.message}`);
      }
    } catch (e: any) {
      setMessage(`Error: ${e.message}`);
    }
  };

  return (
    <>
      <AdminHeader
        title="Live Monitoring Sessions & Control Center"
        subtitle="Real-time Operational State, Collector Telemetry & Session Commands"
        onRefresh={() => { fetchLiveSessions(); refresh(); }}
      />

      <div className="admin-page">
        {message && (
          <div style={{
            padding: "12px 16px", borderRadius: "10px",
            background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.3)",
            color: "#e9d5ff", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace",
            display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px"
          }}>
            <span>{message}</span>
            <button onClick={() => setMessage("")} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}>×</button>
          </div>
        )}

        <div className="admin-card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#f1f5f9" }}>Active Live Sessions</h3>
            <span style={{ fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>
              Total Live: <strong style={{ color: "#34d399" }}>{sessions.length}</strong>
            </span>
          </div>

          {loading ? (
            <div style={{ padding: "60px", textAlign: "center", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>
              Loading Live Sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div style={{ padding: "60px 24px", textAlign: "center" }}>
              <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: "20px", color: "#64748b" }}>
                📡
              </div>
              <h4 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: 700, color: "#f1f5f9" }}>No Active Live Sessions</h4>
              <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>All monitoring session channels are currently idle.</p>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
              <thead>
                <tr style={{ background: "rgba(6, 8, 16, 0.8)", borderBottom: "1px solid rgba(255,255,255,0.06)", color: "#64748b", fontFamily: "'JetBrains Mono', monospace", fontSize: "11px", textTransform: "uppercase" }}>
                  <th style={{ padding: "12px 20px" }}>Creator</th>
                  <th style={{ padding: "12px 16px" }}>Platform</th>
                  <th style={{ padding: "12px 16px" }}>Viewers</th>
                  <th style={{ padding: "12px 16px" }}>Collector Status</th>
                  <th style={{ padding: "12px 16px" }}>Health</th>
                  <th style={{ padding: "12px 20px", textAlign: "right" }}>Control Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "14px 20px", color: "#f1f5f9", fontWeight: 600 }}>
                      {s.creatorName || s.creatorEmail?.split("@")[0] || "Creator"}
                      <span style={{ display: "block", fontSize: "11px", color: "#64748b", fontWeight: 400, fontFamily: "'JetBrains Mono', monospace" }}>{s.streamTitle || "Live Stream"}</span>
                    </td>
                    <td style={{ padding: "14px 16px", textTransform: "uppercase", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#c084fc" }}>
                      {s.platform || "KICK"}
                    </td>
                    <td style={{ padding: "14px 16px", fontFamily: "'JetBrains Mono', monospace", color: "#34d399", fontWeight: 700 }}>
                      {(s.currentViewers || 0).toLocaleString()}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <HealthBadge status={s.collectorHealth || "healthy"} label={(s.collectorHealth || "CONNECTED").toUpperCase()} />
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <HealthBadge status={s.healthStatus || "healthy"} label={(s.status || "LIVE").toUpperCase()} />
                    </td>
                    <td style={{ padding: "14px 20px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button
                          onClick={() => setSelectedSession(s)}
                          style={{ padding: "6px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#cbd5e1", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
                        >
                          Inspect
                        </button>
                        <button
                          onClick={() => handleControlAction("restart_collector", s.id)}
                          style={{ padding: "6px 12px", borderRadius: "8px", background: "rgba(168,85,247,0.15)", border: "1px solid rgba(168,85,247,0.3)", color: "#c084fc", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
                        >
                          Restart Collector
                        </button>
                        <button
                          onClick={() => handleControlAction("stop_monitoring", s.id)}
                          style={{ padding: "6px 12px", borderRadius: "8px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", fontSize: "11px", fontWeight: 600, cursor: "pointer" }}
                        >
                          Stop Stream
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {selectedSession && (
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
            <div style={{ background: "#0e1120", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "16px", maxWidth: "600px", width: "100%", padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#fff" }}>
                  Session Diagnostics: {selectedSession.creatorName || selectedSession.id}
                </h3>
                <button onClick={() => setSelectedSession(null)} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontSize: "18px" }}>×</button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#cbd5e1" }}>
                <div>Platform: <strong style={{ color: "#c084fc" }}>{selectedSession.platform}</strong></div>
                <div>Status: <strong style={{ color: "#34d399" }}>{selectedSession.status}</strong></div>
                <div>Viewers: <strong>{selectedSession.currentViewers || 0}</strong></div>
                <div>Messages Processed: <strong>{selectedSession.messagesProcessed || 0}</strong></div>
              </div>

              <div style={{ marginTop: "20px", textAlign: "right" }}>
                <button onClick={() => setSelectedSession(null)} style={{ padding: "8px 16px", borderRadius: "8px", background: "#a855f7", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer" }}>
                  Close Diagnostics
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
