"use client";

import { useEffect, useState, useCallback } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import HealthBadge from "@/components/admin/HealthBadge";
import { MonitoringDashboardBundle } from "@/lib/admin/monitoring/monitoringTypes";
import { useAdmin } from "@/context/AdminContext";

const renderSafeString = (val: any, fallback: string = ""): string => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string") return val;
  if (typeof val === "number" || typeof val === "boolean") return String(val);
  if (typeof val === "object") {
    return val.username || val.displayName || val.name || val.text || val.message || val.content || JSON.stringify(val);
  }
  return fallback;
};

export default function MonitoringDashboardPage() {
  const { refresh } = useAdmin();
  const [data, setData] = useState<MonitoringDashboardBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  const fetchMonitoring = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/monitoring");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
      } else {
        setError(json.error || "Failed to load monitoring telemetry.");
      }
    } catch (e: any) {
      console.error("[MonitoringDashboardPage] Fetch error:", e);
      setError(e.message || "Failed to load monitoring telemetry.");
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonitoring(true);

    const interval = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      fetchMonitoring(false);
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchMonitoring]);

  if (loading && !data) {
    return (
      <>
        <AdminHeader
          title="Monitoring Engine & Runtime Control Console"
          subtitle="Canonical Telemetry Single Source of Truth, ReadyState Telemetry & Operational Controls"
        />
        <div className="admin-page">
          <div style={{ padding: "80px 0", textAlign: "center", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>
            Querying Canonical Runtime Telemetry State...
          </div>
        </div>
      </>
    );
  }

  const d = data!;
  const pipe = d?.runtimePipeline;
  const trans = pipe?.transportState;
  const diag = pipe?.collectorDiagnostics;
  const telem = d?.telemetryState;
  const integrity = d?.telemetryIntegrity;
  const sess = d?.runtimeSession;
  const col = d?.collector;
  const buf = d?.rollingBuffer;
  const snap = d?.snapshotEngine;
  const ai = d?.aiProducer;
  const hist = d?.historicalToday;
  const val = d?.validation;
  const msgs = d?.representativeMessages || [];

  // Freshness Calculation
  const generatedMs = d?.metadata?.generatedAt ? new Date(d.metadata.generatedAt).getTime() : Date.now();
  const ageSeconds = Math.max(0, Number(((Date.now() - generatedMs) / 1000).toFixed(1)));
  const isStale = ageSeconds > 60;

  const phaseColor =
    pipe?.phase === "COLLECTING" || pipe?.phase === "BUFFERING" || pipe?.phase === "SNAPSHOTTING"
      ? "#34d399"
      : pipe?.phase === "CONNECTED"
      ? "#60a5fa"
      : pipe?.phase === "AI_PROCESSING" || pipe?.phase === "CONNECTING"
      ? "#c084fc"
      : pipe?.phase === "RECOVERING" || pipe?.phase === "DEGRADED"
      ? "#fbbf24"
      : pipe?.phase === "ERROR"
      ? "#f87171"
      : "#94a3b8";

  const integrityScoreColor = (integrity?.score || 100) >= 90 ? "#34d399" : (integrity?.score || 100) >= 70 ? "#fbbf24" : "#f87171";

  return (
    <>
      <AdminHeader
        title="Monitoring Engine & Runtime Control Console"
        subtitle="Canonical Telemetry Single Source of Truth, ReadyState Telemetry & Operational Controls"
        onRefresh={() => { fetchMonitoring(false); refresh(); }}
      />

      <div className="admin-page">
        {error && (
          <div style={{ padding: "14px 18px", borderRadius: "12px", background: "rgba(239,68,68,0.1)", border: "1px solid #ef4444", color: "#f87171", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", marginBottom: "16px" }}>
            Telemetry Warning: {renderSafeString(error)}
          </div>
        )}

        {/* SECTION 1: CONTEXTUAL OPERATIONAL STATUS BANNER */}
        <div style={{
          padding: "20px 24px", borderRadius: "16px",
          background: "rgba(14, 17, 32, 0.95)", border: `1px solid ${phaseColor}40`,
          boxShadow: `0 0 20px ${phaseColor}10`, marginBottom: "20px"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", background: `${phaseColor}20`, color: phaseColor, border: `1px solid ${phaseColor}50` }}>
                ● PHASE: {renderSafeString(pipe?.phase)}
              </span>

              {/* TELEMETRY INTEGRITY BADGE */}
              <span style={{ padding: "4px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", background: `${integrityScoreColor}20`, color: integrityScoreColor, border: `1px solid ${integrityScoreColor}50` }} title={integrity?.inconsistencies?.join(", ") || "100% Canonical Truth"}>
                TELEMETRY INTEGRITY: {integrity?.score ?? 100}% ({renderSafeString(integrity?.status, "100% Truthful")})
              </span>

              <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "#f1f5f9" }}>
                {renderSafeString(pipe?.explanation)}
              </h3>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: isStale ? "#f87171" : "#64748b" }}>
              <span>{isStale ? "⚠️ Telemetry Stale" : `Updated ${ageSeconds}s ago`}</span>
              <button
                onClick={() => setShowDebugPanel(!showDebugPanel)}
                style={{ padding: "4px 10px", borderRadius: "6px", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#cbd5e1", cursor: "pointer" }}
              >
                {showDebugPanel ? "Hide Engineering Debug" : "Engineering Debug"}
              </button>
            </div>
          </div>

          {/* Contextual Reason, Impact, Recovery */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "12px", marginTop: "12px", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace" }}>
            <div style={{ background: "rgba(6, 8, 16, 0.6)", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ color: "#94a3b8", display: "block", fontSize: "10px", textTransform: "uppercase" }}>Reason</span>
              <span style={{ color: "#e2e8f0", fontWeight: 600 }}>{renderSafeString(pipe?.reason)}</span>
            </div>

            <div style={{ background: "rgba(6, 8, 16, 0.6)", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ color: "#94a3b8", display: "block", fontSize: "10px", textTransform: "uppercase" }}>Impact</span>
              <span style={{ color: "#cbd5e1" }}>{renderSafeString(pipe?.impact)}</span>
            </div>

            <div style={{ background: "rgba(6, 8, 16, 0.6)", padding: "10px 14px", borderRadius: "10px", border: "1px solid rgba(255,255,255,0.04)" }}>
              <span style={{ color: "#94a3b8", display: "block", fontSize: "10px", textTransform: "uppercase" }}>Recovery Action</span>
              <span style={{ color: phaseColor, fontWeight: 700 }}>{renderSafeString(pipe?.recoveryAction)}</span>
            </div>
          </div>

          {integrity?.inconsistencies && integrity.inconsistencies.length > 0 && (
            <div style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.25)", fontSize: "12px", color: "#fbbf24", fontFamily: "'JetBrains Mono', monospace", marginTop: "12px" }}>
              <strong>Telemetry Inconsistency Detected:</strong> {integrity.inconsistencies.join(" | ")}
            </div>
          )}
        </div>

        {/* SECTION 2: ACTUAL RUNTIME PROGRESSION TIMELINE */}
        <div className="admin-card" style={{ padding: "20px 24px", marginBottom: "24px" }}>
          <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.1em", marginBottom: "16px" }}>
            ACTUAL RUNTIME PROGRESSION TIMELINE
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
            {(pipe?.timelineSteps || []).map((step, idx) => {
              const isComp = step.status === "completed";
              const isCurr = step.status === "current";
              const isWarn = step.status === "warning";
              const stColor = isComp ? "#34d399" : isCurr ? "#c084fc" : isWarn ? "#fbbf24" : "#475569";

              return (
                <div key={step.id} style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: "140px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: stColor, display: "inline-block", boxShadow: isCurr ? "0 0 10px #c084fc" : "none" }} />
                      <span style={{ fontSize: "12px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: isComp || isCurr || isWarn ? "#f1f5f9" : "#64748b" }}>
                        {renderSafeString(step.label)}
                      </span>
                    </div>
                    {step.details && (
                      <span style={{ fontSize: "10px", color: isWarn ? "#fbbf24" : "#64748b", fontFamily: "'JetBrains Mono', monospace", paddingLeft: "18px" }}>
                        {renderSafeString(step.details)}
                      </span>
                    )}
                  </div>
                  {idx < (pipe?.timelineSteps.length || 0) - 1 && (
                    <div style={{ height: "2px", flex: 1, background: isComp ? "#34d39950" : "rgba(255,255,255,0.06)", minWidth: "20px" }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* COLLAPSIBLE ENGINEERING DEBUG PANEL */}
        {showDebugPanel && (
          <div className="admin-card" style={{ padding: "20px 24px", marginBottom: "24px", background: "rgba(6, 8, 16, 0.9)", border: "1px solid rgba(168, 85, 247, 0.3)" }}>
            <h4 style={{ margin: "0 0 12px", fontSize: "14px", fontWeight: 800, color: "#c084fc", fontFamily: "'JetBrains Mono', monospace" }}>
              🛠️ Canonical Socket Identity & Telemetry Engine Diagnostics
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#cbd5e1" }}>
              <div>Socket ID: <strong style={{ color: "#60a5fa" }}>{renderSafeString(telem?.transport?.socketIdentity?.socketId)}</strong></div>
              <div>Connection ID: <strong>{renderSafeString(telem?.transport?.socketIdentity?.connectionId)}</strong></div>
              <div>Socket Generation: <strong>Gen {telem?.transport?.socketIdentity?.generation || 1}</strong></div>
              <div>ReadyState: <strong>{trans?.readyState} ({trans?.readyState === 1 ? "OPEN" : trans?.readyState === 0 ? "CONNECTING" : "CLOSED"})</strong></div>
              <div>Transport Provider: <strong>{renderSafeString(trans?.provider)}</strong></div>
              <div>Heartbeat Age: <strong>{telem?.derived?.heartbeatAgeSec}s</strong></div>
              <div>Idle Duration: <strong>{telem?.derived?.idleDurationSec}s ({telem?.derived?.isIdle ? "Quiet Stream" : "Active Traffic"})</strong></div>
              <div>Sockets Opened: <strong>{telem?.counters?.socketsOpened || 1}</strong></div>
              <div>Sockets Closed: <strong>{telem?.counters?.socketsClosed || 0}</strong></div>
              <div>Heartbeats Count: <strong>{telem?.counters?.heartbeatCount || 0}</strong></div>
              <div>Messages Count: <strong>{telem?.counters?.messagesReceived || 0}</strong></div>
              <div>Integrity Score: <strong style={{ color: integrityScoreColor }}>{integrity?.score}% ({renderSafeString(integrity?.status)})</strong></div>
            </div>
          </div>
        )}

        {/* SECTION 3: LIVE RUNTIME CARDS */}
        <div style={{ marginBottom: "12px", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#c084fc", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.1em" }}>
          LIVE RUNTIME CARDS
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
          <div className="admin-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
              <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase" }}>Active Session</span>
              <HealthBadge status={sess?.isActive ? "healthy" : "inactive"} label={sess?.isActive ? "LIVE" : "IDLE"} />
            </div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#f1f5f9" }}>
                {sess?.isActive ? renderSafeString(sess.creatorName) : "No Active Session"}
              </div>
              <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", marginTop: "4px" }}>
                Duration: {renderSafeString(sess?.durationFormatted)} | Viewers: {sess?.viewerCount}
              </div>
            </div>
          </div>

          <div className="admin-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
              <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase" }}>Collector</span>
              <HealthBadge status={col?.connected ? "healthy" : pipe?.phase === "RECOVERING" ? "warning" : "inactive"} label={col?.connected ? (trans?.isIdle ? "IDLE" : "LIVE") : "OFFLINE"} />
            </div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: col?.connected ? "#34d399" : "#fbbf24" }}>
                {col?.connected ? (trans?.isIdle ? "Connected (Quiet)" : `${col.activeSockets} Sockets`) : pipe?.phase === "RECOVERING" ? "Reconnecting" : "Disconnected"}
              </div>
              <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", marginTop: "4px" }}>
                Throughput: {col?.messagesPerSec || 0} msgs/s | Reconnects: {col?.reconnectCount}
              </div>
            </div>
          </div>

          <div className="admin-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
              <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase" }}>Rolling Buffer</span>
              <HealthBadge status={buf?.status || "idle"} />
            </div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#c084fc" }}>
                {buf?.currentBufferSize} msgs ({buf?.bufferUsagePct}%)
              </div>
              <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", marginTop: "4px" }}>
                Max Cap: {buf?.maxCapacity} | Flush: {buf?.flushStatus}
              </div>
            </div>
          </div>

          <div className="admin-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
              <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase" }}>Snapshot Engine</span>
              <HealthBadge status={snap?.status || "idle"} />
            </div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#60a5fa" }}>
                {snap?.isRunning ? `${snap.remainingTimeSeconds}s Remaining` : "Idle"}
              </div>
              <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", marginTop: "4px" }}>
                Window: {snap?.currentWindowSeconds}s
              </div>
            </div>
          </div>

          <div className="admin-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
              <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase" }}>AI Producer</span>
              <HealthBadge status={ai?.status || "idle"} />
            </div>
            <div>
              <div style={{ fontSize: "18px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#fbbf24" }}>
                {ai?.activeWorkers || 0} Workers
              </div>
              <div style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", marginTop: "4px" }}>
                Window: {renderSafeString(ai?.recommendationWindow)}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: HISTORICAL METRICS TODAY */}
        <div style={{ marginBottom: "12px", fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#60a5fa", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.1em" }}>
          HISTORICAL METRICS TODAY
        </div>

        <div className="admin-grid-4" style={{ marginBottom: "24px" }}>
          <div className="admin-card" style={{ padding: "16px 20px" }}>
            <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase" }}>Snapshots Today</span>
            <div style={{ fontSize: "22px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#60a5fa", marginTop: "4px" }}>
              {hist?.snapshotsCompletedToday.toLocaleString()}
            </div>
          </div>

          <div className="admin-card" style={{ padding: "16px 20px" }}>
            <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase" }}>Processed Messages Today</span>
            <div style={{ fontSize: "22px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#34d399", marginTop: "4px" }}>
              {hist?.messagesProcessedToday.toLocaleString()}
            </div>
          </div>

          <div className="admin-card" style={{ padding: "16px 20px" }}>
            <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase" }}>Sessions Completed Today</span>
            <div style={{ fontSize: "22px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#c084fc", marginTop: "4px" }}>
              {hist?.sessionsCompletedToday}
            </div>
          </div>

          <div className="admin-card" style={{ padding: "16px 20px" }}>
            <span style={{ fontSize: "10px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", textTransform: "uppercase" }}>Avg Processing Latency</span>
            <div style={{ fontSize: "22px", fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: "#fbbf24", marginTop: "4px" }}>
              {hist?.avgLatencyTodayMs} ms
            </div>
          </div>
        </div>

        {/* SECTION 5: REPRESENTATIVE LIVE MESSAGES */}
        <div className="admin-card" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#f1f5f9" }}>Representative Live Stream Messages</h3>
            <span style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>
              Session: <strong style={{ color: sess?.isActive ? "#34d399" : "#f87171" }}>{sess?.isActive ? renderSafeString(sess.creatorName) : "Inactive"}</strong>
            </span>
          </div>

          {msgs.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {msgs.map((m, idx) => (
                <div key={idx} style={{
                  padding: "10px 14px", borderRadius: "10px",
                  background: "rgba(6, 8, 16, 0.5)", border: "1px solid rgba(255, 255, 255, 0.04)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  fontSize: "12px", fontFamily: "'JetBrains Mono', monospace"
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ color: "#c084fc", fontWeight: 700 }}>@{renderSafeString(m.username)}:</span>
                    <span style={{ color: "#e2e8f0" }}>{renderSafeString(m.message)}</span>
                  </div>
                  <span style={{ color: "#475569", fontSize: "10px" }}>{m.timestamp ? new Date(m.timestamp).toLocaleTimeString() : "Now"}</span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: "32px", textAlign: "center", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>
              No live messages available. Waiting for next creator to start monitoring.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
