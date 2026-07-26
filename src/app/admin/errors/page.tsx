"use client";

import { useEffect, useState } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import ErrorPanel, { LoggedErrorItem } from "@/components/admin/ErrorPanel";

export default function ErrorCenterPage() {
  const [errors, setErrors] = useState<LoggedErrorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSubsystem, setFilterSubsystem] = useState<string>("all");

  const fetchErrors = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/errors");
      const json = await res.json();
      if (json.success) setErrors(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchErrors();
  }, []);

  if (loading) {
    return (
      <>
        <AdminHeader
          title="Error Center & System Diagnostics"
          subtitle="Exceptions, Subsystem Traces, Root Cause & Automated Resolution Hints"
        />
        <div className="admin-page">
          <div style={{ padding: "80px 0", textAlign: "center", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>
            Loading System Diagnostic Errors...
          </div>
        </div>
      </>
    );
  }

  const filteredErrors = errors.filter(
    (e) => filterSubsystem === "all" || e.subsystem.toLowerCase().includes(filterSubsystem.toLowerCase())
  );

  return (
    <>
      <AdminHeader
        title="Error Center & System Diagnostics"
        subtitle="Exceptions, Subsystem Traces, Root Cause & Automated Resolution Hints"
        onRefresh={fetchErrors}
      />

      <div className="admin-page">
        {/* Filter Bar with generous padding & clean buttons */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "12px", padding: "12px 16px",
          background: "#0e1120", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "14px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {["all", "Authentication", "Collector", "Snapshots", "AI Operations", "MongoDB", "Provider"].map((sub) => (
              <button
                key={sub}
                onClick={() => setFilterSubsystem(sub)}
                style={{
                  padding: "8px 16px", borderRadius: "10px",
                  fontSize: "12px", fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600, cursor: "pointer",
                  transition: "all 0.15s ease",
                  background: filterSubsystem === sub ? "#9333ea" : "rgba(255,255,255,0.03)",
                  color: filterSubsystem === sub ? "#ffffff" : "#94a3b8",
                  border: filterSubsystem === sub ? "1px solid #a855f7" : "1px solid rgba(255,255,255,0.06)",
                  boxShadow: filterSubsystem === sub ? "0 2px 10px rgba(147,51,234,0.3)" : "none"
                }}
              >
                {sub}
              </button>
            ))}
          </div>

          <div style={{ fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>
            Total Logged Errors: <strong style={{ color: "#f87171" }}>{filteredErrors.length}</strong>
          </div>
        </div>

        {/* Error List with explicit 16px vertical gap */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredErrors.map((err) => (
            <ErrorPanel key={err.id} error={err} />
          ))}
        </div>
      </div>
    </>
  );
}
