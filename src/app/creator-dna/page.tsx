"use client";

import React, { useEffect, useState } from "react";
import { IdentityInitializationView, AISummaryData } from "@/components/onboarding/IdentityInitializationView";
import { InitializationState } from "@/lib/identity/IdentityInitializationService";

export default function CreatorDNARoutePage() {
  const [state, setState] = useState<InitializationState>("INITIALIZING");
  const [error, setError] = useState<string | undefined>(undefined);
  const [summary, setSummary] = useState<AISummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/creator/identity/initialize");
      const data = await res.json();
      if (data.success && data.status) {
        setState(data.status.state);
        setError(data.status.error);
        setSummary(data.summary || null);
      } else {
        setState("FAILED");
        setError(data.error || "Failed to load initialization status");
      }
    } catch (err: any) {
      setState("FAILED");
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();

    // Poll status while initializing
    const interval = setInterval(() => {
      if (state !== "READY" && state !== "FAILED" && state !== "NOT_STARTED") {
        fetchStatus();
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [state]);

  const handleRetry = async () => {
    setLoading(true);
    setState("INITIALIZING");
    setError(undefined);
    setSummary(null);
    try {
      const res = await fetch("/api/creator/identity/initialize", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        fetchStatus();
      } else {
        setState("FAILED");
        setError(data.error || "Failed to restart initialization");
      }
    } catch (err: any) {
      setState("FAILED");
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading && state === "INITIALIZING") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", backgroundColor: "#060810", color: "#64748b", fontFamily: "sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: "32px", height: "32px", border: "3px solid rgba(168,85,247,0.2)", borderTopColor: "#a855f7", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          Loading Creator Identity Status...
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#060810", padding: "40px 20px" }}>
      <IdentityInitializationView
        state={state}
        error={error}
        summary={summary}
        onRetry={handleRetry}
        onExplore={() => {
          // Go to dashboard DNA tab
          window.location.href = "/dashboard";
        }}
      />
    </div>
  );
}
