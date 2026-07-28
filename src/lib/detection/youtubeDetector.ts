import { PlatformDetector, StreamMetadata } from "./types";
import { getVideoIdFromUrl, resolveYoutubeChannelId } from "@/lib/youtube";

export class YouTubePlatformDetector implements PlatformDetector {
  public readonly platform = "youtube";

  public async checkLiveStatus(usernameOrUrl: string): Promise<boolean> {
    const meta = await this.getStreamMetadata(usernameOrUrl);
    return meta.isLive;
  }

  public async getStreamMetadata(usernameOrUrl: string, sessionId?: string): Promise<StreamMetadata> {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const sessionTag = sessionId ? `[Session: ${sessionId}]` : "[Session: N/A]";

    console.log(`\n=================== [YouTube Live Detection Audit] ===================`);
    console.log(`${sessionTag} Connected Platform: youtube`);
    console.log(`${sessionTag} Stored Channel URL / Handle Input: '${usernameOrUrl}'`);

    if (!apiKey) {
      console.warn(`${sessionTag} ❌ Failure Reason: YOUTUBE_API_KEY missing in process.env`);
      console.log(`=====================================================================\n`);
      return { isLive: false };
    }

    try {
      // ─── STEP 1: DIRECT VIDEO URL DETECTION ─────────────────────────────────
      const directVideoId = getVideoIdFromUrl(usernameOrUrl);
      if (directVideoId) {
        const videoEndpoint = `https://www.googleapis.com/youtube/v3/videos`;
        const params = `part=snippet,liveStreamingDetails,statistics&id=${directVideoId}&key=${apiKey.substring(0, 8)}...`;
        console.log(`${sessionTag} Detection Strategy: Direct Video URL`);
        console.log(`${sessionTag} Calling Endpoint: ${videoEndpoint}`);
        console.log(`${sessionTag} Request Params: ${params}`);

        const videoUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails,statistics&id=${directVideoId}&key=${apiKey}`;
        const res = await fetch(videoUrl);
        console.log(`${sessionTag} HTTP Status: ${res.status}`);

        const data = await res.json();
        const items = data.items || [];
        console.log(`${sessionTag} Returned Items: ${items.length}`);

        const item = items[0];
        if (item) {
          const liveDetails = item.liveStreamingDetails;
          const snippet = item.snippet;
          const isLive = Boolean(
            liveDetails &&
              !liveDetails.actualEndTime &&
              (liveDetails.actualStartTime || snippet.liveBroadcastContent === "live")
          );

          const activeChatId = liveDetails?.activeLiveChatId;
          console.log(`${sessionTag} Active Broadcast ID: ${item.id}`);
          console.log(`${sessionTag} Active Live Chat ID: ${activeChatId || "NONE"}`);
          console.log(`${sessionTag} isLive Decision: ${isLive ? "LIVE ✅" : "NOT LIVE ❌"}`);
          if (!isLive) {
            console.log(`${sessionTag} Reason: Video details indicate broadcast completed or offline`);
          }
          console.log(`=====================================================================\n`);

          return {
            isLive,
            streamTitle: snippet.title,
            streamCategory: snippet.categoryTitle || "YouTube Stream",
            streamLanguage: snippet.defaultLanguage || "English",
            thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
            viewerCount: Number(liveDetails?.concurrentViewers || item.statistics?.viewCount || 0),
            chatroomId: activeChatId,
            rawPayload: item,
          };
        }
      }

      // ─── STEP 2: CHANNEL ID RESOLUTION ──────────────────────────────────────
      console.log(`${sessionTag} Resolving Channel ID for handle/URL...`);
      const resolvedChannelId = await resolveYoutubeChannelId(usernameOrUrl);
      console.log(`${sessionTag} Resolved Channel ID: ${resolvedChannelId || "FAILED_TO_RESOLVE"}`);

      if (!resolvedChannelId) {
        console.warn(`${sessionTag} ❌ isLive Decision: NOT LIVE`);
        console.warn(`${sessionTag} Reason: Could not resolve channel handle/URL to a valid YouTube Channel ID (UC...)`);
        console.log(`=====================================================================\n`);
        return { isLive: false };
      }

      // ─── STEP 3: SEARCH.LIST WITH CHANNEL ID ──────────────────────────────
      const searchEndpoint = `https://www.googleapis.com/youtube/v3/search`;
      const searchParams = `part=snippet&channelId=${resolvedChannelId}&eventType=live&type=video&key=${apiKey.substring(0, 8)}...`;
      console.log(`${sessionTag} Calling Endpoint: ${searchEndpoint}`);
      console.log(`${sessionTag} Request Params: ${searchParams}`);

      const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${encodeURIComponent(
        resolvedChannelId
      )}&eventType=live&type=video&key=${apiKey}`;

      const searchRes = await fetch(searchUrl);
      console.log(`${sessionTag} HTTP Status: ${searchRes.status}`);

      if (!searchRes.ok) {
        const errJson = await searchRes.json().catch(() => ({}));
        console.warn(`${sessionTag} ❌ API Error:`, errJson?.error?.message || `HTTP ${searchRes.status}`);
        console.warn(`${sessionTag} isLive Decision: NOT LIVE`);
        console.log(`=====================================================================\n`);
        return { isLive: false };
      }

      const searchData = await searchRes.json();
      const searchItems = searchData.items || [];
      console.log(`${sessionTag} Returned Items: ${searchItems.length}`);

      if (searchItems.length === 0) {
        console.log(`${sessionTag} isLive Decision: NOT LIVE ❌`);
        console.log(`${sessionTag} Reason: No active live broadcast returned for channel ${resolvedChannelId}`);
        console.log(`=====================================================================\n`);
        return { isLive: false };
      }

      const activeBroadcast = searchItems[0];
      const activeVideoId = activeBroadcast.id?.videoId;
      console.log(`${sessionTag} Active Broadcast Video ID: ${activeVideoId}`);

      if (!activeVideoId) {
        console.log(`${sessionTag} isLive Decision: NOT LIVE ❌`);
        console.log(`${sessionTag} Reason: Returned search item missing videoId`);
        console.log(`=====================================================================\n`);
        return { isLive: false };
      }

      // ─── STEP 4: FETCH DETAILED BROADCAST & CHAT ID ─────────────────────────
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,liveStreamingDetails,statistics&id=${activeVideoId}&key=${apiKey}`;
      const detailsRes = await fetch(detailsUrl);
      const detailsData = await detailsRes.json();
      const detailItem = detailsData.items?.[0];

      if (detailItem) {
        const liveDetails = detailItem.liveStreamingDetails;
        const snippet = detailItem.snippet;
        const activeChatId = liveDetails?.activeLiveChatId;
        const isLive = Boolean(liveDetails && !liveDetails.actualEndTime);

        console.log(`${sessionTag} Active Broadcast Title: "${snippet.title}"`);
        console.log(`${sessionTag} Active Live Chat ID: ${activeChatId || "NONE"}`);
        console.log(`${sessionTag} Concurrent Viewers: ${liveDetails?.concurrentViewers || 0}`);
        console.log(`${sessionTag} isLive Decision: ${isLive ? "LIVE ✅" : "NOT LIVE ❌"}`);
        console.log(`=====================================================================\n`);

        return {
          isLive,
          streamTitle: snippet.title,
          streamCategory: snippet.categoryTitle || "YouTube Stream",
          streamLanguage: snippet.defaultLanguage || "English",
          thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
          viewerCount: Number(liveDetails?.concurrentViewers || 0),
          chatroomId: activeChatId,
          rawPayload: detailItem,
        };
      }

      console.log(`${sessionTag} isLive Decision: NOT LIVE ❌`);
      console.log(`${sessionTag} Reason: Detailed video query returned 0 items for videoId ${activeVideoId}`);
      console.log(`=====================================================================\n`);
      return { isLive: false };
    } catch (err: any) {
      console.error(`${sessionTag} ❌ Detection Exception:`, err.message);
      console.log(`=====================================================================\n`);
      return { isLive: false };
    }
  }

  public async getViewerCount(usernameOrUrl: string): Promise<number> {
    const meta = await this.getStreamMetadata(usernameOrUrl);
    return meta.viewerCount || 0;
  }
}
