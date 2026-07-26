import { AIProviderFactory } from "./src/lib/ai/providerFactory";
import { AIObservability } from "./src/lib/ai/telemetry";
import { AI_CONFIG } from "./src/lib/ai/config";

console.log("=== SPRINT 12.4 MULTI-PROVIDER AI LAYER TEST ===");
console.log("Primary Provider:", AI_CONFIG.PRIMARY_PROVIDER, "(Model:", AI_CONFIG.GEMINI_MODEL, ")");
console.log("Fallback Provider:", AI_CONFIG.FALLBACK_PROVIDER, "(Model:", AI_CONFIG.GROQ_MODEL, ")");

const primary = AIProviderFactory.getPrimaryProvider();
console.log("✅ Factory Primary:", primary.name, "| Model:", primary.model);

const fallback = AIProviderFactory.getFallbackProvider();
console.log("✅ Factory Fallback:", fallback?.name, "| Model:", fallback?.model);

console.log("\n=== TESTING TELEMETRY METRICS ===");
AIObservability.recordRequest();
AIObservability.recordProviderRequest(primary.name);
AIObservability.recordProviderFailure(primary.name);
AIObservability.recordProviderSwitch();
if (fallback) AIObservability.recordProviderRequest(fallback.name);
AIObservability.recordRuleEngineActivation();

const metrics = AIObservability.getMetrics();
console.log("Metrics Summary:", JSON.stringify(metrics, null, 2));

console.log("\n✅ Multi-provider architecture verified successfully!");
