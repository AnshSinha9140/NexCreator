export type SupportedPlatform = "kick" | "youtube" | "twitch" | "tiktok" | string;

export type SessionStatus =
  | "waiting"
  | "starting"
  | "live"
  | "offline_pending"
  | "paused"
  | "ending"
  | "completed"
  | "failed";

export interface MonitoringSession {
  id: string; // Unique session ID (e.g. sess_live_1784820000_a8z2)
  userId: string; // References User ID or Email
  connectedPlatformId: string; // References ConnectedPlatformAccount ID
  platform: SupportedPlatform;
  status: SessionStatus;
  
  streamTitle: string;
  streamCategory: string;
  streamLanguage?: string;
  thumbnail?: string;
  
  viewerCount: number; // Latest snapshot
  peakViewerCount: number;
  sessionDuration: number; // In seconds
  monitoringEnabled: boolean;
  
  createdAt: Date | string;
  updatedAt: Date | string;
  startedAt?: Date | string | null;
  endedAt?: Date | string | null;
  lastHeartbeat: Date | string;
  lastActivity: Date | string;
  lastError?: string | null;

  // Multi-platform collector status fields
  collectorType?: "websocket" | "polling" | string;
  chatId?: string;
  collectorHealth?: string;
  lastCollectorHeartbeat?: Date | string | null;
  pollCount?: number;
  messageCount?: number;

  // Flexible metadata object for future module extensions
  metadata?: Record<string, any>;
}

export interface KickPlatformMetadata {
  channelId?: number;  // broadcaster_user_id from Kick API
  chatroomId?: string; // Stable chatroom ID (same as channelId as string for Kick)
  slug?: string;       // Kick channel slug / username
  resolvedAt?: string; // ISO timestamp of last successful resolution
}

export interface ConnectedPlatformAccount {
  id: string; // Unique connection ID (e.g. conn_kick_1784819230)
  platform: SupportedPlatform;
  username: string;
  displayName: string;
  avatar?: string;
  channelUrl: string;
  stableChannelId?: string; // Stable channel/user ID from API if available
  followersCount?: number;
  verified: boolean;
  monitoringEnabled: boolean;
  isDefault: boolean;
  connectedAt: Date | string;
  lastVerifiedAt: Date | string;
  // Platform-specific stable identifiers (avoids repeated API calls during monitoring)
  kickMetadata?: KickPlatformMetadata;
}

export interface VerifiedChannelMeta {
  platform: SupportedPlatform;
  username: string;
  displayName: string;
  avatar?: string;
  channelUrl: string;
  stableChannelId?: string;
  followersCount?: number;
  verified: boolean;
  // Resolved at verification time so the backend daemon never has to call Cloudflare-blocked endpoints
  kickMetadata?: KickPlatformMetadata;
}

export interface CreatorProfileData {
  displayName: string;
  avatarUrl?: string;
}

export interface PlatformSelectionData {
  selectedPlatforms: string[]; // e.g. ["kick", "youtube"]
}

export interface ConnectedPlatformsData {
  kickUrl?: string;
  youtubeUrl?: string;
  platformsList?: ConnectedPlatformAccount[];
  verifiedChannels?: {
    kick?: VerifiedChannelMeta | null;
    youtube?: VerifiedChannelMeta | null;
    [key: string]: VerifiedChannelMeta | null | undefined;
  };
}

export interface CreatorGoalsData {
  goals: string[];
}

export interface OnboardingState {
  currentStepIndex: number;
  creatorProfile: CreatorProfileData;
  platformSelection: PlatformSelectionData;
  connectedPlatforms: ConnectedPlatformsData;
  goals: CreatorGoalsData;
  isStepValid: boolean[];
}

export interface User {
  id?: string;
  _id?: any;
  name?: string;
  email: string;
  hashedPassword?: string;
  emailVerified?: Date | null;
  role?: "creator" | "admin";
  onboardingCompleted?: boolean;
  connectedPlatforms?: ConnectedPlatformAccount[];
  youtubeLink?: string;
  twitchLink?: string;
  kickLink?: string;
  status: "pending" | "verified" | "rejected";
  isAdmin?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
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

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
