import { PlatformDetector, StreamMetadata } from "./types";
import { getVideoIdFromUrl } from "@/lib/youtube";

export class YouTubePlatformDetector implements PlatformDetector {
  public readonly platform = "youtube";

  public async checkLiveStatus(usernameOrUrl: string): Promise<boolean> {
    const meta = await this.getStreamMetadata(usernameOrUrl);
    return meta.isLive;
  }

  public async getStreamMetadata(usernameOrUrl: string): Promise<StreamMetadata> {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      console.warn("[YouTubePlatformDetector] YOUTUBE_API_KEY missing");
      return { isLive: false };
    }

    try {
      const videoId = getVideoIdFromUrl(usernameOrUrl);
      
      if (videoId) {
        const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails,statistics&id=${videoId}&key=${apiKey}`;
        const res = await fetch(videoUrl);
        const data = await res.json();
        const item = data.items?.[0];

        if (item) {
          const liveDetails = item.liveStreamingDetails;
          const snippet = item.snippet;
          const isLive = Boolean(liveDetails && !liveDetails.actualEndTime && (liveDetails.actualStartTime || snippet.liveBroadcastContent === "live"));

          return {
            isLive,
            streamTitle: snippet.title,
            streamCategory: snippet.categoryTitle || "YouTube Stream",
            streamLanguage: snippet.defaultLanguage || "English",
            thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
            viewerCount: Number(liveDetails?.concurrentViewers || item.statistics?.viewCount || 0),
            chatroomId: liveDetails?.activeLiveChatId,
            rawPayload: item,
          };
        }
      }

      // Search by channel handle if no direct video ID
      let handle = usernameOrUrl.trim();
      if (!handle.startsWith("@") && !handle.includes("youtube.com")) {
        handle = "@" + handle;
      }

      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&eventType=live&type=video&q=${encodeURIComponent(handle)}&key=${apiKey}`;
      const searchRes = await fetch(searchUrl);
      const searchData = await searchRes.json();
      const searchItem = searchData.items?.[0];

      if (searchItem && searchItem.id?.videoId) {
        const foundVideoId = searchItem.id.videoId;
        const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails,statistics&id=${foundVideoId}&key=${apiKey}`;
        const detailsRes = await fetch(detailsUrl);
        const detailsData = await detailsRes.json();
        const detailItem = detailsData.items?.[0];

        if (detailItem) {
          const liveDetails = detailItem.liveStreamingDetails;
          const snippet = detailItem.snippet;
          const isLive = Boolean(liveDetails && !liveDetails.actualEndTime);

          return {
            isLive,
            streamTitle: snippet.title,
            streamCategory: "YouTube Stream",
            streamLanguage: snippet.defaultLanguage || "English",
            thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
            viewerCount: Number(liveDetails?.concurrentViewers || 0),
            chatroomId: liveDetails?.activeLiveChatId,
            rawPayload: detailItem,
          };
        }
      }

      return { isLive: false };
    } catch (err: any) {
      console.warn(`[YouTubePlatformDetector] Failed to detect live status for '${usernameOrUrl}':`, err.message);
      return { isLive: false };
    }
  }

  public async getViewerCount(usernameOrUrl: string): Promise<number> {
    const meta = await this.getStreamMetadata(usernameOrUrl);
    return meta.viewerCount || 0;
  }
}
