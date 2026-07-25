import { AIModelProvider } from "../providerInterface";
import { PromptPayload, RawLLMResponse } from "../types";
import { AI_CONFIG } from "../config";

export class GeminiProvider implements AIModelProvider {
  private apiKey: string;
  private endpoint: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || "";
    this.endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${AI_CONFIG.MODEL_VERSION}:generateContent?key=${this.apiKey}`;
  }

  async generateInsight(prompt: PromptPayload): Promise<RawLLMResponse> {
    if (!this.apiKey) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const startTime = Date.now();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.TIMEOUT_MS);

    try {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt.systemPrompt + "\n\n" + prompt.userPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const latencyMs = Date.now() - startTime;
      
      const content = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      // Token usage is approximate as Gemini REST might not always return exact tokens in standard response
      const tokensUsed = data?.usageMetadata?.totalTokenCount || this.estimateTokens(content);

      return {
        content,
        tokensUsed,
        provider: "gemini",
        latencyMs,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async healthCheck(): Promise<boolean> {
    return !!this.apiKey;
  }

  estimateTokens(text: string): number {
    // Rough estimation: 1 token ~= 4 characters in English
    return Math.ceil(text.length / 4);
  }
}
