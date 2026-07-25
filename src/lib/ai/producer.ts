import { PulseSnapshot } from "@/lib/snapshot/types";
import { AI_CONFIG } from "./config";
import { DecisionEngine } from "./decisionEngine";
import { AICache } from "./cache";
import { PromptBuilder } from "./promptBuilder";
import { AIProviderFactory } from "./providerFactory";
import { AIResponseParser } from "./parser";
import { AIObservability } from "./telemetry";
import { AIInsight } from "./types";
import clientPromise from "@/lib/mongodb";
import { v4 as uuidv4 } from "uuid";
import { DiagnosticsLogger } from "@/lib/diagnostics/logger";
import { DiagnosticsState } from "@/lib/diagnostics/state";

export class AIProducer {
  static async processSnapshot(
    currentSnapshot: PulseSnapshot
  ): Promise<void> {
    try {
      if (!AI_CONFIG.ENABLED) {
        return;
      }

      AIObservability.recordRequest();

      const sessionId = currentSnapshot.sessionId;

      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB_NAME || "nexcreator");
      const insightsCollection = db.collection("ai_insights");

      // 1. Get previous insights for decision context
      const previousInsightArray = await insightsCollection
        .find({ sessionId })
        .sort({ createdAt: -1 })
        .limit(3)
        .toArray();

      const previousInsights = previousInsightArray as unknown as AIInsight[];

      // 2. Fetch previous snapshot for Decision Engine MPM delta
      const snapshotsCollection = db.collection("pulse_snapshots");
      const recentSnapshots = await snapshotsCollection
        .find({ sessionId })
        .sort({ windowEnd: -1 })
        .skip(1)
        .limit(1)
        .toArray();

      const previousSnapshot = recentSnapshots.length > 0 ? (recentSnapshots[0] as unknown as PulseSnapshot) : null;

      // 3. Consult Decision Engine
      const decision = DecisionEngine.evaluate(currentSnapshot, previousSnapshot);
      if (!decision.analyze) {
        AIObservability.recordSkip();
        return;
      }

      // 4. Check Cache
      const cachedInsight = AICache.get(sessionId, currentSnapshot);
      if (cachedInsight) {
        AIObservability.recordCacheHit();
        return;
      }

      // 5. Build Prompt
      const prompt = PromptBuilder.buildPrompt(currentSnapshot, previousInsights);

      // 6. MULTI-PROVIDER FAILOVER CHAIN
      let insightData: Omit<AIInsight, "id" | "createdAt" | "snapshotVersion" | "sourceModel" | "modelVersion" | "promptVersion" | "provider" | "model" | "fallbackUsed"> | null = null;
      let usedProvider = "rule_engine";
      let usedModel = "rule-based-v1";
      let fallbackUsed = false;
      let currentLatency = 0;

      // ── Level 1: Primary Provider (Gemini) ──
      const primary = AIProviderFactory.getPrimaryProvider();
      try {
        AIObservability.recordProviderRequest(primary.name);
        console.log(`[AIProducer] Attempting Primary Provider: '${primary.name}' (${primary.model})...`);
        const rawResponse = await primary.provider.generateInsight(prompt);

        // Strict JSON Parse
        insightData = AIResponseParser.parseRawContent(rawResponse.content, currentSnapshot);
        usedProvider = primary.name;
        usedModel = primary.model;
        fallbackUsed = false;
        currentLatency = rawResponse.latencyMs;
        AIObservability.recordLatency(rawResponse.latencyMs);

        console.log(`[AIProducer] ✅ Provider: ${primary.name} | Status: Success | Latency: ${rawResponse.latencyMs}ms | FallbackUsed: false`);
      } catch (primaryErr: any) {
        AIObservability.recordProviderFailure(primary.name);
        if (primaryErr.message?.includes("429")) {
          AIObservability.recordQuotaFailure();
        }
        console.warn(`[AIProducer] ⚠️ Primary provider '${primary.name}' failed (${primaryErr.message}). Switching to fallback provider...`);

        // ── Level 2: Fallback Provider (Groq) ──
        const fallback = AIProviderFactory.getFallbackProvider();
        if (fallback) {
          try {
            AIObservability.recordProviderSwitch();
            AIObservability.recordProviderRequest(fallback.name);
            console.log(`[AIProducer] Attempting Fallback Provider: '${fallback.name}' (${fallback.model})...`);
            const rawResponse = await fallback.provider.generateInsight(prompt);

            // Strict JSON Parse
            insightData = AIResponseParser.parseRawContent(rawResponse.content, currentSnapshot);
            usedProvider = fallback.name;
            usedModel = fallback.model;
            fallbackUsed = true;
            currentLatency = rawResponse.latencyMs;
            AIObservability.recordLatency(rawResponse.latencyMs);

            console.log(`[AIProducer] ✅ Provider: ${fallback.name} | Status: Success | Latency: ${rawResponse.latencyMs}ms | FallbackUsed: true`);
          } catch (fallbackErr: any) {
            AIObservability.recordProviderFailure(fallback.name);
            console.warn(`[AIProducer] ⚠️ Fallback provider '${fallback.name}' failed (${fallbackErr.message}). Falling back to Level 3 Rule Engine...`);
          }
        }
      }

      // ── Level 3: Existing Rule-Based Insight Generator ──
      if (!insightData) {
        AIObservability.recordRuleEngineActivation();
        console.log("[AIProducer] ⚠️ Generating Level 3 Rule-Based Insight...");
        insightData = AIResponseParser.generateFallbackInsight(currentSnapshot);
        usedProvider = "rule_engine";
        usedModel = "rule-based-v1";
        fallbackUsed = true;
      }

      // 7. Construct Final Insight Entity
      const finalInsight: AIInsight = {
        ...insightData,
        id: uuidv4(),
        sourceModel: usedProvider,
        modelVersion: usedModel,
        promptVersion: AI_CONFIG.PROMPT_VERSION,
        snapshotVersion: currentSnapshot.snapshotVersion || 1,
        createdAt: new Date().toISOString(),
        provider: usedProvider,
        model: usedModel,
        fallbackUsed,
      };

      // 8. Cache & Store Result in Database
      AICache.set(sessionId, currentSnapshot, finalInsight);
      await insightsCollection.insertOne(finalInsight);

      console.log(`[AIProducer] Persisted insight '${finalInsight.type}' for session '${sessionId}' [Provider: ${usedProvider}, Model: ${usedModel}, FallbackUsed: ${fallbackUsed}]`);
      
      const state = DiagnosticsState.getState();
      DiagnosticsLogger.log("AIProducer", "Persist", `Persisted insight '${finalInsight.type}' using provider ${usedProvider}`);
      DiagnosticsState.updateSubsystem("ai", {
        status: "healthy",
        lastSuccess: new Date().toISOString(),
        provider: usedProvider,
        fallback: fallbackUsed,
        lastInsight: finalInsight.id,
        aiRuns: (state.ai.aiRuns || 0) + 1,
        totalLatency: (state.ai.totalLatency || 0) + currentLatency,
        geminiCalls: (state.ai.geminiCalls || 0) + (usedProvider.toLowerCase().includes("gemini") ? 1 : 0),
        groqCalls: (state.ai.groqCalls || 0) + (usedProvider.toLowerCase().includes("groq") ? 1 : 0),
        ruleEngineCalls: (state.ai.ruleEngineCalls || 0) + (usedProvider.toLowerCase().includes("rule") ? 1 : 0),
        fallbackCount: (state.ai.fallbackCount || 0) + (fallbackUsed ? 1 : 0),
      });
    } catch (error: any) {
      // 100% Failure isolation - never throw back to snapshot engine or disrupt monitoring
      console.error("[AIProducer] Unhandled error in processing snapshot:", error);
      DiagnosticsLogger.error("AIProducer", "ProcessSnapshot", "Unhandled error in processing snapshot", error.message);
      DiagnosticsState.updateSubsystem("ai", { status: "failed", lastFailure: new Date().toISOString(), lastError: error.message });
    }
  }
}
