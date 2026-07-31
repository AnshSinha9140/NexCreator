"use client";

import { useEffect, useState, useCallback } from "react";
import AdminHeader from "@/components/admin/AdminHeader";
import VerificationCard, { CreatorVerificationItem } from "@/components/admin/VerificationCard";
import { useAdmin } from "@/context/AdminContext";

export default function CreatorVerificationPage() {
  const { refresh } = useAdmin();
  const [creators, setCreators] = useState<CreatorVerificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("pending");
  const [message, setMessage] = useState<string>("");

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/creators?status=${filter}`);
      const json = await res.json();
      if (json.success) {
        setCreators(json.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const handleAction = async (id: string, action: "approve" | "reject" | "request_changes" | "suspend" | "ban", note?: string) => {
    try {
      const res = await fetch("/api/admin/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          domain: "creator",
          action,
          targetId: id,
          reason: note || `Admin moderation action: ${action}`,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage(`Success: Creator ${id} updated with action '${action.toUpperCase()}'.`);
        setTimeout(() => setMessage(""), 4000);
        fetchQueue();
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
        title="Creator Verification Workspace & Moderation"
        subtitle="Review, Approve, or Audit Platform Creator Verification Applications"
        onRefresh={() => { fetchQueue(); refresh(); }}
      />

      <div className="admin-page">
        {/* Status Toast Notification */}
        {message && (
          <div style={{
            padding: "14px 18px", borderRadius: "12px",
            background: "rgba(168,85,247,0.12)", border: "1px solid rgba(168,85,247,0.3)",
            color: "#e9d5ff", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace",
            display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px"
          }}>
            <span>{message}</span>
            <button onClick={() => setMessage("")} style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer", fontWeight: 700 }}>×</button>
          </div>
        )}

        {/* Filter Bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: "12px", padding: "12px 16px",
          background: "#0e1120", border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: "14px", marginBottom: "16px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            {["pending", "verified", "rejected", "all"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                style={{
                  padding: "8px 16px", borderRadius: "10px",
                  fontSize: "12px", fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600, textTransform: "capitalize", cursor: "pointer",
                  transition: "all 0.15s ease",
                  background: filter === tab ? "#9333ea" : "rgba(255,255,255,0.03)",
                  color: filter === tab ? "#ffffff" : "#94a3b8",
                  border: filter === tab ? "1px solid #a855f7" : "1px solid rgba(255,255,255,0.06)",
                  boxShadow: filter === tab ? "0 2px 10px rgba(147,51,234,0.3)" : "none"
                }}
              >
                {tab === "pending" ? "Pending Queue" : tab}
              </button>
            ))}
          </div>

          <div style={{ fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>
            Queue Count: <strong style={{ color: "#c084fc" }}>{creators.length}</strong>
          </div>
        </div>

        {/* Creator Application Cards */}
        {loading ? (
          <div style={{ padding: "80px 0", textAlign: "center", fontSize: "12px", fontFamily: "'JetBrains Mono', monospace", color: "#64748b" }}>
            Loading Creator Applications...
          </div>
        ) : creators.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {creators.map((creator) => (
              <VerificationCard key={creator.id} creator={creator} onAction={handleAction} />
            ))}
          </div>
        ) : (
          <div style={{
            padding: "48px 24px", textAlign: "center", background: "#0e1120",
            border: "1px solid rgba(255,255,255,0.06)", borderRadius: "16px",
            display: "flex", flexDirection: "column", alignItems: "center", gap: "12px"
          }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "18px" }}>
              ✓
            </div>
            <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#f1f5f9" }}>No Creators Pending Verification</h4>
            <p style={{ margin: 0, fontSize: "12px", color: "#64748b", maxWidth: "360px" }}>
              All platform creator verification requests have been processed cleanly.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
