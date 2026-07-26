import { PulseSnapshot } from "@/lib/snapshot/types";
import { AI_CONFIG } from "./config";
import { DecisionEngine } from "./decisionEngine";
import { AICache } from "./cache";
import { PromptBuilder } from "./promptBuilder";
import { AIProviderFactory } from "./providerFactory";
import { AIResponseParser } from "./parser";
import { AIObservability } from "./telemetry";
import { AIInsight } from "./types";
import { AIBudgetManager } from "./budgetManager";
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

      // 2. Fetch previous snapshot for Decision Engine delta
      const snapshotsCollection = db.collection("pulse_snapshots");
      const recentSnapshots = await snapshotsCollection
        .find({ sessionId })
        .sort({ windowEnd: -1 })
        .skip(1)
        .limit(1)
        .toArray();

      const previousSnapshot = recentSnapshots.length > 0 ? (recentSnapshots[0] as unknown as PulseSnapshot) : null;

      // 3. Consult Event-Driven Decision Engine
      const decision = DecisionEngine.evaluate(currentSnapshot, previousSnapshot);

      // Route: IGNORE
      if (!decision.analyze || decision.routingPath === "ignore") {
        AIObservability.recordSkip();
        AIBudgetManager.recordSkip(decision.reason?.includes("similarity") ? "similarity" : "low_importance");
        console.log(`[AIProducer] ⏭ Skipped snapshot processing (${decision.reason})`);
        return;
      }

      // 4. Check Cache
      const cachedInsight = AICache.get(sessionId, currentSnapshot);
      if (cachedInsight) {
        AIObservability.recordCacheHit();
        AIBudgetManager.recordSkip("similarity");
        return;
      }

      let insightData: Omit<AIInsight, "id" | "createdAt" | "snapshotVersion" | "sourceModel" | "modelVersion" | "promptVersion" | "provider" | "model" | "fallbackUsed"> | null = null;
      let usedProvider = "rule_engine";
      let usedModel = "rule-based-v1";
      let fallbackUsed = false;
      let currentLatency = 0;
      let sourceBadge: "instant_rule" | "ai_analysis" | "pattern_learned" = "instant_rule";

      // ── Route: RULE ENGINE (Deterministic 0-Cost Path) ──
      if (decision.routingPath === "rule_engine") {
        console.log(`[AIProducer] ⚡ Deterministic Rule Engine path activated (${decision.reason})`);
        insightData = AIResponseParser.generateFallbackInsight(currentSnapshot, decision.events || []);
        usedProvider = "rule_engine";
        usedModel = "rule-based-v1";
        fallbackUsed = false;
        sourceBadge = "instant_rule";
        AIObservability.recordRuleEngineActivation();
        await AIBudgetManager.recordCall("rule_engine", 0);
      } else {
        // ── Route: LLM ESCALATION (Gemini / Groq) ──
        const prompt = PromptBuilder.buildPrompt(currentSnapshot, previousInsights);
        const primary = AIProviderFactory.getPrimaryProvider();

        try {
          AIObservability.recordProviderRequest(primary.name);
          console.log(`[AIProducer] 🧠 Escalating to Primary LLM: '${primary.name}' (${primary.model})...`);
          const rawResponse = await primary.provider.generateInsight(prompt);

          insightData = AIResponseParser.parseRawContent(rawResponse.content, currentSnapshot);
          usedProvider = primary.name;
          usedModel = primary.model;
          fallbackUsed = false;
          currentLatency = rawResponse.latencyMs;
          sourceBadge = "ai_analysis";
          AIObservability.recordLatency(rawResponse.latencyMs);
          await AIBudgetManager.recordCall("gemini", rawResponse.tokensUsed || 500);

          console.log(`[AIProducer] ✅ Provider: ${primary.name} | Latency: ${rawResponse.latencyMs}ms`);
        } catch (primaryErr: any) {
          AIObservability.recordProviderFailure(primary.name);
          console.warn(`[AIProducer] ⚠️ Primary LLM '${primary.name}' failed (${primaryErr.message}). Attempting fallback...`);

          const fallback = AIProviderFactory.getFallbackProvider();
          if (fallback) {
            try {
              AIObservability.recordProviderSwitch();
              AIObservability.recordProviderRequest(fallback.name);
              const rawResponse = await fallback.provider.generateInsight(prompt);

              insightData = AIResponseParser.parseRawContent(rawResponse.content, currentSnapshot);
              usedProvider = fallback.name;
              usedModel = fallback.model;
              fallbackUsed = true;
              currentLatency = rawResponse.latencyMs;
              sourceBadge = "ai_analysis";
              AIObservability.recordLatency(rawResponse.latencyMs);
              await AIBudgetManager.recordCall("groq", rawResponse.tokensUsed || 500);

              console.log(`[AIProducer] ✅ Provider: ${fallback.name} | Latency: ${rawResponse.latencyMs}ms | Fallback: true`);
            } catch (fallbackErr: any) {
              AIObservability.recordProviderFailure(fallback.name);
            }
          }
        }

        // Fallback to Rule Engine if all LLMs fail
        if (!insightData) {
          AIObservability.recordRuleEngineActivation();
          console.log("[AIProducer] ⚠️ All LLM providers failed, generating Rule-Based Insight...");
          insightData = AIResponseParser.generateFallbackInsight(currentSnapshot, decision.events || []);
          usedProvider = "rule_engine";
          usedModel = "rule-based-v1";
          fallbackUsed = true;
          sourceBadge = "instant_rule";
          await AIBudgetManager.recordCall("rule_engine", 0);
        }
      }

      // Construct Final Insight Entity
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
        sourceBadge: sourceBadge || insightData.sourceBadge || "instant_rule",
        importanceScore: decision.importanceScore || 50,
      };

      // Cache & Store Result in Database
      AICache.set(sessionId, currentSnapshot, finalInsight);
      await insightsCollection.insertOne(finalInsight);

      console.log(`[AIProducer] Persisted insight '${finalInsight.type}' for session '${sessionId}' [Badge: ${finalInsight.sourceBadge}, Provider: ${usedProvider}]`);

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
      console.error("[AIProducer] Unhandled error in processing snapshot:", error);
      DiagnosticsLogger.error("AIProducer", "ProcessSnapshot", "Unhandled error in processing snapshot", error.message);
      DiagnosticsState.updateSubsystem("ai", { status: "failed", lastFailure: new Date().toISOString(), lastError: error.message });
    }
  }
}
