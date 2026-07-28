import { SupportedPlatform } from "@/types";
import { BaseCollector } from "./collector";
import { CollectorOptions } from "./types";
import { KickCollectorAdapter } from "../kick/kickCollectorAdapter";
import { YouTubeCollector } from "../youtube/youtubeCollector";

export class CollectorFactory {
  public static create(
    platform: SupportedPlatform,
    sessionId: string,
    options: CollectorOptions = {}
  ): BaseCollector {
    const normalized = (platform || "").toLowerCase().trim();

    switch (normalized) {
      case "kick":
        return new KickCollectorAdapter(sessionId, options);

      case "youtube":
        return new YouTubeCollector(sessionId, options);

      case "twitch":
      case "tiktok":
      case "instagram":
        throw new Error(
          `Platform '${platform}' is standard-configured in CollectorFactory but collector implementation is scheduled for a future sprint.`
        );

      default:
        console.warn(`[CollectorFactory] Unknown platform '${platform}'. Defaulting to Kick collector adapter.`);
        return new KickCollectorAdapter(sessionId, options);
    }
  }
}
