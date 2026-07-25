// Official Kick Developer API Helper (OAuth 2.1 Client Credentials Flow)

let cachedToken: string | null = null;
let tokenExpiresAt: number = 0;

export async function getOfficialKickToken(): Promise<string | null> {
  const clientId = process.env.KICK_CLIENT_ID;
  const clientSecret = process.env.KICK_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  // Return cached token if still valid (with 60s buffer)
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
      console.warn("[KickAuth] OAuth Token Error:", res.status, await res.text());
    }
  } catch (err: any) {
    console.error("[KickAuth] Failed to fetch official Kick OAuth token:", err.message);
  }

  return null;
}

/**
 * Fetches basic channel info via Official Kick Developer API.
 */
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
        const broadcasterId = channelObj.broadcaster_user_id;

        return {
          // Priority: 1) Official API broadcaster_user_id (will be used as base for brute-force)
          chatroomId: broadcasterId ? String(broadcasterId) : null,
          channelId: broadcasterId || null,
          isLive: !!channelObj.stream?.is_live,
          viewerCount: typeof channelObj.stream?.viewer_count === "number" ? channelObj.stream.viewer_count : (channelObj.viewer_count || 0),
          streamTitle: channelObj.stream_title || channelObj.stream?.session_title || `${username}'s Broadcast`,
          streamCategory: channelObj.category?.name || "Gaming & Variety",
          streamLanguage: channelObj.stream?.language || "English",
          thumbnail: channelObj.stream?.thumbnail || channelObj.banner_picture || "",
          username: channelObj.slug || username,
          followersCount: 0,
          slug: channelObj.slug || username,
        };
      }
    } else {
      console.warn("[KickAuth] Official Kick API Channel Lookup failed:", res.status, await res.text());
    }
  } catch (err: any) {
    console.error("[KickAuth] Official Kick API Error:", err.message);
  }

  return null;
}

/**
 * Resolves the Kick chatroomId for a given channel username.
 * Supports explicit clientChatroomId, banner extraction, public v2 lookup, and broadcaster_user_id fallback.
 */
export async function getKickChatroomId(username: string, clientChatroomId?: string): Promise<{
  chatroomId: string;
  channelId: number;
  slug: string;
} | null> {
  // If client provided explicit chatroomId (e.g. resolved in browser), use it directly
  if (clientChatroomId) {
    console.log(`[KickAuth] ✅ Using client-resolved chatroomId for '${username}': #${clientChatroomId}`);
    return {
      chatroomId: String(clientChatroomId),
      channelId: Number(clientChatroomId) || 0,
      slug: username,
    };
  }

  const info = await getOfficialKickChannelInfo(username);
  let chatroomId = info?.chatroomId || null;

  // Try resolving via Python curl_cffi (Host-level Cloudflare Bypass)
  // This is required because newer channels have chatroom IDs that are millions of digits
  // apart from their broadcaster_user_id, making heuristic brute-force impossible.
  try {
    const { execSync } = require('child_process');
    const fs = require('fs');
    const path = require('path');

    const pyScript = `
import json
try:
    from curl_cffi import requests
    res = requests.get("https://kick.com/api/v2/channels/${username.toLowerCase()}", impersonate="chrome110", timeout=10)
    if res.status_code == 200:
        data = res.json()
        print(json.dumps({"chatroom_id": data.get("chatroom", {}).get("id")}))
    else:
        print(json.dumps({"error": "status " + str(res.status_code)}))
except Exception as e:
    print(json.dumps({"error": str(e)}))
`;
    const tempFile = path.join(process.cwd(), `.temp_kick_resolver_${Date.now()}.py`);
    fs.writeFileSync(tempFile, pyScript);

    const stdout = execSync(`python ${tempFile}`, { timeout: 15000 });
    fs.unlinkSync(tempFile); // Cleanup

    const result = JSON.parse(stdout.toString());
    if (result && result.chatroom_id) {
      chatroomId = String(result.chatroom_id);
      console.log(`[KickAuth] ✅ Resolved precise chatroomId via Python curl_cffi for '${username}': #${chatroomId}`);
    }
  } catch (e) {
    console.warn(`[KickAuth] ⚠️ Python curl_cffi bypass failed or unavailable. Falling back...`);
  }

  // Pure Node.js fallback (v2 fetch) - Usually blocked by Cloudflare
  if (!chatroomId || chatroomId === String(info?.channelId)) {
    try {
      const v2Res = await fetch(`https://kick.com/api/v2/channels/${username.toLowerCase()}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept": "application/json"
        }
      });
      if (v2Res.ok) {
        const v2Data = await v2Res.json();
        if (v2Data.chatroom?.id) {
          chatroomId = String(v2Data.chatroom.id);
          console.log(`[KickAuth] ✅ Resolved v2 API chatroomId for '${username}': #${chatroomId}`);
        }
      }
    } catch (e) { }
  }

  if (chatroomId) {
    console.log(`[KickAuth] ✅ Resolved chatroomId for '${username}': #${chatroomId}`);
    return {
      chatroomId,
      channelId: info?.channelId || Number(chatroomId) || 0,
      slug: info?.slug || username,
    };
  }

  console.warn(`[KickAuth] ⚠️ Could not resolve precise chatroomId for '${username}'. Returning channelId as fallback.`);
  return {
    chatroomId: String(info?.channelId || ""),
    channelId: info?.channelId || 0,
    slug: info?.slug || username,
  };
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
