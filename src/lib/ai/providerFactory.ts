import { AIModelProvider } from "./providerInterface";
import { GeminiProvider } from "./providers/geminiProvider";
import { GroqProvider } from "./providers/groqProvider";
import { AI_CONFIG } from "./config";

export interface ProviderDescriptor {
  provider: AIModelProvider;
  name: string;
  model: string;
}

export class AIProviderFactory {
  private static providerInstances: Map<string, AIModelProvider> = new Map();
  private static hasValidatedEnv = false;

  /**
   * Validates configured provider environment variables on startup.
   * Emits non-blocking diagnostic warnings if keys are missing.
   */
  public static validateEnvironment(): void {
    if (this.hasValidatedEnv) return;
    this.hasValidatedEnv = true;

    console.log(`[AIProviderFactory] Primary Provider: '${AI_CONFIG.PRIMARY_PROVIDER}' (${AI_CONFIG.GEMINI_MODEL})`);
    console.log(`[AIProviderFactory] Fallback Provider: '${AI_CONFIG.FALLBACK_PROVIDER}' (${AI_CONFIG.GROQ_MODEL})`);

    if (AI_CONFIG.PRIMARY_PROVIDER === "gemini" && !process.env.GEMINI_API_KEY) {
      console.warn("[AIProviderFactory] ⚠️ GEMINI_API_KEY is missing. Primary provider will fail over to fallback.");
    }

    if (AI_CONFIG.FALLBACK_PROVIDER === "groq" && !process.env.GROQ_API_KEY) {
      console.warn("[AIProviderFactory] ⚠️ GROQ_API_KEY is missing. Fallback will step down to Level 3 Rule Engine.");
    }
  }

  /**
   * Retrieves or instantiates an AIModelProvider by name.
   */
  public static getProvider(name: string): AIModelProvider {
    this.validateEnvironment();
    const key = name.toLowerCase();

    if (this.providerInstances.has(key)) {
      return this.providerInstances.get(key)!;
    }

    let instance: AIModelProvider;

    switch (key) {
      case "gemini":
        instance = new GeminiProvider();
        break;
      case "groq":
        instance = new GroqProvider();
        break;
      default:
        console.warn(`[AIProviderFactory] Unknown provider '${name}'. Defaulting to GeminiProvider.`);
        instance = new GeminiProvider();
        break;
    }

    this.providerInstances.set(key, instance);
    return instance;
  }

  /**
   * Gets primary provider descriptor (Name, Instance, Model).
   */
  public static getPrimaryProvider(): ProviderDescriptor {
    const name = AI_CONFIG.PRIMARY_PROVIDER;
    const provider = this.getProvider(name);
    const model = name === "gemini" ? AI_CONFIG.GEMINI_MODEL : AI_CONFIG.MODEL_VERSION;

    return { provider, name, model };
  }

  /**
   * Gets fallback provider descriptor (Name, Instance, Model).
   */
  public static getFallbackProvider(): ProviderDescriptor | null {
    const name = AI_CONFIG.FALLBACK_PROVIDER;
    if (!name || name === AI_CONFIG.PRIMARY_PROVIDER) return null;

    const provider = this.getProvider(name);
    const model = name === "groq" ? AI_CONFIG.GROQ_MODEL : AI_CONFIG.MODEL_VERSION;

    return { provider, name, model };
  }
}
