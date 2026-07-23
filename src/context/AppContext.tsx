"use client";

import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

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

export interface Message {
  id: string;
  senderEmail: string;
  receiverEmail: string;
  content: string;
  senderRole: "admin" | "creator";
  timestamp: string;
}

export interface GlobalCampaign {
  id: string;
  title: string;
  brand: string;
  payout: number;
  description: string;
  spotsLeft: number;
}

export interface ActiveLiveJob {
  id: string;
  creatorEmail: string;
  platform: "kick_live";
  videoId: string;
  videoUrl: string;
  title: string;
  status: "SCRAPING" | "ANALYZING" | "COMPLETED" | "FAILED";
  progressMessage: string;
  messagesCount: number;
}

interface AppContextType {
  currentUser: User | null;
  usersList: User[];
  brandDeals: BrandDeal[];
  calendarEvents: CalendarEvent[];
  tasks: CollaboratorTask[];
  messages: Message[];
  globalCampaigns: GlobalCampaign[];
  setCurrentUser: (user: User | null) => void;
  registerUser: (email: string, links: { youtube?: string; twitch?: string; kick?: string }) => Promise<void>;
  loginUser: (email: string) => Promise<boolean>;
  logout: () => void;
  updateUserStatus: (email: string, status: "verified" | "rejected") => Promise<void>;
  addBrandDeal: (deal: Omit<BrandDeal, "id">) => Promise<void>;
  updateBrandDealStatus: (id: string, status: BrandDeal["status"]) => Promise<void>;
  addCalendarEvent: (event: Omit<CalendarEvent, "id">) => Promise<void>;
  addCollaboratorTask: (task: Omit<CollaboratorTask, "id">) => Promise<void>;
  updateTaskStatus: (id: string, status: CollaboratorTask["status"]) => Promise<void>;
  fetchMessagesForCreator: (creatorEmail: string) => Promise<void>;
  sendChatMessage: (receiverEmail: string, content: string, role: "admin" | "creator") => Promise<void>;
  addGlobalCampaign: (campaign: Omit<GlobalCampaign, "id" | "spotsLeft">) => Promise<void>;
  refreshChannelStats: () => Promise<void>;
  
  // Global Live Stream Monitoring State
  activeLiveJob: ActiveLiveJob | null;
  latestCompletedJobId: string | null;
  startLiveKickMonitoring: (username: string, directChatroomId?: string) => Promise<void>;
  stopLiveKickMonitoring: () => Promise<any>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [brandDeals, setBrandDeals] = useState<BrandDeal[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [tasks, setTasks] = useState<CollaboratorTask[]>([]);
  const liveChatMessagesRef = useRef<string[]>([]);
  const socketRef = useRef<Socket | null>(null);
  const liveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeChatroomIdRef = useRef<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [globalCampaigns, setGlobalCampaigns] = useState<GlobalCampaign[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Global Live Stream Monitoring State
  const [activeLiveJob, setActiveLiveJob] = useState<ActiveLiveJob | null>(null);
  const [latestCompletedJobId, setLatestCompletedJobId] = useState<string | null>(null);

  // Helper to fetch all data from backend
  const fetchData = async (userEmail?: string) => {
    try {
      const emailQuery = userEmail ? `?creatorEmail=${encodeURIComponent(userEmail)}` : "";
      
      const [dealsRes, eventsRes, tasksRes, creatorsRes, campaignsRes] = await Promise.all([
        fetch(`/api/deals${emailQuery}`),
        fetch(`/api/events${emailQuery}`),
        fetch(`/api/tasks${emailQuery}`),
        fetch("/api/creators"),
        fetch("/api/campaigns"),
      ]);

      const deals = await dealsRes.json();
      const events = await eventsRes.json();
      const dbTasks = await tasksRes.json();
      const creators = await creatorsRes.json();
      const campaigns = await campaignsRes.json();

      setBrandDeals(Array.isArray(deals) ? deals : []);
      setCalendarEvents(Array.isArray(events) ? events : []);
      setTasks(Array.isArray(dbTasks) ? dbTasks : []);
      setUsersList(Array.isArray(creators) ? creators : []);
      setGlobalCampaigns(Array.isArray(campaigns) ? campaigns : []);
      
      // Update logged-in user details to get real-time verification changes
      const storedCurrentUser = localStorage.getItem("cm_current_user");
      if (storedCurrentUser) {
        const parsed = JSON.parse(storedCurrentUser);
        const freshUser = (Array.isArray(creators) ? creators : []).find(
          (u: User) => u.email.toLowerCase() === parsed.email.toLowerCase()
        );
        if (freshUser) {
          setCurrentUser(freshUser);
          localStorage.setItem("cm_current_user", JSON.stringify(freshUser));
        } else {
          setCurrentUser(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to fetch initial database data:", error);
    }
  };

  // Resilient CORS proxy fetch helper
  const fetchWithCorsProxy = async (targetUrl: string) => {
    try {
      const res = await fetch(`https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`);
      if (res.ok) return await res.json();
    } catch (e) {}

    try {
      const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`);
      if (res.ok) {
        const wrapper = await res.json();
        return JSON.parse(wrapper.contents);
      }
    } catch (e) {}

    try {
      const res = await fetch(`https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`);
      if (res.ok) return await res.json();
    } catch (e) {}

    return null;
  };

  const startLiveKickMonitoring = async (username: string, directChatroomId?: string) => {
    const email = currentUser?.email || "guest@creator.com";
    let chatroomId: string | null = directChatroomId ? String(directChatroomId) : null;

    // Resolve real Kick Chatroom ID (e.g. 102763756 for 8bit_goldy)
    if (!chatroomId) {
      try {
        const resV2 = await fetch(`https://kick.com/api/v2/channels/${username.toLowerCase()}`);
        if (resV2.ok) {
          const dataV2 = await resV2.json();
          if (dataV2.chatroom?.id) {
            chatroomId = String(dataV2.chatroom.id);
            console.log(`[Bridge] Resolved real Kick Chatroom ID: ${chatroomId}`);
          }
        }
      } catch (e) {}
    }

    if (!chatroomId) {
      try {
        const proxiedData = await fetchWithCorsProxy(`https://kick.com/api/v2/channels/${username.toLowerCase()}`);
        if (proxiedData?.chatroom?.id) {
          chatroomId = String(proxiedData.chatroom.id);
          console.log(`[Bridge] Resolved real Kick Chatroom ID via proxy: ${chatroomId}`);
        }
      } catch (e) {}
    }

    if (!chatroomId) {
      try {
        const resChannel = await fetch(`/api/analysis?kickChannel=${encodeURIComponent(username.toLowerCase())}`);
        if (resChannel.ok) {
          const channelData = await resChannel.json();
          if (channelData.chatroomId) chatroomId = String(channelData.chatroomId);
        }
      } catch (e) {}
    }

    if (!chatroomId) {
      throw new Error(`Could not resolve Kick chatroom for '${username}'.`);
    }

    activeChatroomIdRef.current = chatroomId;
    liveChatMessagesRef.current = [];

    // Clean up existing socket & timers
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    if (liveTimerRef.current) {
      clearInterval(liveTimerRef.current);
      liveTimerRef.current = null;
    }

    setActiveLiveJob({
      id: `job_live_${Date.now()}`,
      creatorEmail: email,
      platform: "kick_live",
      videoId: username,
      videoUrl: `https://kick.com/${username}`,
      title: `🔴 Live Stream Monitor: Kick.com/${username}`,
      status: "SCRAPING",
      progressMessage: `🔲 Connecting backend bridge to Kick chatroom #${chatroomId}...`,
      messagesCount: 0
    });

    // Connect to our backend Socket.io bridge
    const socketUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
    const socket = io(socketUrl, { path: "/api/socketio", transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔌 Socket.io connected to backend bridge:", socket.id);
      // Tell backend to open Pusher connection for this chatroom
      socket.emit("subscribe_kick", { chatroomId, username });
    });

    socket.on("kick_status", ({ status, error }: { status: string; error?: string }) => {
      console.log("🔌 Bridge status:", status);
      if (status === "subscribed") {
        setActiveLiveJob((prev) => prev ? ({
          ...prev,
          progressMessage: `🟢 Live Monitoring Active (2-min cycle). Chat messages buffered: 0`
        }) : null);
      } else if (status === "error") {
        setActiveLiveJob((prev) => prev ? ({
          ...prev,
          progressMessage: `❌ Bridge error: ${error}`
        }) : null);
      }
    });

    socket.on("kick_chat_message", (data: any) => {
      let msgText = "";
      if (typeof data === "string") {
        try {
          const parsed = JSON.parse(data);
          msgText = parsed?.content || parsed?.message || data;
        } catch (e) {
          msgText = data;
        }
      } else if (data && typeof data === "object") {
        if (typeof data.message === "string") {
          msgText = data.message;
        } else if (data.content) {
          const sender = data.sender?.username || data.username || "Viewer";
          const timestamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          msgText = `${sender} [${timestamp}]: ${data.content}`;
        } else {
          msgText = JSON.stringify(data);
        }
      }

      if (msgText.trim()) {
        liveChatMessagesRef.current.push(msgText);
        setActiveLiveJob((prev) => prev ? ({
          ...prev,
          messagesCount: liveChatMessagesRef.current.length,
          progressMessage: `🟢 Live Monitoring Active (2-min cycle). Chat messages buffered: ${liveChatMessagesRef.current.length}`
        }) : null);
      }
    });

    socket.on("disconnect", () => {
      console.warn("🔌 Socket.io bridge disconnected");
    });

    socket.on("connect_error", (err) => {
      console.error("🔌 Socket.io connect error:", err.message);
      setActiveLiveJob((prev) => prev ? ({
        ...prev,
        progressMessage: `❌ Could not connect to backend bridge. Is 'npm run dev' running?`
      }) : null);
    });

    // Every 2 minutes: send buffered messages to Gemini
    liveTimerRef.current = setInterval(async () => {
      const batch = [...liveChatMessagesRef.current];

      if (batch.length === 0) {
        setActiveLiveJob((prev) => prev ? ({
          ...prev,
          progressMessage: `ℹ️ 2-min check: 0 messages buffered. Still monitoring...`
        }) : null);
        return;
      }

      setActiveLiveJob((prev) => prev ? ({
        ...prev,
        status: "ANALYZING",
        progressMessage: `Passing ${batch.length} messages to Gemini 3.5 Flash...`
      }) : null);

      try {
        const res = await fetch("/api/analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            platform: "kick",
            creatorEmail: email,
            videoId: username,
            videoUrl: `https://kick.com/${username}`,
            title: `🔴 Live Stream Pulse: Kick.com/${username}`,
            comments: batch
          })
        });
        const data = await res.json();
        if (data.jobId) setLatestCompletedJobId(data.jobId);

        liveChatMessagesRef.current = [];
        setActiveLiveJob((prev) => prev ? ({
          ...prev,
          status: "SCRAPING",
          progressMessage: `🟢 Report generated! Buffering next batch... (Messages: 0)`,
          messagesCount: 0
        }) : null);
      } catch (err) {
        console.warn("2-min Gemini trigger error:", err);
      }
    }, 120000);
  };


  const stopLiveKickMonitoring = async () => {
    const chatroomId = activeChatroomIdRef.current;

    // Disconnect Socket.io bridge
    if (socketRef.current) {
      if (chatroomId) socketRef.current.emit("unsubscribe_kick", { chatroomId });
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    if (liveTimerRef.current) {
      clearInterval(liveTimerRef.current);
      liveTimerRef.current = null;
    }

    const batch = [...liveChatMessagesRef.current];
    const email = currentUser?.email || "guest@creator.com";
    const username = activeLiveJob?.videoId || "Kick Stream";

    setActiveLiveJob(null);
    activeChatroomIdRef.current = null;

    if (batch.length === 0) {
      return { error: "No live chat messages collected yet." };
    }

    try {
      const res = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: "kick",
          creatorEmail: email,
          videoId: username,
          videoUrl: `https://kick.com/${username}`,
          title: `🔴 Live Stream Snapshot: Kick.com/${username}`,
          comments: batch
        })
      });
      const data = await res.json();
      if (data.jobId) setLatestCompletedJobId(data.jobId);
      return data;
    } catch (err: any) {
      return { error: err.message || "Failed to generate live report" };
    }
  };

  useEffect(() => {
    const storedCurrentUser = localStorage.getItem("cm_current_user");
    let email: string | undefined = undefined;
    if (storedCurrentUser) {
      email = JSON.parse(storedCurrentUser).email;
    }
    fetchData(email).then(() => setIsLoaded(true));
  }, []);

  const registerUser = async (email: string, links: { youtube?: string; twitch?: string; kick?: string }) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          youtubeLink: links.youtube,
          twitchLink: links.twitch,
          kickLink: links.kick,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to register");

      setCurrentUser(data.user);
      localStorage.setItem("cm_current_user", JSON.stringify(data.user));
      await fetchData(data.user.email); // Refresh database state for this user
    } catch (error: any) {
      alert(error.message);
      throw error;
    }
  };

  const loginUser = async (email: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) {
        return false;
      }

      setCurrentUser(data.user);
      localStorage.setItem("cm_current_user", JSON.stringify(data.user));
      await fetchData(data.user.email); // Sync state for this user
      return true;
    } catch (error) {
      console.error("Login API error:", error);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("cm_current_user");
    setMessages([]);
    setBrandDeals([]);
    setCalendarEvents([]);
    setTasks([]);
  };

  const updateUserStatus = async (email: string, status: "verified" | "rejected") => {
    try {
      const res = await fetch("/api/creators", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, status }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update status");
      }

      // Keep active user email synced
      const storedCurrentUser = localStorage.getItem("cm_current_user");
      const activeEmail = storedCurrentUser ? JSON.parse(storedCurrentUser).email : undefined;
      await fetchData(activeEmail); // Sync database
    } catch (error: any) {
      alert(error.message);
    }
  };

  const addBrandDeal = async (deal: Omit<BrandDeal, "id">) => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/deals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...deal,
          creatorEmail: currentUser.email,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add deal");
      }

      await fetchData(currentUser.email);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const updateBrandDealStatus = async (id: string, status: BrandDeal["status"]) => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/deals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update deal status");
      }

      await fetchData(currentUser.email);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const addCalendarEvent = async (event: Omit<CalendarEvent, "id">) => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...event,
          creatorEmail: currentUser.email,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add event");
      }

      await fetchData(currentUser.email);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const addCollaboratorTask = async (task: Omit<CollaboratorTask, "id">) => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...task,
          creatorEmail: currentUser.email,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add task");
      }

      await fetchData(currentUser.email);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const updateTaskStatus = async (id: string, status: CollaboratorTask["status"]) => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update task status");
      }

      await fetchData(currentUser.email);
    } catch (error: any) {
      alert(error.message);
    }
  };

  // Messaging utilities
  const fetchMessagesForCreator = async (creatorEmail: string) => {
    try {
      const res = await fetch(`/api/messages?creatorEmail=${encodeURIComponent(creatorEmail)}`);
      const data = await res.json();
      if (res.ok) {
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  };

  const sendChatMessage = async (receiverEmail: string, content: string, role: "admin" | "creator") => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderEmail: currentUser.email,
          receiverEmail,
          content,
          senderRole: role,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send message");
      }

      const creatorEmail = role === "creator" ? currentUser.email : receiverEmail;
      await fetchMessagesForCreator(creatorEmail); // Refresh messages thread
    } catch (error: any) {
      alert(error.message);
    }
  };

  // Global campaigns utilities
  const addGlobalCampaign = async (campaign: Omit<GlobalCampaign, "id" | "spotsLeft">) => {
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...campaign,
          spotsLeft: 5,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add campaign");
      }

      const storedCurrentUser = localStorage.getItem("cm_current_user");
      const activeEmail = storedCurrentUser ? JSON.parse(storedCurrentUser).email : undefined;
      await fetchData(activeEmail);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const refreshChannelStats = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch("/api/creators/refresh", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUser.email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to refresh metrics");
      }

      setCurrentUser(data.user);
      localStorage.setItem("cm_current_user", JSON.stringify(data.user));
      await fetchData(currentUser.email);
      alert("Metrics refreshed successfully!");
    } catch (error: any) {
      alert(error.message);
    }
  };

  if (!isLoaded) {
    return <div style={{ minHeight: "100vh", backgroundColor: "#0c0e17", display: "flex", alignItems: "center", justifyContent: "center", color: "#f8fafc", fontFamily: "sans-serif" }}>Synchronizing NexCreator Database...</div>;
  }

  return (
    <AppContext.Provider
      value={{
        currentUser,
        usersList,
        brandDeals,
        calendarEvents,
        tasks,
        messages,
        globalCampaigns,
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
        fetchMessagesForCreator,
        sendChatMessage,
        addGlobalCampaign,
        refreshChannelStats,
        activeLiveJob,
        latestCompletedJobId,
        startLiveKickMonitoring,
        stopLiveKickMonitoring
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
