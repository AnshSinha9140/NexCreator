/**
 * Sprint 19.1 — Human AI Conversation Composer
 * 
 * Synthesizes subsystem signals from CreatorIntelligenceBundle + PulseSnapshot
 * into ONE cohesive, human-like AI Creator Manager update per snapshot.
 * 
 * Key Principles:
 * - Maximum ONE entry per snapshot.
 * - Subsystem signals merged into primary topic + supporting evidence bullets.
 * - Meaningful change detection (returns null if nothing meaningful changed).
 * - Topic Priority Matrix: Critical Risk > High Rec > Major Opp > Mood Shift > Strategy > Positive Obs.
 * - Cooldown enforcement & deduplication.
 * - Concise, natural manager tone (60-90 words, max 120 words).
 * 
 * Zero AI calls. Zero DB queries. Pure transformation layer.
 */

import { CreatorIntelligenceBundle, CoachRecommendation, RiskItem, OpportunityItem } from "@/lib/intelligence/types";
import { PulseSnapshot } from "@/lib/snapshot/types";
import { ConfidenceLanguage } from "./confidence";
import { ConversationMemory, SessionStateSnapshot } from "./memory";
import {
  ConversationEntry,
  ConversationMessageType,
  ConversationPriority,
} from "./types";

export class ConversationComposer {
  /**
   * Main entry point. Attempts to compose a single unified ConversationEntry for this snapshot.
   * Returns null if no meaningful change occurred or if topic is on cooldown.
   */
  static composeEntry(
    bundle: CreatorIntelligenceBundle,
    snapshot: PulseSnapshot | null,
    sessionId: string
  ): ConversationEntry | null {
    const nowEpochMs = Date.now();
    const lastState = ConversationMemory.getLastStateSnapshot(sessionId);

    // Sprint 19.3 Memory Sync
    const { MemoryBuilder } = require("@/lib/manager/memoryBuilder");
    MemoryBuilder.buildFromSnapshot(snapshot, bundle);

    // ── 1. Meaningful Change Detection (Sprint 19.1 Part 6) ──────────────────
    const primaryRec = bundle.coach && bundle.coach.length > 0 ? bundle.coach[0] : null;
    const moodStr = bundle.mood?.primaryMood ?? "Relaxed";
    const phaseStr = bundle.story?.currentPhase ?? "growth";
    const riskCount = bundle.risks?.length ?? 0;
    const oppCount = bundle.opportunities?.length ?? 0;
    const confScore = primaryRec?.confidence ?? bundle.mood?.confidence ?? 75;

    const isFirstSnapshot = !lastState;
    const moodChanged = Boolean(lastState && lastState.mood !== moodStr);
    const phaseChanged = Boolean(lastState && lastState.phase !== phaseStr);
    const recChanged = Boolean(lastState && lastState.primaryRecId !== (primaryRec?.id ?? ""));
    const risksChanged = Boolean(lastState && lastState.riskCount !== riskCount);
    const oppsChanged = Boolean(lastState && lastState.opportunityCount !== oppCount);
    const confShift = Boolean(lastState && Math.abs(lastState.confidenceScore - confScore) >= 15);

    const isMeaningful =
      isFirstSnapshot ||
      moodChanged ||
      phaseChanged ||
      recChanged ||
      risksChanged ||
      oppsChanged ||
      confShift;

    // Update session state snapshot regardless of emission
    const newStateSnapshot: SessionStateSnapshot = {
      snapshotId: snapshot?.snapshotId,
      mood: moodStr,
      primaryRecId: primaryRec?.id,
      riskCount,
      opportunityCount: oppCount,
      phase: phaseStr,
      confidenceScore: confScore,
      lastEmitEpochMs: lastState?.lastEmitEpochMs ?? 0,
      lastEmitPriority: lastState?.lastEmitPriority,
      lastEmitIntentKey: lastState?.lastEmitIntentKey,
    };

    if (!isMeaningful) {
      ConversationMemory.updateStateSnapshot(sessionId, newStateSnapshot);
      return null; // Return null: no new entry for this snapshot
    }

    // ── 2. Topic Priority Matrix (Sprint 19.1 Part 3) ────────────────────────
    const candidate = this.selectPrimaryTopic(bundle, isFirstSnapshot, moodChanged, phaseChanged);
    if (!candidate) {
      ConversationMemory.updateStateSnapshot(sessionId, newStateSnapshot);
      return null;
    }

    // ── 3. Cooldown Enforcement (Sprint 19.1 Part 5) ─────────────────────────
    const isCooldownActive = ConversationMemory.isPriorityOnCooldown(
      sessionId,
      candidate.priority,
      nowEpochMs
    );

    if (isCooldownActive && candidate.priority !== "CRITICAL_RISK") {
      ConversationMemory.updateStateSnapshot(sessionId, newStateSnapshot);
      return null; // Suppress output due to cooldown
    }

    // ── 4. Collect Supporting Evidence Bullets (Sprint 19.1 Part 11) ──────────
    const supportingEvidence = this.buildSupportingEvidence(bundle, candidate.priority);

    // ── 5. Evolve Statement (Sprint 19.1 Part 4 & 7) ──────────────────────────
    const priorNote = ConversationMemory.getPriorNote(sessionId, candidate.intentKey);
    let finalStatement = candidate.statement;
    if (priorNote) {
      finalStatement = `${priorNote} ${candidate.statement}`;
    }

    // Trim word count to stay strictly within 60–120 words
    finalStatement = this.enforceWordCount(finalStatement, 120);

    const timestampStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    const entry: ConversationEntry = {
      id: `entry_${snapshot?.snapshotId ?? Date.now()}`,
      snapshotId: snapshot?.snapshotId,
      timestamp: timestampStr,
      messageType: candidate.messageType,
      priority: candidate.priority,
      headline: candidate.headline,
      statement: finalStatement,
      reasoning: candidate.reasoning,
      actions: candidate.actions,
      expectedOutcome: candidate.expectedOutcome,
      supportingEvidence,
      confidenceLevel: candidate.confidenceLevel,
      confidencePhrase: candidate.confidencePhrase,
      intentKey: candidate.intentKey,
      createdEpochMs: nowEpochMs,
    };

    // Update memory & cooldown markers
    newStateSnapshot.lastEmitEpochMs = nowEpochMs;
    newStateSnapshot.lastEmitPriority = candidate.priority;
    newStateSnapshot.lastEmitIntentKey = candidate.intentKey;
    ConversationMemory.updateStateSnapshot(sessionId, newStateSnapshot);
    ConversationMemory.recordIssued(sessionId, candidate.intentKey, candidate.headline);
    ConversationMemory.addEntry(sessionId, entry);

    return entry;
  }

  // ─── Private Helpers ───────────────────────────────────────────────────────

  private static selectPrimaryTopic(
    bundle: CreatorIntelligenceBundle,
    isFirst: boolean,
    moodChanged: boolean,
    phaseChanged: boolean
  ): {
    priority: ConversationPriority;
    messageType: ConversationMessageType;
    headline: string;
    statement: string;
    reasoning?: string;
    actions?: string;
    expectedOutcome?: string;
    confidenceLevel: any;
    confidencePhrase: string;
    intentKey: string;
  } | null {
    // 1. Critical Risk
    const criticalRisk = bundle.risks?.find((r) => r.severity === "critical" || r.severity === "high");
    if (criticalRisk) {
      return {
        priority: "CRITICAL_RISK",
        messageType: "Warning",
        headline: criticalRisk.title,
        statement: `I'm flagging a critical issue for your stream. ${criticalRisk.cause} ${criticalRisk.mitigationRecommendation}`,
        reasoning: criticalRisk.cause,
        actions: criticalRisk.mitigationRecommendation,
        confidenceLevel: "extreme",
        confidencePhrase: "Urgent attention required",
        intentKey: `risk_${criticalRisk.id}`,
      };
    }

    // 2. High Priority Recommendation
    const primaryRec = bundle.coach && bundle.coach.length > 0 ? bundle.coach[0] : null;
    if (primaryRec && (primaryRec.priority === "high" || primaryRec.priority === "critical")) {
      const formatted = this.formatRecommendationTopic(primaryRec);
      return {
        priority: "HIGH_PRIORITY_REC",
        messageType: "Advice",
        headline: formatted.headline,
        statement: formatted.statement,
        reasoning: formatted.reasoning,
        actions: formatted.actions,
        expectedOutcome: formatted.expectedOutcome,
        confidenceLevel: ConfidenceLanguage.toLevel(primaryRec.confidence),
        confidencePhrase: ConfidenceLanguage.toInlinePhrase(primaryRec.confidence),
        intentKey: primaryRec.intentKey || primaryRec.id,
      };
    }

    // 3. Major Clip Opportunity
    const topOpp = bundle.opportunities && bundle.opportunities.length > 0 ? bundle.opportunities[0] : null;
    if (topOpp && (topOpp.scores?.overallAiScore ?? 0) >= 80) {
      return {
        priority: "MAJOR_OPPORTUNITY",
        messageType: "Praise",
        headline: topOpp.dynamicTitle || topOpp.title || "Strong Short-Form Clip Moment",
        statement: `I think we've just captured today's strongest Short: "${topOpp.dynamicTitle || topOpp.title}". I'd definitely save this one for quick publishing.`,
        reasoning: topOpp.reason,
        actions: topOpp.recommendedNextStep || topOpp.recommendedAction,
        expectedOutcome: "High potential for virality on TikTok or Shorts.",
        confidenceLevel: "high",
        confidencePhrase: "High clip potential",
        intentKey: `opp_${topOpp.id}`,
      };
    }

    // 4. Mood Shift
    if (moodChanged && bundle.mood) {
      const mood = bundle.mood;
      return {
        priority: "MOOD_SHIFT",
        messageType: "Observation",
        headline: `Audience energy shifted to ${mood.primaryMood}`,
        statement: `Chat energy has transitioned into a ${mood.primaryMood.toLowerCase()} state. ${mood.explanation}`,
        reasoning: mood.explanation,
        actions: "Adjust commentary pacing to match chat momentum.",
        confidenceLevel: ConfidenceLanguage.toLevel(mood.confidence),
        confidencePhrase: ConfidenceLanguage.toInlinePhrase(mood.confidence),
        intentKey: `mood_${mood.primaryMood}`,
      };
    }

    // 5. Normal Strategy / Recommendation Update
    if (primaryRec) {
      const formatted = this.formatRecommendationTopic(primaryRec);
      return {
        priority: "STRATEGY_UPDATE",
        messageType: "Advice",
        headline: formatted.headline,
        statement: formatted.statement,
        reasoning: formatted.reasoning,
        actions: formatted.actions,
        expectedOutcome: formatted.expectedOutcome,
        confidenceLevel: ConfidenceLanguage.toLevel(primaryRec.confidence),
        confidencePhrase: ConfidenceLanguage.toInlinePhrase(primaryRec.confidence),
        intentKey: primaryRec.intentKey || primaryRec.id,
      };
    }

    // 6. Positive Observation / Baseline
    if (isFirst) {
      return {
        priority: "POSITIVE_OBSERVATION",
        messageType: "Observation",
        headline: "Initial Broadcast Baseline Established",
        statement: "I've reviewed the opening segment of your stream. Chat velocity and sentiment are steady, and the session is progressing cleanly.",
        reasoning: "Early signals indicate stable viewer retention.",
        actions: "Keep up natural commentary while chat warms up.",
        confidenceLevel: "reasonable",
        confidencePhrase: "Baseline established",
        intentKey: "session_start_baseline",
      };
    }

    return null;
  }

  private static formatRecommendationTopic(rec: CoachRecommendation) {
    let headline = rec.title;
    let statement = rec.description;
    let reasoning = rec.reasoning;
    let actions = rec.title;
    let expectedOutcome = "Sustains audience engagement and chat velocity.";

    if (rec.intentKey === "INTENT_QA_PAUSE") {
      headline = "Viewer Questions Accumulating";
      statement = "I'm noticing chat asking several direct questions. Viewers are paying close attention, and pausing for a minute to answer two or three out loud will deepen engagement.";
      reasoning = "Unanswered questions lead to passive drop-off.";
      actions = "Pause gameplay briefly and answer 2–3 viewer questions out loud.";
      expectedOutcome = "Immediate uptick in chat participation.";
    } else if (rec.intentKey === "INTENT_CHAT_QUESTION") {
      headline = "Chat Momentum Slowing";
      statement = "Chat activity has dipped slightly over the last few minutes. Asking an open-ended question to chat will help re-ignite active conversation.";
      reasoning = "Passive silence causes gradual viewer decay.";
      actions = "Ask chat an easy direct question about your next move.";
      expectedOutcome = "Re-engages passive lurkers.";
    }

    return { headline, statement, reasoning, actions, expectedOutcome };
  }

  private static buildSupportingEvidence(
    bundle: CreatorIntelligenceBundle,
    primaryPriority: ConversationPriority
  ): string[] {
    const evidence: string[] = [];

    // Add mood signal if not primary
    if (primaryPriority !== "MOOD_SHIFT" && bundle.mood) {
      evidence.push(`Audience mood reading: ${bundle.mood.primaryMood} (Sentiment: ${bundle.mood.contributingAnalytics.sentimentScore}/100)`);
    }

    // Add clip opportunity signal if not primary
    if (primaryPriority !== "MAJOR_OPPORTUNITY" && bundle.opportunities && bundle.opportunities.length > 0) {
      evidence.push(`Clip moment detected: ${bundle.opportunities[0].dynamicTitle || bundle.opportunities[0].title}`);
    }

    // Add milestone/phase signal if not primary
    if (bundle.story?.currentPhase) {
      evidence.push(`Broadcast Phase: ${bundle.story.currentPhase.toUpperCase()}`);
    }

    // Add question count signal if available
    const qCount = bundle.mood?.contributingAnalytics.questionCount ?? 0;
    if (qCount > 0) {
      evidence.push(`${qCount} unanswered viewer question${qCount > 1 ? "s" : ""} in recent window`);
    }

    return evidence;
  }

  private static enforceWordCount(text: string, maxWords: number): string {
    const words = text.split(/\s+/);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "...";
  }
}
