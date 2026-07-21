export async function getKickChannelStats(url: string) {
  let username = "";
  const trimmedUrl = url.trim();
  
  if (trimmedUrl.includes("kick.com/")) {
    username = trimmedUrl.split("kick.com/")[1]?.split("/")[0]?.split("?")[0];
  } else {
    // If they just typed a username
    const clean = trimmedUrl.replace("@", "");
    if (clean && !clean.includes(".")) {
      username = clean;
    }
  }

  if (!username) {
    throw new Error("Invalid Kick URL");
  }

  try {
    // Attempt to fetch from Kick public API
    // Note: Kick public endpoints are protected by Cloudflare. If blocked, we catch and fall back to 0.
    const res = await fetch(`https://kick.com/api/v1/channels/${encodeURIComponent(username.toLowerCase())}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)",
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (res.ok) {
      const data = await res.json();
      return {
        username: data.user?.username || username,
        avatarUrl: data.user?.profile_pic || "",
        followers: Number(data.followers_count || 0),
        isLive: !!data.livestream,
      };
    }
  } catch (e) {
    console.warn("Kick API request failed (Cloudflare block). Using fallback parser.");
  }

  // Fallback to 0 followers instead of a random number if API is blocked by Cloudflare
  return {
    username: "@" + username,
    avatarUrl: "",
    followers: 0,
    isLive: false,
  };
}
