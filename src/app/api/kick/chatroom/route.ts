import { NextResponse } from "next/server";
import { getKickChatroomId, getOfficialKickChannelInfo } from "@/lib/kick";

export const dynamic = "force-dynamic";

/**
 * GET /api/kick/chatroom?slug=username
 *
 * Server-side proxy to resolve the real Kick chatroom.id for a given channel slug.
 *
 * Resolution priority:
 * 1. Python curl_cffi bypass → real chatroom.id from kick.com/api/v2 (most reliable)
 * 2. Official Kick API → broadcaster_user_id fallback (often wrong for newer channels)
 * 3. Returns null if unavailable
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = (searchParams.get("slug") || "").toLowerCase().trim();

  if (!slug) {
    return NextResponse.json({ success: false, error: "slug is required" }, { status: 400 });
  }

  try {
    // Method 1: Python curl_cffi bypass — resolves the real chatroom.id reliably
    const resolved = await getKickChatroomId(slug);
    if (resolved?.chatroomId) {
      return NextResponse.json({
        success: true,
        chatroomId: resolved.chatroomId,
        source: "curl_cffi_python",
      });
    }

    // Method 2: Official API broadcaster_user_id fallback (may be wrong for newer channels)
    const officialInfo = await getOfficialKickChannelInfo(slug);
    if (officialInfo?.channelId) {
      return NextResponse.json({
        success: true,
        chatroomId: String(officialInfo.channelId),
        source: "official_api_fallback",
      });
    }

    // No chatroom ID resolvable
    return NextResponse.json({
      success: false,
      chatroomId: null,
      error: "Could not resolve chatroom.id server-side.",
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Internal error" },
      { status: 500 }
    );
  }
}

