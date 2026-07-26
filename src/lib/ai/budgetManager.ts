import clientPromise from "@/lib/mongodb";

export interface BudgetTelemetry {
  totalCallsToday: number;
  totalCallsHour: number;
  estimatedTokensToday: number;
  estimatedCostTodayUsd: number;
  callsByProvider: {
    gemini: number;
    groq: number;
    rule_engine: number;
  };
  skipsByReason: {
    low_importance: number;
    cooldown: number;
    similarity: number;
  };
  lastUpdated: string;
}

const COST_PER_1K_TOKENS: Record<string, number> = {
  gemini: 0.00015,
  groq: 0.0001,
  rule_engine: 0.0,
};

let inMemoryTelemetry: BudgetTelemetry = {
  totalCallsToday: 0,
  totalCallsHour: 0,
  estimatedTokensToday: 0,
  estimatedCostTodayUsd: 0,
  callsByProvider: { gemini: 0, groq: 0, rule_engine: 0 },
  skipsByReason: { low_importance: 0, cooldown: 0, similarity: 0 },
  lastUpdated: new Date().toISOString(),
};

let lastHourCheck = new Date().getHours();
let lastDayCheck = new Date().getDate();

export class AIBudgetManager {
  private static checkReset(): void {
    const now = new Date();
    const curHour = now.getHours();
    const curDay = now.getDate();

    if (curHour !== lastHourCheck) {
      inMemoryTelemetry.totalCallsHour = 0;
      lastHourCheck = curHour;
    }

    if (curDay !== lastDayCheck) {
      inMemoryTelemetry.totalCallsToday = 0;
      inMemoryTelemetry.estimatedTokensToday = 0;
      inMemoryTelemetry.estimatedCostTodayUsd = 0;
      inMemoryTelemetry.callsByProvider = { gemini: 0, groq: 0, rule_engine: 0 };
      inMemoryTelemetry.skipsByReason = { low_importance: 0, cooldown: 0, similarity: 0 };
      lastDayCheck = curDay;
    }

    inMemoryTelemetry.lastUpdated = now.toISOString();
  }

  /**
   * Records an AI call attempt (LLM or Rule Engine) and updates budget telemetry
   */
  static async recordCall(
    provider: "gemini" | "groq" | "rule_engine",
    estimatedTokens: number = 500
  ): Promise<void> {
    this.checkReset();

    const provKey = provider.toLowerCase().includes("gemini")
      ? "gemini"
      : provider.toLowerCase().includes("groq")
      ? "groq"
      : "rule_engine";

    if (provKey !== "rule_engine") {
      inMemoryTelemetry.totalCallsToday += 1;
      inMemoryTelemetry.totalCallsHour += 1;
      inMemoryTelemetry.estimatedTokensToday += estimatedTokens;

      const rate = COST_PER_1K_TOKENS[provKey] || 0.00015;
      const cost = (estimatedTokens / 1000) * rate;
      inMemoryTelemetry.estimatedCostTodayUsd += cost;
    }

    inMemoryTelemetry.callsByProvider[provKey] = (inMemoryTelemetry.callsByProvider[provKey] || 0) + 1;
    inMemoryTelemetry.lastUpdated = new Date().toISOString();

    // Asynchronously persist snapshot telemetry to DB (non-blocking)
    try {
      const client = await clientPromise;
      const db = client.db(process.env.MONGODB_DB_NAME || "nexcreator");
      await db.collection("ai_budget_telemetry").updateOne(
        { date: new Date().toISOString().split("T")[0] },
        {
          $inc: {
            totalCallsToday: provKey !== "rule_engine" ? 1 : 0,
            estimatedTokensToday: provKey !== "rule_engine" ? estimatedTokens : 0,
            estimatedCostTodayUsd: provKey !== "rule_engine" ? (estimatedTokens / 1000) * (COST_PER_1K_TOKENS[provKey] || 0.00015) : 0,
            [`callsByProvider.${provKey}`]: 1,
          },
          $set: { lastUpdated: new Date().toISOString() },
        },
        { upsert: true }
      );
    } catch (e) {
      // Non-blocking telemetry error
    }
  }

  /**
   * Records a skipped evaluation reason (low_importance, cooldown, similarity)
   */
  static recordSkip(reason: "low_importance" | "cooldown" | "similarity"): void {
    this.checkReset();
    inMemoryTelemetry.skipsByReason[reason] = (inMemoryTelemetry.skipsByReason[reason] || 0) + 1;
  }

  /**
   * Returns current budget telemetry snapshot
   */
  static getTelemetry(): BudgetTelemetry {
    this.checkReset();
    return { ...inMemoryTelemetry };
  }
}
