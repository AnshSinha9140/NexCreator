import { getJobById, updateAnalysisJobStatus } from "./analysisJobs";
import { analyzeCommentsWithGemini, GeminiAnalysisResult } from "./gemini";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Helper to format milliseconds to HH:MM:SS
function formatMsToTime(totalMs: number): string {
  const totalSeconds = Math.floor(totalMs / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h > 0 ? h.toString().padStart(2, '0') + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

// Scrape YouTube Chat Replay at specific time offset (playerOffsetMs)
async function scrapeYoutubeChatChunk(
  videoId: string,
  innertubeKey: string,
  initialToken: string,
  offsetMs: number,
  pagesToScrape = 5
): Promise<string[]> {
  const messages: string[] = [];
  let currentToken: string | null = initialToken;
  let currentPage = 1;

  while (currentToken && currentPage <= pagesToScrape) {
    try {
      const chatUrl = `https://www.youtube.com/youtubei/v1/live_chat/get_live_chat_replay?key=${innertubeKey}`;
      const res: Response = await fetch(chatUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: {
            client: {
              clientName: "WEB",
              clientVersion: "2.20240101.01.00"
            }
          },
          continuation: currentToken,
          playerOffsetMs: offsetMs.toString()
        })
      });

      if (!res.ok) break;
      const data: any = await res.json();
      const actions = data.continuationContents?.liveChatContinuation?.actions || [];

      if (actions.length === 0) break;

      for (const act of actions) {
        const chatItemAction = act.replayChatItemAction?.actions?.[0];
        const textRenderer = chatItemAction?.addChatItemAction?.item?.liveChatTextMessageRenderer || 
                             chatItemAction?.addChatItemAction?.item?.liveChatPaidMessageRenderer;
        
        if (textRenderer) {
          const author = textRenderer.authorName?.simpleText || "User";
          const timestamp = textRenderer.timestampText?.simpleText || formatMsToTime(offsetMs);
          const messageText = textRenderer.message?.runs?.map((r: any) => r.text || "").join("") || "";
          
          if (messageText.trim()) {
            messages.push(`${author} [${timestamp}]: ${messageText}`);
          }
        }
      }

      const continuations = data.continuationContents?.liveChatContinuation?.continuations;
      if (continuations && continuations.length > 0) {
        const nextCont = continuations[0];
        currentToken = nextCont?.liveChatReplayContinuationData?.continuation || 
                       nextCont?.reloadContinuationData?.continuation || 
                       null;
      } else {
        currentToken = null;
      }

      currentPage++;
      await sleep(150);
    } catch (err) {
      console.warn("Chunk scrape page error:", err);
      break;
    }
  }

  return messages;
}

// Master Synthesis Engine (Reduce phase) - Returns ALL detected clips without dropping any!
async function synthesizeMasterReport(chunkReports: { label: string; report: GeminiAnalysisResult }[]): Promise<GeminiAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("Missing GEMINI_API_KEY");

  const prompt = `
  You are an expert lead stream analyst. Below are chunked timeline analysis reports generated from different hours of an 11-hour live stream broadcast.
  
  Chunk Mini-Reports:
  ${chunkReports.map((c, i) => `=== TIMELINE CHUNK ${i + 1} (${c.label}) ===
  Vibe: ${c.report.vibe}
  Sentiment: Positive ${c.report.sentiment.positive}%, Neutral ${c.report.sentiment.neutral}%, Negative ${c.report.sentiment.negative}%
  Highlights: ${JSON.stringify(c.report.highlights)}
  Questions: ${JSON.stringify(c.report.questions)}
  Tips: ${JSON.stringify(c.report.strategicTips)}
  `).join("\n\n")}

  Synthesize these chunk reports into ONE MASTER STREAM ANALYSIS REPORT covering the ENTIRE 11-hour broadcast:
  1. Calculate the overall weighted sentiment percentages across all chunks (positive, neutral, negative summing to 100%).
  2. Write a 1-2 sentence overall master vibe capturing the stream's full journey.
  3. Include ALL valid highlight timestamps discovered across ALL timeline chunks chronologically from start to end of the stream. Do NOT limit or drop valid clips! Ensure timestamp strings use accurate HH:MM:SS format corresponding to the stream hour (e.g. '01:24:10', '03:45:00', '08:12:30').
  4. Write short, accurate clip titles describing the exact audience reaction or moment (e.g. '🔥 Hype Peak: Chat spamming W and 🔥', '😂 Comedy Laughter Spike: Viewer reactions', '🎬 Story Discussion').
  5. Consolidate the top 4-5 recurring audience questions asked throughout the broadcast.
  6. Provide 3 high-level actionable strategic tips for the creator's future broadcasts.

  Return your response STRICTLY as a valid JSON object matching this schema:
  {
    "sentiment": { "positive": number, "neutral": number, "negative": number },
    "vibe": "string",
    "questions": ["string"],
    "highlights": [ { "time": "string (e.g. HH:MM:SS or MM:SS)", "reason": "string" } ],
    "strategicTips": ["string"]
  }
  `;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json" }
    })
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Master Synthesis failed with status ${res.status}: ${errorText}`);
  }

  const data = await res.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error("Empty text returned from Master Synthesis");

  let cleanText = rawText.trim();
  if (cleanText.startsWith("```")) {
    cleanText = cleanText.replace(/^```(json)?\s*/i, "");
    cleanText = cleanText.replace(/\s*```$/, "");
  }

  return JSON.parse(cleanText);
}

export async function processAnalysisJob(jobId: string) {
  const job = await getJobById(jobId);
  if (!job) return;

  try {
    await updateAnalysisJobStatus(jobId, {
      status: "SCRAPING",
      progressMessage: "Connecting to stream watch page..."
    });

    if (job.platform === "youtube") {
      const watchUrl = `https://www.youtube.com/watch?v=${job.videoId}`;
      const resHtml = await fetch(watchUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
      });

      if (!resHtml.ok) throw new Error("Failed to load YouTube watch page");
      const html = await resHtml.text();

      const apiKeyMatch = html.match(/"INNERTUBE_API_KEY"\s*:\s*"([^"]+)"/);
      const innertubeKey = apiKeyMatch ? apiKeyMatch[1] : "";
      const ytDataMatch = html.match(/ytInitialData\s*=\s*({.+?});\s*<\/script>/);

      let initialToken: string | null = null;

      if (ytDataMatch) {
        try {
          const data = JSON.parse(ytDataMatch[1]);
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
            initialToken = cont?.reloadContinuationData?.continuation || 
                           cont?.liveChatReplayContinuationRenderer?.continuation || 
                           null;
          }
        } catch (err) {
          console.warn("Failed to parse ytInitialData JSON:", err);
        }
      }

      // If YouTube has chat replay continuation tokens: Run 6-Chunk Pipeline across 11 Hours!
      if (initialToken && innertubeKey) {
        // Timeline offsets for 6 chunks across an 11-hour stream
        const chunkOffsets = [
          { label: "Hours 0–2", offsetMs: 0 },
          { label: "Hours 2–4", offsetMs: 2 * 60 * 60 * 1000 },
          { label: "Hours 4–6", offsetMs: 4 * 60 * 60 * 1000 },
          { label: "Hours 6–8", offsetMs: 6 * 60 * 60 * 1000 },
          { label: "Hours 8–10", offsetMs: 8 * 60 * 60 * 1000 },
          { label: "Hours 10–11+", offsetMs: 10 * 60 * 60 * 1000 }
        ];

        const chunkReports: { label: string; report: GeminiAnalysisResult }[] = [];

        for (let i = 0; i < chunkOffsets.length; i++) {
          const chunk = chunkOffsets[i];
          
          await updateAnalysisJobStatus(jobId, {
            status: "SCRAPING",
            progressMessage: `Analyzing timeline ${chunk.label}... (Chunk ${i + 1} of ${chunkOffsets.length})`
          });

          // Scrape chat replay for this timeline segment
          const chunkMessages = await scrapeYoutubeChatChunk(job.videoId, innertubeKey, initialToken, chunk.offsetMs, 5);

          if (chunkMessages.length > 0) {
            await updateAnalysisJobStatus(jobId, {
              status: "ANALYZING",
              progressMessage: `Gemini 3.5 Flash evaluating ${chunk.label} (${chunkMessages.length} chat logs)...`
            });

            try {
              const chunkResult = await analyzeCommentsWithGemini(chunkMessages);
              chunkReports.push({ label: chunk.label, report: chunkResult });
            } catch (err) {
              console.warn(`Chunk ${chunk.label} Gemini evaluation warning:`, err);
            }
          }

          await sleep(1000); // polite pause between chunks
        }

        // If we collected chunk reports, run Master Synthesis!
        if (chunkReports.length > 0) {
          await updateAnalysisJobStatus(jobId, {
            status: "ANALYZING",
            progressMessage: "Synthesizing Master 11-Hour Report with Gemini 3.5 Flash..."
          });

          const masterReport = await synthesizeMasterReport(chunkReports);

          await updateAnalysisJobStatus(jobId, {
            status: "COMPLETED",
            progressMessage: "Analysis Completed Successfully!",
            analysis: masterReport
          });
          return;
        }
      }

      // Fallback: Query standard commentThreads endpoint if stream chat replay is unavailable
      await updateAnalysisJobStatus(jobId, {
        status: "SCRAPING",
        progressMessage: "Live chat replay unavailable. Fetching regular video comment threads..."
      });

      const apiKey = process.env.YOUTUBE_API_KEY;
      if (apiKey) {
        const commentsUrl = `https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&maxResults=100&videoId=${job.videoId}&key=${apiKey}`;
        const res = await fetch(commentsUrl);
        const data = await res.json();
        let fallbackComments: string[] = [];
        if (data.items) {
          fallbackComments = data.items.map((i: any) => i.snippet.topLevelComment.snippet.textOriginal || i.snippet.topLevelComment.snippet.textDisplay || "");
        }

        if (fallbackComments.length > 0) {
          await updateAnalysisJobStatus(jobId, {
            status: "ANALYZING",
            progressMessage: "Gemini 3.5 Flash analyzing comment threads..."
          });

          const report = await analyzeCommentsWithGemini(fallbackComments);
          await updateAnalysisJobStatus(jobId, {
            status: "COMPLETED",
            progressMessage: "Analysis Completed Successfully!",
            analysis: report
          });
          return;
        }
      }
    }

    await updateAnalysisJobStatus(jobId, {
      status: "FAILED",
      error: "Could not retrieve chat logs or comments for this video."
    });
  } catch (err: any) {
    console.error(`Error processing job ${jobId}:`, err);
    await updateAnalysisJobStatus(jobId, {
      status: "FAILED",
      error: err.message || "An unexpected error occurred during analysis."
    });
  }
}
