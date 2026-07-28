import { SupportedPlatform } from "@/types";
import { LiveChatMessage } from "@/lib/ingestion/types";
import { MessageValidator } from "./messageValidator";

export interface UnifiedEventInput {
  id?: string;
  sessionId: string;
  platform: SupportedPlatform;
  creatorId?: string;
  channelId?: string;
  username?: string;
  displayName: string;
  message: string;
  timestamp?: Date | string;
  badges?: string[];
  emotes?: string[];
  metadata?: Record<string, any>;
  raw?: unknown;
}

export class EventNormalizer {
  public static normalize(input: UnifiedEventInput): LiveChatMessage | null {
    const timestamp = input.timestamp ? new Date(input.timestamp) : new Date();
    const id = input.id || `msg_${input.platform}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const username = input.username || input.displayName.toLowerCase().replace(/\s+/g, "");

    const normalizedMsg: LiveChatMessage = {
      id,
      sessionId: input.sessionId,
      platform: input.platform,
      timestamp: isNaN(timestamp.getTime()) ? new Date() : timestamp,
      author: {
        id: input.channelId || input.creatorId || username,
        username,
        displayName: input.displayName || username,
        badges: input.badges || [],
      },
      message: input.message || "",
      emotes: input.emotes || [],
      raw: input.raw || { metadata: input.metadata },
    };

    if (!MessageValidator.isValid(normalizedMsg)) {
      console.warn(`[EventNormalizer] Message validation failed for event ID '${id}' on platform '${input.platform}'`);
      return null;
    }

    return normalizedMsg;
  }
}
