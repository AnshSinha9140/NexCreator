export async function getYoutubeChannelStats(url: string, cachedPlaylistId?: string) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing YOUTUBE_API_KEY environment variable in Vercel/env");
  }

  let uploadsPlaylistId = cachedPlaylistId;
  let channelTitle = "Channel Workspace";
  let channelHandle = "@creator";
  let channelAvatar = "";
  let subscribers = 0;
  let views = 0;
  let videos = 0;

  // Step 1: Query channel metadata ONLY if we don't have a cached uploads playlist ID
  if (!uploadsPlaylistId) {
    let handle = "";
    let channelId = "";
    const trimmedUrl = url.trim();
    
    if (trimmedUrl.includes("youtube.com/channel/")) {
      channelId = trimmedUrl.split("youtube.com/channel/")[1]?.split("/")[0]?.split("?")[0];
    } else if (trimmedUrl.includes("youtube.com/@")) {
      handle = "@" + trimmedUrl.split("youtube.com/@")[1]?.split("/")[0]?.split("?")[0];
    } else {
      const clean = trimmedUrl.replace("@", "");
      if (clean && !clean.includes(".")) {
        handle = "@" + clean;
      }
    }

    let apiUrl = "";
    if (channelId) {
      apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet,contentDetails&id=${channelId}&key=${apiKey}`;
    } else if (handle) {
      apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet,contentDetails&forHandle=${encodeURIComponent(handle)}&key=${apiKey}`;
    } else {
      throw new Error("Invalid YouTube URL. Please enter a valid URL containing '/channel/ID' or '/@handle'.");
    }

    const res = await fetch(apiUrl);
    const data = await res.json();

    if (data.error) {
      throw new Error(data.error.message || "Failed to fetch YouTube stats");
    }

    if (!data.items || data.items.length === 0) {
      throw new Error(`YouTube channel for '${handle || channelId}' not found.`);
    }

    const item = data.items[0];
    uploadsPlaylistId = item.contentDetails?.relatedPlaylists?.uploads;
    channelTitle = item.snippet.title;
    channelHandle = item.snippet.customUrl || handle;
    channelAvatar = item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || "";
    subscribers = Number(item.statistics.subscriberCount || 0);
    views = Number(item.statistics.viewCount || 0);
    videos = Number(item.statistics.videoCount || 0);
  }

  let recentVideos: any[] = [];

  // Step 2: Fetch recent videos directly using the playlist ID (Saves 1 quota unit per call)
  if (uploadsPlaylistId) {
    try {
      const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=contentDetails&maxResults=3&playlistId=${uploadsPlaylistId}&key=${apiKey}`;
      const playlistRes = await fetch(playlistUrl);
      const playlistData = await playlistRes.json();

      if (playlistData.items && playlistData.items.length > 0) {
        const videoIds = playlistData.items.map((v: any) => v.contentDetails.videoId);
        
        // Step 3: Fetch detailed stats for these 3 videos
        const videosUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet,contentDetails&id=${videoIds.join(",")}&key=${apiKey}`;
        const videosRes = await fetch(videosUrl);
        const videosData = await videosRes.json();

        if (videosData.items) {
          recentVideos = videosData.items.map((vid: any) => ({
            id: vid.id,
            title: vid.snippet.title,
            thumbnailUrl: vid.snippet.thumbnails?.medium?.url || vid.snippet.thumbnails?.default?.url || "",
            views: Number(vid.statistics.viewCount || 0),
            likes: Number(vid.statistics.likeCount || 0),
            comments: Number(vid.statistics.commentCount || 0),
            publishedAt: vid.snippet.publishedAt,
            duration: vid.contentDetails.duration
          }));
        }
      }
    } catch (err) {
      console.warn("Failed to fetch YouTube recent videos:", err);
    }
  }

  return {
    title: channelTitle,
    handle: channelHandle,
    avatarUrl: channelAvatar,
    subscribers,
    views,
    videos,
    uploadsPlaylistId,
    recentVideos
  };
}
