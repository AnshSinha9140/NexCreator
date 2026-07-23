"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { AuthView } from "../components/AuthView";
import { PendingView } from "../components/PendingView";
import { Sidebar } from "../components/dashboard/Sidebar";
import { TopNav } from "../components/dashboard/TopNav";
import { DashboardView } from "../components/DashboardView";
import { CalendarView } from "../components/CalendarView";
import { CrmView } from "../components/CrmView";
import { TasksView } from "../components/TasksView";
import { AdminView } from "../components/AdminView";
import { CreatorChatView } from "../components/CreatorChatView";
import { AdminChatView } from "../components/AdminChatView";
import { CampaignsView } from "../components/CampaignsView";
import { InsightsView } from "../components/InsightsView";
import { VideoAnalyzerView } from "../components/VideoAnalyzerView";

export default function Home() {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (currentUser?.isAdmin) setActiveTab("admin");
    else setActiveTab("overview");
  }, [currentUser]);

  if (!currentUser) return <AuthView />;
  if (currentUser.status !== "verified" && !currentUser.isAdmin) return <PendingView />;

  const renderContent = () => {
    switch (activeTab) {
      case "overview":    return <DashboardView setActiveTab={setActiveTab} />;
      case "insights":    return <InsightsView />;
      case "analyzer":    return <VideoAnalyzerView />;
      case "calendar":    return <CalendarView />;
      case "crm":         return <CrmView />;
      case "tasks":       return <TasksView />;
      case "admin":       return currentUser.isAdmin ? <AdminView /> : <DashboardView setActiveTab={setActiveTab} />;
      case "chat":        return currentUser.isAdmin ? <AdminChatView /> : <CreatorChatView />;
      case "campaigns":   return <CampaignsView />;
      default:            return <DashboardView setActiveTab={setActiveTab} />;
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
      {/* Sidebar — fixed width, full height */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main area — flex column, fills remaining space */}
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

        {/* Scrollable content */}
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
