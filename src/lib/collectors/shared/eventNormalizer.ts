import { SupportedPlatform } from "@/types";
import { LiveChatMessage } from "@/lib/ingestion/types";
import { MessageNormalizer } from "@/lib/chat/normalizer";
import { MessageValidator } from "./messageValidator";
import { SessionArtifactRegistry } from "@/lib/session/artifactRegistry";


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

    const canonical = MessageNormalizer.normalize(
      {
        id,
        platform: input.platform,
        timestamp,
        author: {
          id: input.channelId || input.creatorId || username,
          username,
          displayName: input.displayName || username,
          badges: input.badges || [],
          avatarUrl: input.metadata?.profileImageUrl,
        },
        message: input.message || "",
        raw: input.raw || { metadata: input.metadata },
      },
      input.sessionId
    );

    const normalizedMsg: LiveChatMessage = {
      ...canonical,
      message: canonical.displayText,
      timestamp: isNaN(timestamp.getTime()) ? new Date() : timestamp,
      emotes: canonical.emotes.map((e) => e.name),
    };

    if (!MessageValidator.isValid(normalizedMsg)) {
      console.warn(`[EventNormalizer] Message validation failed for event ID '${id}' on platform '${input.platform}'`);
      return null;
    }

    SessionArtifactRegistry.saveChatMessage(input.sessionId, normalizedMsg).catch(() => {});

    return normalizedMsg;
  }


}
