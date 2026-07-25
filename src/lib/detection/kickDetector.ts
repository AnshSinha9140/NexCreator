import { PlatformDetector, StreamMetadata } from "./types";
import { getOfficialKickChannelInfo } from "@/lib/kick";

export class KickPlatformDetector implements PlatformDetector {
  platform = "kick";

  /**
   * Extract clean username from input handle or URL
   */
  private extractUsername(input: string): string {
    let clean = input.trim();
    if (clean.includes("kick.com/")) {
      clean = clean.split("kick.com/")[1]?.split("/")[0]?.split("?")[0] || clean;
    }
    return clean.replace("@", "").toLowerCase();
  }

  /**
   * Checks whether the specified Kick channel is currently live
   */
  async checkLiveStatus(usernameOrUrl: string): Promise<boolean> {
    const meta = await this.getStreamMetadata(usernameOrUrl);
    return meta.isLive;
  }

  /**
   * Fetches stream metadata (isLive, title, category, viewer count).
   *
   * NOTE: chatroomId is intentionally NOT resolved here.
   * The chatroomId is persisted on the ConnectedPlatformAccount.kickMetadata
   * during platform verification and passed directly to the IngestionManager.
   * This prevents repeated Cloudflare-blocked fallback attempts on every poll cycle.
   */
  async getStreamMetadata(usernameOrUrl: string): Promise<StreamMetadata> {
    const username = this.extractUsername(usernameOrUrl);
    if (!username) {
      return { isLive: false, streamTitle: "Offline", viewerCount: 0 };
    }

    try {
      // Official Kick Developer API — backend-safe, no Cloudflare dependency
      const officialInfo = await getOfficialKickChannelInfo(username);
      if (officialInfo) {
        return {
          isLive: officialInfo.isLive,
          streamTitle: officialInfo.streamTitle || (officialInfo.isLive ? `${username}'s Live Broadcast` : "Offline"),
          streamCategory: officialInfo.streamCategory || "Gaming & Variety",
          streamLanguage: officialInfo.streamLanguage || "English",
          thumbnail: officialInfo.thumbnail || "",
          viewerCount: officialInfo.viewerCount || 0,
          // chatroomId sourced from broadcaster_user_id — reliable fallback
          chatroomId: officialInfo.chatroomId ? String(officialInfo.chatroomId) : undefined,
        };
      }
    } catch (err: any) {
      console.warn(`[KickDetector] Official API warning for '${username}':`, err.message);
    }

    return {
      isLive: false,
      streamTitle: `${username} (Offline or API unavailable)`,
      viewerCount: 0,
    };
  }

  /**
   * Fetches latest viewer count snapshot
   */
  async getViewerCount(usernameOrUrl: string): Promise<number> {
    const meta = await this.getStreamMetadata(usernameOrUrl);
    return meta.viewerCount || 0;
  }
}
