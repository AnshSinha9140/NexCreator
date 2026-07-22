"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { AuthView } from "../components/AuthView";
import { PendingView } from "../components/PendingView";
import { Sidebar } from "../components/Sidebar";
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
  const currentUser = useApp().currentUser; // Keep sync react updates
  const { } = useApp();
  const [activeTab, setActiveTab] = useState("overview");

  // Reset tab to overview or admin if user logs out or logs in
  useEffect(() => {
    if (currentUser?.isAdmin) {
      setActiveTab("admin");
    } else {
      setActiveTab("overview");
    }
  }, [currentUser]);

  // Case 1: Not logged in
  if (!currentUser) {
    return <AuthView />;
  }

  // Case 2: Logged in but pending/rejected (Admin bypasses this)
  if (currentUser.status !== "verified" && !currentUser.isAdmin) {
    return <PendingView />;
  }

  // Case 3: Logged in and verified (or Admin)
  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <DashboardView setActiveTab={setActiveTab} />;
      case "insights":
        return <InsightsView />;
      case "analyzer":
        return <VideoAnalyzerView />;
      case "calendar":
        return <CalendarView />;
      case "crm":
        return <CrmView />;
      case "tasks":
        return <TasksView />;
      case "admin":
        return currentUser.isAdmin ? <AdminView /> : <DashboardView setActiveTab={setActiveTab} />;
      case "chat":
        return currentUser.isAdmin ? <AdminChatView /> : <CreatorChatView />;
      case "campaigns":
        return <CampaignsView />;
      default:
        return <DashboardView setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="app-layout">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="main-content">
        {renderContent()}
      </main>
    </div>
  );
}
