"use client";

import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";

export default function AdminIdentityPage() {
  const { currentUser } = useApp();
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    if (!currentUser.isAdmin) {
      setError("Unauthorized access. Admin role required.");
      setLoading(false);
      return;
    }

    // Fetch hydration diagnostics
    fetch("/api/creator/hydration")
      .then(async (res) => {
        const data = await res.json();
        // SinceGET returns 503 on incomplete hydration, we handle both OK and non-OK responses
        setDiagnostics(data.diagnostics || data);
      })
      .catch((err) => {
        setError(err.message || "Failed to load diagnostics");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentUser]);

  if (error) {
    return (
      <div style={{ padding: "40px", color: "#f87171", fontFamily: "sans-serif" }}>
        <h2>⚠️ Access Denied / Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: "40px", color: "#94a3b8", fontFamily: "sans-serif" }}>
        Loading Admin Identity Diagnostics...
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto", color: "#f8fafc", fontFamily: "sans-serif" }}>
      <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#a855f7", marginBottom: "8px" }}>
        ⚙️ Developer Identity & Hydration Diagnostics
      </h1>
      <p style={{ color: "#94a3b8", fontSize: "14px", marginBottom: "24px" }}>
        Low-level database state, collection existence, and initialization pipeline health checks.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
        <div style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "20px" }}>
          <h3 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>Hydration Status</h3>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px" }}>
            <span style={{ fontSize: "16px" }}>
              {diagnostics?.hydrationReady ? "🟢" : "🔴"}
            </span>
            <span>
              {diagnostics?.hydrationReady ? "Hydration Ready" : "Hydration Incomplete"}
            </span>
          </div>
          <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "8px" }}>
            Lookup Creator ID: <code style={{ color: "#c084fc" }}>{diagnostics?.creatorId || "N/A"}</code>
          </p>
        </div>

        <div style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "20px" }}>
          <h3 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>User Credentials</h3>
          <p style={{ fontSize: "13px", color: "#cbd5e1" }}>
            Email: {currentUser?.email}
          </p>
          <p style={{ fontSize: "13px", color: "#cbd5e1" }}>
            Status: <span style={{ color: "#34d399", fontWeight: "bold" }}>{currentUser?.status || "verified"}</span>
          </p>
        </div>
      </div>

      <div style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>Missing Collections Log</h3>
        {diagnostics?.missingCollections && diagnostics.missingCollections.length > 0 ? (
          <ul style={{ color: "#f87171", fontSize: "13px", paddingLeft: "20px", lineHeight: "1.6" }}>
            {diagnostics.missingCollections.map((col: string) => (
              <li key={col}>Missing: <code>{col}</code></li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "#34d399", fontSize: "13px" }}>✓ All core collections populated (profile, DNA, mission, history, relationship memory).</p>
        )}
      </div>

      <div style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "20px" }}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "16px" }}>Raw Diagnostic JSON</h3>
        <pre style={{ background: "#090d16", padding: "16px", borderRadius: "8px", overflowX: "auto", fontSize: "11px", color: "#a5f3fc", border: "1px solid rgba(255,255,255,0.05)" }}>
          {JSON.stringify(diagnostics, null, 2)}
        </pre>
      </div>
    </div>
  );
}
