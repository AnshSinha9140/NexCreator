// Official Kick Developer API Helper (OAuth 2.1 Client Credentials Flow)

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

export async function getOfficialKickToken(): Promise<string | null> {
  const clientId = process.env.KICK_CLIENT_ID;
  const clientSecret = process.env.KICK_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  // Return cached token if still valid
  if (cachedToken && Date.now() < tokenExpiresAt - 60000) {
    return cachedToken;
  }

  try {
    const res = await fetch("https://id.kick.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: clientId,
        client_secret: clientSecret
      }).toString()
    });

    if (res.ok) {
      const data = await res.json();
      cachedToken = data.access_token;
      tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
      return cachedToken;
    } else {
      console.warn("Official Kick OAuth Token Error:", res.status, await res.text());
    }
  } catch (err: any) {
    console.error("Failed to fetch official Kick OAuth token:", err.message);
  }

  return null;
}

export async function getOfficialKickChannelInfo(username: string) {
  const token = await getOfficialKickToken();
  if (!token) return null;

  try {
    const res = await fetch(`https://api.kick.com/public/v1/channels?slug=${username.toLowerCase()}`, {
      headers: {
        "Authorization": `Bearer ${token}`,
        "Accept": "application/json"
      }
    });

    if (res.ok) {
      const data = await res.json();
      const channelObj = data.data?.[0];
      if (channelObj) {
        return {
          chatroomId: channelObj.chatroom?.id || channelObj.chatroom_id || null,
          isLive: !!channelObj.stream?.is_live,
          username: channelObj.slug || username,
          followersCount: 0
        };
      }
    } else {
      console.warn("Official Kick API Channel Lookup failed:", res.status, await res.text());
    }
  } catch (err: any) {
    console.error("Official Kick API Error:", err.message);
  }

  return null;
}

export async function getKickChannelStats(username: string) {
  const info = await getOfficialKickChannelInfo(username);
  if (info) {
    return {
      username: info.username,
      followersCount: info.followersCount || 0,
      isLive: info.isLive,
      chatroomId: info.chatroomId
    };
  }
  return { username, followersCount: 0, isLive: false, chatroomId: null };
}
