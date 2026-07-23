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
  const currentUser = useApp().currentUser;
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (currentUser?.isAdmin) {
      setActiveTab("admin");
    } else {
      setActiveTab("overview");
    }
  }, [currentUser]);

  if (!currentUser) {
    return <AuthView />;
  }

  if (currentUser.status !== "verified" && !currentUser.isAdmin) {
    return <PendingView />;
  }

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
    <div className="flex min-h-screen bg-[#080a11]">
      <Sidebar />
      <div className="flex-1 ml-64 flex flex-col min-w-0">
        <TopNav />
        <main className="p-6 md:p-8 flex-1">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
