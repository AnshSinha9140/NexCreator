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

  // 1. Try Gemini Models first
  const GEMINI_MODELS = [
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
  ];
  let lastError: Error | null = null;

  if (apiKey) {
    for (const model of GEMINI_MODELS) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`[AI Analysis] Gemini Model: ${model}, Attempt: ${attempt}/3...`);
          const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { responseMimeType: "application/json" }
            })
          });

          if (response.status === 503 || response.status === 429) {
            const waitTime = attempt * 2000;
            console.warn(`[AI Analysis] Gemini ${model} returned ${response.status}. Waiting ${attempt * 2}s...`);
            await sleep(waitTime);
            continue;
          }

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API returned error status ${response.status}: ${errorText}`);
          }

          const result = await response.json();
          const rawText = result.candidates?.[0]?.content?.parts?.[0]?.text;
          if (!rawText) throw new Error("Empty text in Gemini response");

          return parseAndCleanJSON(rawText);
        } catch (err: any) {
          lastError = err;
          console.warn(`[AI Analysis] Attempt ${attempt} for Gemini ${model} failed: ${err.message}`);
          await sleep(1000);
        }
      }
    }
  }

  // 2. Fallback to Groq (llama-3.3-70b-versatile or llama-3.1-8b-instant)
  const groqApiKey = process.env.GROQ_API_KEY;
  if (groqApiKey) {
    console.log(`[AI Analysis] 🔄 Falling back to Groq AI provider...`);
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${groqApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
          response_format: { type: "json_object" }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const rawContent = data?.choices?.[0]?.message?.content;
        if (rawContent) {
          console.log(`[AI Analysis] ✅ Groq AI analysis succeeded!`);
          return parseAndCleanJSON(rawContent);
        }
      } else {
        const errorText = await response.text();
        console.warn(`[AI Analysis] Groq API failed with status ${response.status}: ${errorText}`);
      }
    } catch (err: any) {
      console.warn(`[AI Analysis] Groq fallback error:`, err.message);
      lastError = err;
    }
  }

  // 3. Fallback to Cerebras AI (llama3.1-8b or llama3.1-70b)
  const cerebrasApiKey = process.env.CEREBRAS_API_KEY;
  if (cerebrasApiKey) {
    console.log(`[AI Analysis] 🔄 Falling back to Cerebras AI provider...`);
    try {
      const response = await fetch("https://api.cerebras.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${cerebrasApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama3.1-8b",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
          response_format: { type: "json_object" }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const rawContent = data?.choices?.[0]?.message?.content;
        if (rawContent) {
          console.log(`[AI Analysis] ✅ Cerebras AI analysis succeeded!`);
          return parseAndCleanJSON(rawContent);
        }
      } else {
        const errorText = await response.text();
        console.warn(`[AI Analysis] Cerebras API failed with status ${response.status}: ${errorText}`);
      }
    } catch (err: any) {
      console.warn(`[AI Analysis] Cerebras fallback error:`, err.message);
      lastError = err;
    }
  }

  throw lastError || new Error("All AI Providers (Gemini, Groq, Cerebras) failed after retries.");
}

function parseAndCleanJSON(rawText: string): GeminiAnalysisResult {
  let cleanText = rawText.trim();
  if (cleanText.startsWith("```")) {
    cleanText = cleanText.replace(/^```(json)?\s*/i, "");
    cleanText = cleanText.replace(/\s*```$/, "");
  }
  return JSON.parse(cleanText);
}
