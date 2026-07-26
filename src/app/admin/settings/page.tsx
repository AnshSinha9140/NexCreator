"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<any>({
    geminiApiKeyConfigured: true,
    groqApiKeyConfigured: true,
    autoFallbackEnabled: true,
    snapshotIntervalSec: 60,
    maxConcurrentSessionsPerCreator: 3,
    maintenanceMode: false,
    webhooksEnabled: true,
    logLevel: "INFO",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const json = await res.json();
      if (json.success) setSettings(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (json.success) {
        setMsg("Admin Operational Settings Saved Successfully!");
        setTimeout(() => setMsg(""), 3000);
      }
    } catch (e: any) {
      setMsg(`Save Error: ${e.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminHeader
          title="Admin Operational Settings"
          subtitle="Global Limits, AI Fallbacks, Maintenance Mode & Pipeline Configs"
        />
        <div className="admin-page">
          <div style={{ padding: "80px 0", textAlign: "center", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>
            Loading Admin Operational Settings...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader
        title="Admin Operational Settings"
        subtitle="Global Limits, AI Fallbacks, Maintenance Mode & Pipeline Configs"
        onRefresh={fetchSettings}
      />

      <div className="admin-page">
        {msg && (
          <div style={{
            padding: "14px 18px", borderRadius: "12px",
            background: "rgba(168, 85, 247, 0.12)", border: "1px solid rgba(168, 85, 247, 0.3)",
            color: "#e9d5ff", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace"
          }}>
            {msg}
          </div>
        )}

        <div className="admin-card" style={{ display: "flex", flexDirection: "column", gap: "20px", padding: "24px" }}>
          <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#f1f5f9", borderBottom: "1px solid rgba(255, 255, 255, 0.06)", paddingBottom: "12px" }}>
            AI & Pipeline Configuration
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Setting 1: AI Fallback */}
            <div style={{
              padding: "16px 20px", borderRadius: "12px",
              background: "rgba(6, 8, 16, 0.5)", border: "1px solid rgba(255, 255, 255, 0.04)",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px"
            }}>
              <div>
                <span style={{ fontSize: "13px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#f1f5f9", display: "block" }}>
                  Automated AI Fallback
                </span>
                <span style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", marginTop: "2px", display: "block" }}>
                  Failover to Groq when Gemini returns 429 status or times out
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, autoFallbackEnabled: !settings.autoFallbackEnabled })}
                style={{
                  position: "relative", display: "inline-flex", height: "24px", width: "44px",
                  flexShrink: 0, cursor: "pointer", borderRadius: "99px", border: "2px solid transparent",
                  transition: "background-color 0.2s ease",
                  background: settings.autoFallbackEnabled ? "#9333ea" : "rgba(255,255,255,0.08)"
                }}
              >
                <span
                  style={{
                    pointerEvents: "none", inlineSize: "20px", height: "20px",
                    borderRadius: "50%", background: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                    transition: "transform 0.2s ease",
                    transform: settings.autoFallbackEnabled ? "translateX(20px)" : "translateX(0px)"
                  }}
                />
              </button>
            </div>

            {/* Setting 2: Snapshot Interval */}
            <div style={{
              padding: "16px 20px", borderRadius: "12px",
              background: "rgba(6, 8, 16, 0.5)", border: "1px solid rgba(255, 255, 255, 0.04)",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px"
            }}>
              <div>
                <span style={{ fontSize: "13px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#f1f5f9", display: "block" }}>
                  Snapshot Aggregation Interval (seconds)
                </span>
                <span style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", marginTop: "2px", display: "block" }}>
                  Seconds between live chat pulse aggregation snapshots
                </span>
              </div>
              <input
                type="number"
                value={settings.snapshotIntervalSec}
                onChange={(e) => setSettings({ ...settings, snapshotIntervalSec: Number(e.target.value) })}
                style={{
                  width: "100px", padding: "8px 12px", borderRadius: "10px",
                  background: "#0e1120", border: "1px solid rgba(255, 255, 255, 0.08)",
                  color: "#f1f5f9", fontSize: "13px", fontFamily: "'JetBrains Mono', monospace",
                  textAlign: "center", outline: "none"
                }}
              />
            </div>

            {/* Setting 3: Maintenance Mode */}
            <div style={{
              padding: "16px 20px", borderRadius: "12px",
              background: "rgba(244, 63, 94, 0.04)", border: "1px solid rgba(244, 63, 94, 0.2)",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px"
            }}>
              <div>
                <span style={{ fontSize: "13px", fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#f43f5e", display: "block" }}>
                  Global Maintenance Mode
                </span>
                <span style={{ fontSize: "11px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b", marginTop: "2px", display: "block" }}>
                  Block creator ingestion pipelines during critical system upgrades
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                style={{
                  position: "relative", display: "inline-flex", height: "24px", width: "44px",
                  flexShrink: 0, cursor: "pointer", borderRadius: "99px", border: "2px solid transparent",
                  transition: "background-color 0.2s ease",
                  background: settings.maintenanceMode ? "#f43f5e" : "rgba(255,255,255,0.08)"
                }}
              >
                <span
                  style={{
                    pointerEvents: "none", inlineSize: "20px", height: "20px",
                    borderRadius: "50%", background: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                    transition: "transform 0.2s ease",
                    transform: settings.maintenanceMode ? "translateX(20px)" : "translateX(0px)"
                  }}
                />
              </button>
            </div>
          </div>

          {/* Footer Save Button */}
          <div style={{
            paddingTop: "16px", borderTop: "1px solid rgba(255, 255, 255, 0.06)",
            display: "flex", justifyContent: "flex-end"
          }}>
            <button
              disabled={saving}
              onClick={handleSave}
              style={{
                padding: "10px 24px", borderRadius: "12px",
                background: "#9333ea", border: "1px solid #a855f7",
                color: "#ffffff", fontSize: "13px", fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700, cursor: "pointer", transition: "all 0.15s ease",
                boxShadow: "0 2px 12px rgba(147, 51, 234, 0.35)", opacity: saving ? 0.7 : 1
              }}
            >
              {saving ? "Saving..." : "Save Admin Settings"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
