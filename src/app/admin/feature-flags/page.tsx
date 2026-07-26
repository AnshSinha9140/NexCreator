"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  const fetchFlags = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/feature-flags");
      const json = await res.json();
      if (json.success) setFlags(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const handleToggle = async (key: string, currentEnabled: boolean, currentRollout: number) => {
    const newEnabled = !currentEnabled;
    try {
      const res = await fetch("/api/admin/feature-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, enabled: newEnabled, rolloutPercentage: currentRollout }),
      });
      const json = await res.json();
      if (json.success) {
        setMsg(`Flag '${key}' set to ${newEnabled ? "ENABLED" : "DISABLED"}`);
        setTimeout(() => setMsg(""), 3000);
        fetchFlags();
      }
    } catch (e: any) {
      setMsg(`Error: ${e.message}`);
    }
  };

  const handleRolloutChange = async (key: string, enabled: boolean, newRollout: number) => {
    try {
      await fetch("/api/admin/feature-flags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, enabled, rolloutPercentage: newRollout }),
      });
      fetchFlags();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <>
        <AdminHeader
          title="Internal Feature Flag Management"
          subtitle="Operational Feature Toggles, Environment Scopes & Progressive Rollout Matrix"
        />
        <div className="admin-page">
          <div style={{ padding: "80px 0", textAlign: "center", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>
            Loading Feature Flags...
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader
        title="Internal Feature Flag Management"
        subtitle="Operational Feature Toggles, Environment Scopes & Progressive Rollout Matrix"
        onRefresh={fetchFlags}
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

        {flags.length === 0 ? (
          <div className="admin-card" style={{ padding: "60px 24px", textAlign: "center" }}>
            <div style={{
              width: "56px", height: "56px", borderRadius: "16px",
              background: "rgba(168, 85, 247, 0.1)", border: "1px solid rgba(168, 85, 247, 0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 16px", color: "#c084fc", fontSize: "24px"
            }}>
              🚩
            </div>
            <h3 style={{ margin: "0 0 8px", fontSize: "16px", fontWeight: 700, color: "#f1f5f9" }}>
              No Feature Flags Configured
            </h3>
            <p style={{ margin: 0, fontSize: "13px", color: "#94a3b8", maxWidth: "420px", marginLeft: "auto", marginRight: "auto", lineHeight: "1.5" }}>
              There are currently no active feature toggles or rollout rules configured in the system.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: "16px" }}>
            {flags.map((flag) => (
              <div
                key={flag.key}
                className="admin-card"
                style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "16px", padding: "20px" }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "16px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#f1f5f9" }}>{flag.name}</h3>
                      <span style={{
                        padding: "2px 8px", borderRadius: "6px", fontSize: "10px",
                        fontFamily: "'JetBrains Mono', monospace", fontWeight: 700,
                        background: "rgba(255,255,255,0.06)", color: "#cbd5e1",
                        border: "1px solid rgba(255,255,255,0.08)", textTransform: "capitalize"
                      }}>
                        {flag.environment}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: "12px", color: "#94a3b8", lineHeight: "1.4" }}>{flag.description}</p>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    onClick={() => handleToggle(flag.key, flag.enabled, flag.rolloutPercentage)}
                    style={{
                      position: "relative", display: "inline-flex", height: "24px", width: "44px",
                      flexShrink: 0, cursor: "pointer", borderRadius: "99px", border: "2px solid transparent",
                      transition: "background-color 0.2s ease",
                      background: flag.enabled ? "#9333ea" : "rgba(255,255,255,0.08)",
                      boxShadow: flag.enabled ? "0 0 12px rgba(147, 51, 234, 0.4)" : "none"
                    }}
                  >
                    <span
                      style={{
                        pointerEvents: "none", inlineSize: "20px", height: "20px",
                        borderRadius: "50%", background: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                        transition: "transform 0.2s ease",
                        transform: flag.enabled ? "translateX(20px)" : "translateX(0px)"
                      }}
                    />
                  </button>
                </div>

                {/* Rollout Slider */}
                <div style={{
                  paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b"
                }}>
                  <span>Rollout %: <strong style={{ color: "#c084fc", fontWeight: 700 }}>{flag.rolloutPercentage}%</strong></span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={flag.rolloutPercentage}
                    onChange={(e) => handleRolloutChange(flag.key, flag.enabled, Number(e.target.value))}
                    style={{ width: "180px", accentColor: "#a855f7", cursor: "pointer" }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
