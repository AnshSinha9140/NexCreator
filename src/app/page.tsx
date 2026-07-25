"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { AuthView } from "../components/AuthView";
import { PendingView } from "../components/PendingView";
import { Sidebar } from "../components/dashboard/Sidebar";
import { TopNav } from "../components/dashboard/TopNav";
import { CommandCenterView } from "../components/CommandCenterView";
import { DashboardView } from "../components/DashboardView";
import { SettingsView } from "../components/SettingsView";
import { InsightsView } from "../components/InsightsView";
import { VideoAnalyzerView } from "../components/VideoAnalyzerView";
import { AdminView } from "../components/AdminView";

export default function Home() {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState("command_center");

  useEffect(() => {
    if (currentUser?.isAdmin) setActiveTab("admin");
    else setActiveTab("command_center");
  }, [currentUser]);

  if (!currentUser) return <AuthView />;
  if (currentUser.status !== "verified" && !currentUser.isAdmin) return <PendingView />;

  const renderContent = () => {
    switch (activeTab) {
      case "command_center": return <CommandCenterView setActiveTab={setActiveTab} />;
      case "live":           return <DashboardView setActiveTab={setActiveTab} />;
      case "content":        return <VideoAnalyzerView />;
      case "audience":       return <InsightsView />;
      case "settings":       return <SettingsView />;
      case "admin":          return currentUser.isAdmin ? <AdminView /> : <CommandCenterView setActiveTab={setActiveTab} />;
      default:               return <CommandCenterView setActiveTab={setActiveTab} />;
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
        </main>
      </div>
    </div>
  );
}
