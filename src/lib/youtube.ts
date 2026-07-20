export async function getYoutubeChannelStats(url: string) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error("Missing YOUTUBE_API_KEY environment variable in Vercel/env");
  }

  // Parse handle or ID from URL
  let handle = "";
  let channelId = "";

  const trimmedUrl = url.trim();
  
  if (trimmedUrl.includes("youtube.com/channel/")) {
    channelId = trimmedUrl.split("youtube.com/channel/")[1]?.split("/")[0]?.split("?")[0];
  } else if (trimmedUrl.includes("youtube.com/@")) {
    handle = "@" + trimmedUrl.split("youtube.com/@")[1]?.split("/")[0]?.split("?")[0];
  } else {
    // If they just typed a username instead of a full link, try to treat it as a handle
    const clean = trimmedUrl.replace("@", "");
    if (clean && !clean.includes(".")) {
      handle = "@" + clean;
    }
  }

  let apiUrl = "";
  if (channelId) {
    apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&id=${channelId}&key=${apiKey}`;
  } else if (handle) {
    apiUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&forHandle=${encodeURIComponent(handle)}&key=${apiKey}`;
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
  return {
    title: item.snippet.title,
    handle: item.snippet.customUrl || handle,
    description: item.snippet.description || "",
    avatarUrl: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url || "",
    subscribers: Number(item.statistics.subscriberCount || 0),
    views: Number(item.statistics.viewCount || 0),
    videos: Number(item.statistics.videoCount || 0),
  };
}
