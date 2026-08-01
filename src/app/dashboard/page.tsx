"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopNav } from "@/components/dashboard/TopNav";
import { CommandCenterView } from "@/components/CommandCenterView";
import { DashboardView } from "@/components/DashboardView";
import { SettingsView } from "@/components/SettingsView";
import { InsightsView } from "@/components/InsightsView";
import { VideoAnalyzerView } from "@/components/VideoAnalyzerView";
import { AdminView } from "@/components/AdminView";
import { PendingView } from "@/components/PendingView";
import { AICopilotPanel } from "@/components/copilot/AICopilotPanel";
import { ExecutiveReportView } from "@/components/executive/ExecutiveReportView";
import { CreatorOnboardingView } from "@/components/creatorAudit/CreatorOnboardingView";
import { CreatorDNAView } from "@/components/CreatorDNAView";
import { CreatorMissionView } from "@/components/CreatorMissionView";
import { CreatorManagerProfile } from "@/lib/creatorAudit/types";

export default function DashboardPage() {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState("command_center");
  const [onboardingAudit, setOnboardingAudit] = useState<any>(null);
  const [profile, setProfile] = useState<CreatorManagerProfile | null>(null);
  const [knowledgeGraph, setKnowledgeGraph] = useState<any>(null);
  const [creatorMission, setCreatorMission] = useState<any>(null);
  const [completedSessionsCount, setCompletedSessionsCount] = useState<number>(0);
  const [hydrationError, setHydrationError] = useState(false);
  const [hydrationDiagnostics, setHydrationDiagnostics] = useState<any>(null);

  useEffect(() => {
    if (!currentUser || currentUser.isAdmin) return;
    fetch("/api/creator/hydration", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok || !data.success) {
          // 503 with diagnostics — fail loudly
          if (data.diagnostics) setHydrationDiagnostics(data.diagnostics);
          setHydrationError(true);
          return;
        }
        setProfile(data.profile || null);
        setKnowledgeGraph(data.knowledgeGraph || null);
        setCreatorMission(data.creatorMission || null);
        setCompletedSessionsCount(data.completedSessionsCount ?? 0);
        if (typeof window !== "undefined") {
          (window as any).__creatorMission = data.creatorMission || null;
        }
        // Onboarding source of truth: onboarding_state.completed (fallback: profile.onboardingCompleted)
        const onboardingDone =
          data.onboardingState?.completed ?? data.profile?.onboardingCompleted ?? true;
        setOnboardingAudit(!onboardingDone && data.profile?.audit ? data.profile.audit : null);
      })
      .catch(() => setHydrationError(true));
  }, [currentUser]);

  if (currentUser && currentUser.status !== "verified" && !currentUser.isAdmin) {
    return <PendingView />;
  }

  if (onboardingAudit) {
    return (
      <CreatorOnboardingView
        audit={onboardingAudit}
        creatorId={(currentUser as any)?.id || currentUser?.email || "creator"}
        onComplete={() => {
          setOnboardingAudit(null);
          // Refetch to load knowledgeGraph and profile cleanly
          if (currentUser) {
            fetch("/api/creator/hydration", { cache: "no-store" })
              .then(res => res.json())
              .then(data => {
                if (data.success) {
                  setProfile(data.profile);
                  setKnowledgeGraph(data.knowledgeGraph);
                  setCreatorMission(data.creatorMission);
                  setCompletedSessionsCount(data.completedSessionsCount ?? 0);
                  if (typeof window !== "undefined") {
                    (window as any).__creatorMission = data.creatorMission || null;
                  }
                }
              });
          }
        }}
      />
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "command_center": return <CommandCenterView setActiveTab={setActiveTab} profile={profile} completedSessionsCount={completedSessionsCount} />;
      case "dna":            return <CreatorDNAView knowledgeGraph={knowledgeGraph} />;
      case "mission":        return <CreatorMissionView creatorMission={creatorMission} knowledgeGraph={knowledgeGraph} />;
      case "copilot":        return <AICopilotPanel onNavigateToLive={() => setActiveTab("live")} />;
      case "reports":        return <ExecutiveReportView />;
      case "live":           return <DashboardView setActiveTab={setActiveTab} completedSessionsCount={completedSessionsCount} />;
      case "content":        return <VideoAnalyzerView />;
      case "audience":       return <InsightsView />;
      case "settings":       return <SettingsView />;
      case "admin":          return currentUser?.isAdmin ? <AdminView /> : <CommandCenterView setActiveTab={setActiveTab} profile={profile} completedSessionsCount={completedSessionsCount} />;
      default:               return <CommandCenterView setActiveTab={setActiveTab} profile={profile} completedSessionsCount={completedSessionsCount} />;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
        background: "#060810",
      }}
    >
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <TopNav />

        <main
          style={{
            flex: 1,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "28px 32px",
          }}
        >
          {renderContent()}
          {process.env.NODE_ENV !== "production" && !currentUser?.isAdmin && (
            <div style={{ marginTop: 16, padding: 12, border: "1px dashed #64748b", color: "#cbd5e1", fontSize: 12 }}>
              <strong>Creator Hydration Diagnostics</strong><br />
              {currentUser ? "✓ Creator Loaded" : "✗ Missing Creator"} · {profile ? "✓ Audit Loaded · ✓ Relationship Loaded · ✓ Executive Letter Loaded · ✓ Dashboard Hydrated" : "✗ Missing Creator Profile · ✗ Using Fallback Content"}{hydrationError ? " · hydration request failed" : ""}
              {hydrationDiagnostics && (
                <div style={{ marginTop: 8, color: "#fca5a5" }}>
                  Missing: {hydrationDiagnostics.missingCollections?.join(", ")}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
