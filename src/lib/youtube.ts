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

export function getVideoIdFromUrl(url: string): string | null {
  const trimmed = url.trim();
  let videoId: string | null = null;

  if (trimmed.includes("youtu.be/")) {
    videoId = trimmed.split("youtu.be/")[1]?.split("/")[0]?.split("?")[0]?.split("&")[0];
  } else if (trimmed.includes("youtube.com/watch")) {
    const queryString = trimmed.split("?")[1] || "";
    const urlParams = new URLSearchParams(queryString);
    videoId = urlParams.get("v");
  } else if (trimmed.includes("youtube.com/embed/")) {
    videoId = trimmed.split("youtube.com/embed/")[1]?.split("/")[0]?.split("?")[0];
  } else if (trimmed.includes("youtube.com/shorts/")) {
    videoId = trimmed.split("youtube.com/shorts/")[1]?.split("/")[0]?.split("?")[0];
  }

  return videoId || null;
}

// Scrape chat replay archive from completed live stream VOD
export async function getYoutubeLiveChatReplay(videoId: string): Promise<string[]> {
  try {
    const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const resHtml = await fetch(watchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (!resHtml.ok) return [];
    const html = await resHtml.text();

    // 1. Extract INNERTUBE_API_KEY
    const apiKeyMatch = html.match(/"INNERTUBE_API_KEY"\s*:\s*"([^"]+)"/);
    const innertubeKey = apiKeyMatch ? apiKeyMatch[1] : "";

    // 2. Parse ytInitialData JSON to find continuation token recursively
    const ytDataMatch = html.match(/ytInitialData\s*=\s*({.+?});\s*<\/script>/);
    let continuationToken: string | null = null;

    if (ytDataMatch) {
      try {
        const data = JSON.parse(ytDataMatch[1]);
        
        // Recursive key search helper
        const findKeyInObject = (obj: any, targetKey: string): any => {
          if (!obj || typeof obj !== "object") return null;
          if (obj[targetKey] !== undefined) return obj[targetKey];
          
          for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
              const result = findKeyInObject(obj[key], targetKey);
              if (result) return result;
            }
          }
          return null;
        };

        const liveChatRenderer = findKeyInObject(data, "liveChatRenderer");
        if (liveChatRenderer && liveChatRenderer.continuations) {
          const cont = liveChatRenderer.continuations[0];
          continuationToken = cont?.reloadContinuationData?.continuation || 
                              cont?.liveChatReplayContinuationRenderer?.continuation || 
                              null;
        }
      } catch (err) {
        console.warn("Failed to parse ytInitialData JSON in crawler:", err);
      }
    }

    if (!continuationToken || !innertubeKey) {
      console.warn("No chat replay token found in watch page HTML");
      return [];
    }

    // Call internal Youtubei API get_live_chat_replay endpoint
    const chatUrl = `https://www.youtube.com/youtubei/v1/live_chat/get_live_chat_replay?key=${innertubeKey}`;
    const nextRes = await fetch(chatUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        context: {
          client: {
            clientName: "WEB",
            clientVersion: "2.20240101.01.00"
          }
        },
        continuation: continuationToken
      })
    });

    if (!nextRes.ok) return [];
    const nextData = await nextRes.json();

    const actions = nextData.continuationContents?.liveChatContinuation?.actions || [];
    const chatLogs: string[] = [];

    for (const act of actions) {
      const chatItemAction = act.replayChatItemAction?.actions?.[0];
      const textRenderer = chatItemAction?.addChatItemAction?.item?.liveChatTextMessageRenderer || 
                           chatItemAction?.addChatItemAction?.item?.liveChatPaidMessageRenderer;
      
      if (textRenderer) {
        const author = textRenderer.authorName?.simpleText || "User";
        const timestamp = textRenderer.timestampText?.simpleText || "00:00";
        const messageText = textRenderer.message?.runs?.map((r: any) => r.text || "").join("") || "";
        
        if (messageText.trim()) {
          chatLogs.push(`${author} [${timestamp}]: ${messageText}`);
        }
      }
    }

    return chatLogs;
  } catch (error) {
    console.warn("Failed to scrape YouTube live chat replay:", error);
    return [];
  }
}

export async function getVideoDetailsAndComments(url: string) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing YOUTUBE_API_KEY environment variable");
  }

  const videoId = getVideoIdFromUrl(url);
  if (!videoId) {
    throw new Error("Could not parse a valid YouTube Video ID from the provided URL.");
  }

  // 1. Fetch Video Metadata (Title & Thumbnail)
  const videoApiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`;
  const videoRes = await fetch(videoApiUrl);
  const videoData = await videoRes.json();

  if (videoData.error) {
    throw new Error(videoData.error.message || "Failed to fetch video details");
  }

  if (!videoData.items || videoData.items.length === 0) {
    throw new Error("YouTube video not found. Please verify the URL.");
  }

  const videoItem = videoData.items[0];
  const title = videoItem.snippet.title;
  const thumbnailUrl = videoItem.snippet.thumbnails?.medium?.url || videoItem.snippet.thumbnails?.default?.url || "";

  // 2. Hybrid Scrape: Try live chat replay archive first (For streams)
  let comments: string[] = [];
  try {
    comments = await getYoutubeLiveChatReplay(videoId);
  } catch (err) {
    console.warn("Live chat replay crawler failed, fallback to comments API:", err);
  }

  // 3. Fallback: Query standard commentThreads endpoint (For regular videos)
  if (comments.length === 0) {
    const commentsApiUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&maxResults=100&videoId=${videoId}&key=${apiKey}`;
    const commentsRes = await fetch(commentsApiUrl);
    const commentsData = await commentsRes.json();

    if (commentsData.items) {
      comments = commentsData.items.map((item: any) => item.snippet.topLevelComment.snippet.textOriginal || item.snippet.topLevelComment.snippet.textDisplay || "");
    }
  }

  return {
    videoId,
    title,
    thumbnailUrl,
    comments
  };
}
