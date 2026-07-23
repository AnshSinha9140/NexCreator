"use client";

import React from "react";
import { useApp } from "@/context/AppContext";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, logout } = useApp();

  const navItems = [
    { id: "overview", name: "Live Stream Pulse", icon: "🔴" },
    { id: "analyzer", name: "AI Deep Analyzer", icon: "🤖" },
    { id: "insights", name: "Performance Insights", icon: "📊" },
    { id: "calendar", name: "Content Calendar", icon: "📅" },
    { id: "crm", name: "Brand Deals CRM", icon: "💼" },
    { id: "tasks", name: "Team Collaborators", icon: "👥" },
    { id: "campaigns", name: "Global Campaigns", icon: "🚀" },
    { id: "chat", name: "Support Desk", icon: "💬" },
  ];

  if (currentUser?.isAdmin) {
    navItems.push({ id: "admin", name: "Admin Portal", icon: "⚡" });
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-[#0d101a] border-r border-white/5 flex flex-col justify-between p-6 font-sans">
      {/* Workspace & Logo */}
      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-purple-500/20">
            N
          </div>
          <div>
            <h1 className="text-base font-extrabold text-white tracking-tight">NexCreator</h1>
            <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider">
              Creator Intelligence
            </span>
          </div>
        </div>

        {/* Workspace Switcher Pill */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 flex items-center justify-between cursor-pointer hover:border-white/15 transition-all">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs font-mono">
              8B
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-white block truncate">
                {currentUser?.email?.split("@")[0] || "8bit_goldy"}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block truncate">
                Kick.com Channel
              </span>
            </div>
          </div>
          <span className="text-slate-500 text-xs">▾</span>
        </div>

        {/* Navigation Section */}
        <nav className="space-y-1">
          <span className="px-3 text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-widest block mb-2">
            Platform Engine
          </span>

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                  isActive
                    ? "bg-purple-500/15 text-purple-300 border border-purple-500/30 font-bold shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Logout */}
      <div className="pt-4 border-t border-white/5 space-y-3">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2 truncate">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-xs text-white">
              {currentUser?.email?.[0]?.toUpperCase() || "C"}
            </div>
            <div className="truncate">
              <span className="text-xs font-semibold text-white block truncate">
                {currentUser?.email || "creator@nex.com"}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono block">
                ● PRO SUITE
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="w-full btn btn-secondary text-xs py-2 text-slate-400 hover:text-rose-400 font-mono border-white/5"
        >
          Log Out
        </button>
      </div>
    </aside>
  );
};
