export interface GeminiAnalysisResult {
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  vibe: string;
  questions: string[];
  highlights: {
    time: string;
    reason: string;
  }[];
  strategicTips: string[];
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function analyzeCommentsWithGemini(comments: string[]): Promise<GeminiAnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY environment variable. Please add it to your environment settings.");
  }

  const prompt = `
  You are an expert YouTube and Kick audience analyst. Analyze the following list of viewer messages/comments from a creator's stream or video and provide a structured review.
  
  Comments:
  ${comments.map((c, i) => `${i + 1}. "${c.replace(/"/g, '\\"')}"`).join("\n")}
  
  Provide:
  1. Sentiment split in percentages (positive, neutral, negative) summing up to 100%.
  2. A brief 1-sentence summary of the general channel vibe (the 'vibe' field).
  3. A list of the top 3-5 questions asked by viewers.
  4. Highlight moments or timestamps mentioned by users in their comments/chat (e.g., "03:42", "12:15") along with the reason why they liked or mentioned that moment. If no timestamps are found, generate 2-3 logical highlights based on what comments highlight as the best parts (e.g. "Intro", "Sound Test", "Ending").
  5. List 3 highly actionable strategic tips for the creator's next videos based on this audience feedback.

  Return your response STRICTLY as a valid JSON object matching the following schema. Return ONLY the raw JSON string:

  {
    "sentiment": {
      "positive": number,
      "neutral": number,
      "negative": number
    },
    "vibe": "string",
    "questions": ["string"],
    "highlights": [
      {
        "time": "string (e.g., MM:SS or HH:MM:SS)",
        "reason": "string"
      }
    ],
    "strategicTips": ["string"]
  }
  `;

  // Models to try in order of priority if Google experiences high demand (503)
  const models = ["gemini-3.5-flash", "gemini-2.0-flash"];
  let lastError: Error | null = null;

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // Retry loop (3 attempts with exponential backoff per model)
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        console.log(`[Gemini Call] Model: ${model}, Attempt: ${attempt}/3...`);
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" }
          })
        });

        if (response.status === 503 || response.status === 429) {
          console.warn(`Gemini returned ${response.status} high demand. Waiting ${attempt * 2}s before retry...`);
          await sleep(attempt * 2000);
          continue;
        }

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Gemini API returned error status ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!rawText) {
          throw new Error("Failed to retrieve text content from Gemini response");
        }

        // Robust JSON cleaner
        let cleanText = rawText.trim();
        if (cleanText.startsWith("```")) {
          cleanText = cleanText.replace(/^```(json)?\s*/i, "");
          cleanText = cleanText.replace(/\s*```$/, "");
        }

        const parsedData: GeminiAnalysisResult = JSON.parse(cleanText);
        return parsedData;
      } catch (err: any) {
        lastError = err;
        console.warn(`Attempt ${attempt} for model ${model} failed: ${err.message}`);
        await sleep(1500);
      }
    }
  }

  throw lastError || new Error("All Gemini model requests failed after retries.");
}
