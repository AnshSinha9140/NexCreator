"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface User {
  email: string;
  youtubeLink?: string;
  twitchLink?: string;
  kickLink?: string;
  status: "pending" | "verified" | "rejected";
  isAdmin?: boolean;
}

export interface BrandDeal {
  id: string;
  title: string;
  brand: string;
  platform: string;
  payout: number;
  status: "negotiating" | "signed" | "completed";
  date: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  type: "video" | "stream" | "collab" | "milestone";
  date: string;
  description: string;
}

export interface CollaboratorTask {
  id: string;
  title: string;
  role: "Editor" | "Designer" | "Writer";
  status: "todo" | "in-progress" | "done";
  videoTitle: string;
}

interface AppContextType {
  currentUser: User | null;
  usersList: User[];
  brandDeals: BrandDeal[];
  calendarEvents: CalendarEvent[];
  tasks: CollaboratorTask[];
  setCurrentUser: (user: User | null) => void;
  registerUser: (email: string, links: { youtube?: string; twitch?: string; kick?: string }) => void;
  loginUser: (email: string) => boolean;
  logout: () => void;
  updateUserStatus: (email: string, status: "verified" | "rejected") => void;
  addBrandDeal: (deal: Omit<BrandDeal, "id">) => void;
  updateBrandDealStatus: (id: string, status: BrandDeal["status"]) => void;
  addCalendarEvent: (event: Omit<CalendarEvent, "id">) => void;
  addCollaboratorTask: (task: Omit<CollaboratorTask, "id">) => void;
  updateTaskStatus: (id: string, status: CollaboratorTask["status"]) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Seed Data
const DEFAULT_USERS: User[] = [
  {
    email: "admin@creatormanager.com",
    status: "verified",
    isAdmin: true,
  },
  {
    email: "mrbeast@gmail.com",
    youtubeLink: "https://youtube.com/@mrbeast",
    twitchLink: "https://twitch.tv/mrbeast",
    kickLink: "",
    status: "verified",
  },
  {
    email: "xqc@twitch.tv",
    youtubeLink: "https://youtube.com/@xqc",
    twitchLink: "https://twitch.tv/xqc",
    kickLink: "https://kick.com/xqc",
    status: "pending",
  },
];

const DEFAULT_DEALS: BrandDeal[] = [
  { id: "1", title: "Apex Legends Stream Sponsor", brand: "EA", platform: "Twitch", payout: 5000, status: "signed", date: "2026-07-25" },
  { id: "2", title: "VPN Sponsorship Integration", brand: "NordVPN", platform: "YouTube", payout: 3500, status: "completed", date: "2026-07-15" },
  { id: "3", title: "Keyboard Review Promo", brand: "Keychron", platform: "YouTube", payout: 1200, status: "negotiating", date: "2026-08-02" },
];

const DEFAULT_EVENTS: CalendarEvent[] = [
  { id: "1", title: "Publish: Custom PC Build Vlog", type: "video", date: "2026-07-22", description: "Main channel upload with Keychron sponsorship" },
  { id: "2", title: "Sub Goal Stream Extravaganza", type: "stream", date: "2026-07-24", description: "Twitch subathon starting at 2 PM EST" },
  { id: "3", title: "Collab Stream with Shroud", type: "collab", date: "2026-07-28", description: "Play testing Valorant new update" },
];

const DEFAULT_TASKS: CollaboratorTask[] = [
  { id: "1", title: "Color Grade Vlog Footage", role: "Editor", status: "in-progress", videoTitle: "Custom PC Build Vlog" },
  { id: "2", title: "Design High-CTR Thumbnail", role: "Designer", status: "todo", videoTitle: "Custom PC Build Vlog" },
  { id: "3", title: "Write Intro Script Hooks", role: "Writer", status: "done", videoTitle: "Custom PC Build Vlog" },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [brandDeals, setBrandDeals] = useState<BrandDeal[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<CollaboratorTask[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Load state from localStorage on mount
    const storedUsers = localStorage.getItem("cm_users");
    const storedDeals = localStorage.getItem("cm_deals");
    const storedEvents = localStorage.getItem("cm_events");
    const storedTasks = localStorage.getItem("cm_tasks");
    const storedCurrentUser = localStorage.getItem("cm_current_user");

    setUsersList(storedUsers ? JSON.parse(storedUsers) : DEFAULT_USERS);
    setBrandDeals(storedDeals ? JSON.parse(storedDeals) : DEFAULT_DEALS);
    setCalendarEvents(storedEvents ? JSON.parse(storedEvents) : DEFAULT_EVENTS);
    setTasks(storedTasks ? JSON.parse(storedTasks) : DEFAULT_TASKS);
    
    if (storedCurrentUser) {
      setCurrentUser(JSON.parse(storedCurrentUser));
    }
    setIsLoaded(true);
  }, []);

  // Save changes helper
  const save = (key: string, data: any) => {
    localStorage.setItem(key, JSON.stringify(data));
  };

  const registerUser = (email: string, links: { youtube?: string; twitch?: string; kick?: string }) => {
    const newUser: User = {
      email,
      youtubeLink: links.youtube,
      twitchLink: links.twitch,
      kickLink: links.kick,
      status: "pending",
    };
    const updated = [...usersList, newUser];
    setUsersList(updated);
    save("cm_users", updated);
    
    // Automatically log in as the newly registered user
    setCurrentUser(newUser);
    save("cm_current_user", newUser);
  };

  const loginUser = (email: string): boolean => {
    const user = usersList.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (user) {
      setCurrentUser(user);
      save("cm_current_user", user);
      return true;
    }
    // Fallback: If user is not found, auto-register as verified user or simple demo auth
    if (email.includes("admin")) {
      const adminUser: User = { email, status: "verified", isAdmin: true };
      const updated = [...usersList, adminUser];
      setUsersList(updated);
      save("cm_users", updated);
      setCurrentUser(adminUser);
      save("cm_current_user", adminUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("cm_current_user");
  };

  const updateUserStatus = (email: string, status: "verified" | "rejected") => {
    const updated = usersList.map((u) => (u.email === email ? { ...u, status } : u));
    setUsersList(updated);
    save("cm_users", updated);
    
    // If the updated user is currently logged in, update their state too
    if (currentUser && currentUser.email === email) {
      const updatedUser = { ...currentUser, status };
      setCurrentUser(updatedUser);
      save("cm_current_user", updatedUser);
    }
  };

  const addBrandDeal = (deal: Omit<BrandDeal, "id">) => {
    const newDeal: BrandDeal = {
      ...deal,
      id: Math.random().toString(36).substring(2, 9),
    };
    const updated = [newDeal, ...brandDeals];
    setBrandDeals(updated);
    save("cm_deals", updated);
  };

  const updateBrandDealStatus = (id: string, status: BrandDeal["status"]) => {
    const updated = brandDeals.map((d) => (d.id === id ? { ...d, status } : d));
    setBrandDeals(updated);
    save("cm_deals", updated);
  };

  const addCalendarEvent = (event: Omit<CalendarEvent, "id">) => {
    const newEvent: CalendarEvent = {
      ...event,
      id: Math.random().toString(36).substring(2, 9),
    };
    const updated = [newEvent, ...calendarEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setCalendarEvents(updated);
    save("cm_events", updated);
  };

  const addCollaboratorTask = (task: Omit<CollaboratorTask, "id">) => {
    const newTask: CollaboratorTask = {
      ...task,
      id: Math.random().toString(36).substring(2, 9),
    };
    const updated = [newTask, ...tasks];
    setTasks(updated);
    save("cm_tasks", updated);
  };

  const updateTaskStatus = (id: string, status: CollaboratorTask["status"]) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, status } : t));
    setTasks(updated);
    save("cm_tasks", updated);
  };

  if (!isLoaded) {
    return <div style={{ minHeight: "100vh", backgroundColor: "#0b0c10", display: "flex", alignItems: "center", justifyContent: "center", color: "#f3f4f6" }}>Loading Creator Manager...</div>;
  }

  return (
    <AppContext.Provider
      value={{
        currentUser,
        usersList,
        brandDeals,
        calendarEvents,
        tasks,
        setCurrentUser,
        registerUser,
        loginUser,
        logout,
        updateUserStatus,
        addBrandDeal,
        updateBrandDealStatus,
        addCalendarEvent,
        addCollaboratorTask,
        updateTaskStatus,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
