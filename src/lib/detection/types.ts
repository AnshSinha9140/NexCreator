import { SupportedPlatform } from "@/types";

export interface StreamMetadata {
  isLive: boolean;
  streamTitle?: string;
  streamCategory?: string;
  streamLanguage?: string;
  thumbnail?: string;
  viewerCount?: number;
  chatroomId?: string;
  rawPayload?: Record<string, any>;
}

export interface PlatformDetector {
  platform: SupportedPlatform;
  checkLiveStatus(usernameOrUrl: string): Promise<boolean>;
  getStreamMetadata(usernameOrUrl: string): Promise<StreamMetadata>;
  getViewerCount(usernameOrUrl: string): Promise<number>;
}
