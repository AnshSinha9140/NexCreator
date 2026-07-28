import { LiveChatMessage } from "@/lib/ingestion/types";
import { EventNormalizer } from "../shared/eventNormalizer";
import { ParsedYouTubeMessage } from "./youtubeParser";

export class YouTubeAdapter {
  public static toUnifiedMessage(sessionId: string, parsed: ParsedYouTubeMessage): LiveChatMessage | null {
    if (!parsed) return null;

    return EventNormalizer.normalize({
      id: parsed.id,
      sessionId,
      platform: "youtube",
      channelId: parsed.authorChannelId,
      displayName: parsed.authorDisplayName,
      username: parsed.authorDisplayName.toLowerCase().replace(/\s+/g, ""),
      message: parsed.messageText,
      timestamp: parsed.timestamp,
      badges: parsed.userBadges,
      metadata: {
        eventType: parsed.eventType,
        amountDisplayString: parsed.amountDisplayString,
        currency: parsed.currency,
        profileImageUrl: parsed.authorProfileImageUrl,
      },
      raw: parsed.rawPayload,
    });
  }
}
