import { PromptPayload, RawLLMResponse } from "./types";

export interface AIModelProvider {
  generateInsight(prompt: PromptPayload): Promise<RawLLMResponse>;
  healthCheck(): Promise<boolean>;
  estimateTokens(text: string): number;
}
