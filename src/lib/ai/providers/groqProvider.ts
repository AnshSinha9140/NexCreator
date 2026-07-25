import { AIModelProvider } from "../providerInterface";
import { PromptPayload, RawLLMResponse } from "../types";
import { AI_CONFIG } from "../config";

export class GroqProvider implements AIModelProvider {
  private apiKey: string;
  private endpoint = "https://api.groq.com/openai/v1/chat/completions";

  constructor() {
    this.apiKey = process.env.GROQ_API_KEY || "";
  }

  async generateInsight(prompt: PromptPayload): Promise<RawLLMResponse> {
    if (!this.apiKey) {
      throw new Error("GROQ_API_KEY is not configured");
    }

    const maxAttempts = AI_CONFIG.MAX_RETRIES + 1; // Initial + retry once for transient failures
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const startTime = Date.now();
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), AI_CONFIG.TIMEOUT_MS);

      try {
        const response = await fetch(this.endpoint, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: AI_CONFIG.GROQ_MODEL,
            messages: [
              { role: "system", content: prompt.systemPrompt },
              { role: "user", content: prompt.userPrompt },
            ],
            temperature: 0.2,
            response_format: { type: "json_object" },
          }),
          signal: controller.signal,
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => response.statusText);
          throw new Error(`Groq API error ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        const latencyMs = Date.now() - startTime;

        const content = data?.choices?.[0]?.message?.content || "";
        if (!content) {
          throw new Error("Groq API returned empty content");
        }

        const tokensUsed = data?.usage?.total_tokens || this.estimateTokens(content);

        return {
          content,
          tokensUsed,
          provider: "groq",
          latencyMs,
        };
      } catch (err: any) {
        lastError = err;
        const isAbort = err.name === "AbortError";
        console.warn(`[GroqProvider] Attempt ${attempt}/${maxAttempts} failed: ${isAbort ? "Timeout (4s)" : err.message}`);
        
        if (attempt < maxAttempts) {
          // Short delay before single retry
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } finally {
        clearTimeout(timeoutId);
      }
    }

    throw lastError || new Error("GroqProvider failed after retries.");
  }

  async healthCheck(): Promise<boolean> {
    return !!this.apiKey;
  }

  estimateTokens(text: string): number {
    // Rough estimation: 1 token ~= 4 characters
    return Math.ceil((text || "").length / 4);
  }
}
