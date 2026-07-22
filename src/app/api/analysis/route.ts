import { NextResponse } from "next/server";
import { getVideoDetailsAndComments } from "@/lib/youtube";
import {
  createAnalysisJob,
  getCreatorJobHistory,
  getDailyQuotaUsage,
  getJobById,
  getJobsCollection,
  updateAnalysisJobStatus
} from "@/lib/analysisJobs";
import { processAnalysisJob } from "@/lib/analyzerWorker";
import { getOfficialKickChannelInfo } from "@/lib/kick";
import { analyzeCommentsWithGemini } from "@/lib/gemini";

export const dynamic = "force-dynamic";

// GET /api/analysis?jobId=XYZ or ?creatorEmail=abc@gmail.com or ?kickChannel=8bitheadflicker
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");
  const creatorEmail = searchParams.get("creatorEmail");
  const kickChannel = searchParams.get("kickChannel");

  // Helper to fetch Kick Chatroom ID
  if (kickChannel) {
    try {
      // 1. Try Official Developer API first if KICK_CLIENT_ID is set
      const officialInfo = await getOfficialKickChannelInfo(kickChannel);
      if (officialInfo && officialInfo.chatroomId) {
        return NextResponse.json(officialInfo);
      }

      // 2. Fallback to public endpoints
      const channelUrl = `https://kick.com/api/v2/channels/${kickChannel.toLowerCase()}`;
      const res = await fetch(channelUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept": "application/json"
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.chatroom?.id) {
          return NextResponse.json({
            chatroomId: data.chatroom.id,
            isLive: !!data.livestream,
            username: data.user?.username || kickChannel
          });
        }
      }

      // Fallback v1
      const resV1 = await fetch(`https://kick.com/api/v1/channels/${kickChannel.toLowerCase()}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept": "application/json"
        }
      });
      if (resV1.ok) {
        const dataV1 = await resV1.json();
        if (dataV1.chatroom?.id) {
          return NextResponse.json({
            chatroomId: dataV1.chatroom.id,
            isLive: !!dataV1.livestream,
            username: dataV1.user?.username || kickChannel
          });
        }
      }

      return NextResponse.json({ error: `🛡️ Kick's Cloudflare firewall currently blocks resolving chatroom metadata for '${kickChannel}'. Please use YouTube video/stream links for Deep AI Analysis.` }, { status: 403 });
    } catch (err: any) {
      return NextResponse.json({ error: err.message || "Failed to resolve Kick chatroom" }, { status: 500 });
    }
  }

  if (jobId) {
    const job = await getJobById(jobId);
    if (!job) {
      return NextResponse.json({ error: "Analysis job not found" }, { status: 404 });
    }
    return NextResponse.json({ job });
  }

  if (creatorEmail) {
    const quotaUsed = await getDailyQuotaUsage(creatorEmail);
    const history = await getCreatorJobHistory(creatorEmail);
    return NextResponse.json({
      quotaUsed,
      maxDailyQuota: 2,
      remainingQuota: Math.max(0, 2 - quotaUsed),
      history
    });
  }

  return NextResponse.json({ error: "Missing jobId, creatorEmail, or kickChannel parameter" }, { status: 400 });
}

// DELETE /api/analysis?creatorEmail=abc@gmail.com (Dev reset quota helper)
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const creatorEmail = searchParams.get("creatorEmail");

  if (!creatorEmail) {
    return NextResponse.json({ error: "creatorEmail parameter required" }, { status: 400 });
  }

  try {
    const collection = await getJobsCollection();
    await collection.deleteMany({ creatorEmail });
    return NextResponse.json({ success: true, message: `Successfully reset daily quota for ${creatorEmail}` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to reset quota" }, { status: 500 });
  }
}

// POST /api/analysis (Queue a new analysis job)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { videoUrl, creatorEmail, platform, title, thumbnailUrl, videoId, comments } = body;

    const email = creatorEmail || "guest@creator.com";

    // 1. Enforce Daily Quota (Max 2 videos / day)
    const quotaUsed = await getDailyQuotaUsage(email);
    if (quotaUsed >= 2) {
      return NextResponse.json(
        {
          error: "Daily Quota Reached: You have reached your limit of 2 video analyses per 24 hours. Please click 'Reset Quota' or try again tomorrow!"
        },
        { status: 429 }
      );
    }

    let jobPlatform: "youtube" | "kick" = platform === "kick" ? "kick" : "youtube";
    let targetVideoId = videoId || "";
    let targetTitle = title || "Video Analysis";
    let targetThumbnail = thumbnailUrl || "";

    // 2. Parse YouTube details if platform is YouTube
    if (jobPlatform === "youtube") {
      if (!videoUrl) {
        return NextResponse.json({ error: "YouTube Video URL is required" }, { status: 400 });
      }

      try {
        const details = await getVideoDetailsAndComments(videoUrl);
        targetVideoId = details.videoId;
        targetTitle = details.title;
        targetThumbnail = details.thumbnailUrl;
      } catch (err: any) {
        return NextResponse.json({ error: err.message || "Invalid YouTube video link." }, { status: 400 });
      }
    }

    const uniqueJobId = `job_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 3. Create MongoDB Job Record
    const job = await createAnalysisJob({
      id: uniqueJobId,
      creatorEmail: email,
      platform: jobPlatform,
      videoId: targetVideoId,
      videoUrl: videoUrl || "",
      title: targetTitle,
      thumbnailUrl: targetThumbnail,
      status: "QUEUED",
      progressMessage: "Queued for timeline analysis..."
    });

    // 4. If comments array is provided directly (Live Kick stream evaluation), AWAIT Gemini execution directly!
    if (jobPlatform === "kick" && comments && Array.isArray(comments) && comments.length > 0) {
      try {
        await updateAnalysisJobStatus(uniqueJobId, {
          status: "ANALYZING",
          progressMessage: `Passing ${comments.length} Kick chat messages to Gemini 3.5 Flash...`
        });

        const result = await analyzeCommentsWithGemini(comments);

        await updateAnalysisJobStatus(uniqueJobId, {
          status: "COMPLETED",
          progressMessage: "Analysis Completed Successfully!",
          analysis: result
        });

        const finalCompletedJob = {
          ...job,
          status: "COMPLETED" as const,
          progressMessage: "Analysis Completed Successfully!",
          analysis: result
        };

        return NextResponse.json({
          success: true,
          jobId: uniqueJobId,
          job: finalCompletedJob,
          message: "Analysis completed successfully!",
          quotaRemaining: Math.max(0, 2 - (quotaUsed + 1))
        });
      } catch (err: any) {
        await updateAnalysisJobStatus(uniqueJobId, { status: "FAILED", error: err.message || "Kick processing failed" });
        return NextResponse.json({ error: err.message || "Kick evaluation failed" }, { status: 500 });
      }
    } else {
      // Async multi-page YouTube scraper worker
      processAnalysisJob(uniqueJobId).catch((err) => {
        console.error("Async worker background error:", err);
      });

      return NextResponse.json({
        success: true,
        jobId: uniqueJobId,
        message: "Analysis job queued! You can monitor live progress below.",
        quotaRemaining: Math.max(0, 2 - (quotaUsed + 1))
      });
    }
  } catch (error: any) {
    console.error("Queue API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to queue analysis job" }, { status: 500 });
  }
}
