# AI Producer Foundation Architecture Implementation Plan (Sprint 12)

This plan outlines the implementation of the production-ready **AI Producer Engine** in NexCreator. The engine serves as a decoupled, platform-agnostic infrastructure layer consuming normalized `PulseSnapshot` documents and outputting structured `AIInsight` records to MongoDB.

---

## User Review Required

> [!IMPORTANT]
> **Strict Failure Isolation**: AI operations run asynchronously in background boundaries. Gemini API timeouts, rate-limits, or quota errors will **NEVER** interrupt chat ingestion, stream monitoring, or snapshot persistence.
> **Platform Neutrality**: The AI Producer contains 0 Kick-specific or YouTube-specific business logic. It consumes only normalized `PulseSnapshot` documents.
> **100% Free Tier Optimized**: Combines the Decision Engine, Prompt Hash Cache, and Rule-Based Fallback Generator to keep Gemini API calls under **3 requests/hour**, using less than 2% of the Gemini Free Tier quota.
> **No UI / No Frontend Work**: This sprint creates backend services, model abstractions, caching, and database endpoints only.

---

## Open Questions

None. The architectural specifications, provider interfaces, decision thresholds, and fallback rules are fully defined.

---

## Proposed Changes & File Architecture

### 1. Centralized AI Configuration & Model Types
#### `[NEW]` [types.ts](file:///c:/Users/anshs/.gemini/antigravity-ide/scratch/creator-manager/src/lib/ai/types.ts)
- Define `AIInsight`, `AIInsightType`, `AIInsightSeverity`, `PromptPayload`, `RawLLMResponse`, `DecisionResult`, and `AITelemetry` models:
```typescript
export type AIInsightType =
  | "retention_alert"
  | "engagement_opportunity"
  | "content_recommendation"
  | "pacing_advice"
  | "stream_summary";

export type AIInsightSeverity = "info" | "warning" | "critical";

export interface AIInsight {
  id: string;
  creatorId: string;
  sessionId: string;
  snapshotId: string;
  platform: SupportedPlatform;
  timestamp: string;
  type: AIInsightType;
  severity: AIInsightSeverity;
  title: string;
  summary: string;
  recommendation: string;
  confidence: number;
  topics: string[];
  sourceModel: string;
  modelVersion: string;
  promptVersion: string;
  snapshotVersion: number;
  createdAt: string;
}
```

#### `[NEW]` [config.ts](file:///c:/Users/anshs/.gemini/antigravity-ide/scratch/creator-manager/src/lib/ai/config.ts)
- Centralized `AI_CONFIG`:
  - `ENABLED`: `process.env.AI_ENABLED !== "false"`
  - `PROVIDER`: `process.env.AI_PROVIDER || "gemini"`
  - `MODEL_VERSION`: `process.env.GEMINI_MODEL || "gemini-1.5-flash"`
  - `PROMPT_VERSION`: `"v1.0"`
  - `TIMEOUT_MS`: `4000` (4 second timeout)
  - `MAX_RETRIES`: `1`
  - `CACHE_TTL_MS`: `15 * 60 * 1000` (15 minutes)
  - `MAX_ANALYSES_PER_HOUR`: `6`
  - `DECISION_THRESHOLDS`: MPM delta 100%, Viewer delta 30%, max heartbeat interval 30 mins.

---

### 2. Decision Engine (Token Minimization)
#### `[NEW]` [decisionEngine.ts](file:///c:/Users/anshs/.gemini/antigravity-ide/scratch/creator-manager/src/lib/ai/decisionEngine.ts)
- `DecisionEngine`:
  - Compares current `PulseSnapshot` with the previous snapshot (or last analyzed snapshot).
  - Evaluates engagement signals (`hype_moment`, `spam_spike`, `question_heavy`), chat velocity spikes, and viewer count shifts.
  - Returns `DecisionResult`: `{ analyze: boolean, reason: string, priority: "low" | "medium" | "high", confidence: number }`.

---

### 3. Reusable Prompt Builder
#### `[NEW]` [promptBuilder.ts](file:///c:/Users/anshs/.gemini/antigravity-ide/scratch/creator-manager/src/lib/ai/promptBuilder.ts)
- `PromptBuilder`:
  - Formats normalized `PulseSnapshot` data and previous insight summary into a structured, token-minimized JSON prompt (< 800 tokens).
  - Excludes raw MongoDB objects and unnecessary fields.

---

### 4. Provider Abstraction & Gemini REST Provider
#### `[NEW]` [providerInterface.ts](file:///c:/Users/anshs/.gemini/antigravity-ide/scratch/creator-manager/src/lib/ai/providerInterface.ts)
- `AIModelProvider` interface: `generateInsight(prompt: PromptPayload)`, `healthCheck()`, `estimateTokens(text: string)`.

#### `[NEW]` [geminiProvider.ts](file:///c:/Users/anshs/.gemini/antigravity-ide/scratch/creator-manager/src/lib/ai/providers/geminiProvider.ts)
- `GeminiProvider` implementing `AIModelProvider`:
  - Calls Gemini REST API (`gemini-1.5-flash`) using `fetch` with `AbortController` timeout (4,000ms).
  - Manages retries, quota exhaustion (HTTP 429), and error normalization.

---

### 5. Response Parser & Rule-Based Fallback
#### `[NEW]` [parser.ts](file:///c:/Users/anshs/.gemini/antigravity-ide/scratch/creator-manager/src/lib/ai/parser.ts)
- `AIResponseParser`:
  - Sanitizes raw markdown codeblocks (````json ... ````) and parses structured JSON output.
  - Generates deterministic **Rule-Based Fallback Insights** if Gemini is rate-limited, offline, or returns invalid JSON (ensures 100% failure isolation!).

---

### 6. Provider-Independent Cache & Observability
#### `[NEW]` [cache.ts](file:///c:/Users/anshs/.gemini/antigravity-ide/scratch/creator-manager/src/lib/ai/cache.ts)
- `AICache`: Hashes snapshot data and stores recent results in-memory to prevent re-analyzing unchanged snapshot states.

#### `[NEW]` [telemetry.ts](file:///c:/Users/anshs/.gemini/antigravity-ide/scratch/creator-manager/src/lib/ai/telemetry.ts)
- `AIObservability`: Tracks lightweight metrics (`ai_requested`, `ai_skipped`, `cache_hit`, `provider_latency`, `quota_failures`).

---

### 7. AI Producer Central Orchestrator & Integration
#### `[NEW]` [producer.ts](file:///c:/Users/anshs/.gemini/antigravity-ide/scratch/creator-manager/src/lib/ai/producer.ts)
- `AIProducer`: Single entry point for AI operations.
  - `processSnapshot(sessionId: string, snapshotDoc: PulseSnapshot)`:
    1. Check `AI_CONFIG.ENABLED`.
    2. Consult `DecisionEngine`.
    3. Check `AICache`.
    4. Invoke `PromptBuilder`.
    5. Invoke `AIModelProvider` (Gemini).
    6. Invoke `AIResponseParser`.
    7. Write 1 document into MongoDB `ai_insights` collection.
  - Wrapped in try/catch to guarantee **0 interference with stream monitoring**.

#### `[MODIFY]` [engine.ts](file:///c:/Users/anshs/.gemini/antigravity-ide/scratch/creator-manager/src/lib/snapshot/engine.ts)
- After persisting a `PulseSnapshot` to MongoDB, asynchronously invoke `AIProducer.processSnapshot(snapshotDoc)` in background boundary.

---

### 8. AI Insights REST API
#### `[NEW]` [route.ts](file:///c:/Users/anshs/.gemini/antigravity-ide/scratch/creator-manager/src/app/api/ai/insights/route.ts)
- `GET /api/ai/insights?sessionId=XYZ`: Query persisted `ai_insights` from MongoDB for a session.

---

## Verification Plan

### Automated Build Verification
- Run TypeScript check: `cmd /c "npx tsc --noEmit"`.

### Manual & Integration Verification
1. **Pipeline Execution Test**: Trigger `AIProducer.processSnapshot()` with a mock `PulseSnapshot` and verify 1 document is persisted to MongoDB `ai_insights`.
2. **Decision Engine Trigger Check**: Pass quiet snapshot and verify `AIProducer` skips API call (0 tokens used).
3. **Failure Isolation Test**: Disconnect network or pass invalid API key and verify `AIProducer` falls back gracefully without interrupting stream monitoring.
