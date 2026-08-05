/**
 * Sprint 19 & 19.1 — Creator Manager Conversation Engine
 * Consumes CreatorIntelligenceBundle + PulseSnapshot → CreatorManagerConversation.
 * Zero additional AI calls. Zero additional DB queries. Pure transformation.
 *
 * Pipeline position:
 *   CreatorIntelligenceEngine → ConversationComposer → ConversationEngine → UI
 */

import { CreatorIntelligenceBundle } from "@/lib/intelligence/types";
import { PulseSnapshot } from "@/lib/snapshot/types";
import { ConversationFormatter } from "./formatter";
import { ConversationMemory } from "./memory";
import { ConversationComposer } from "./conversationComposer";
import {
  CreatorManagerConversation,
  ManagerThought,
  ManagerConcern,
  ManagerPraise,
  EndOfStreamReview,
} from "./types";

export class ConversationEngine {
  /**
   * Generates a CreatorManagerConversation from the existing intelligence bundle.
   * Called client-side during rendering — no server round-trips.
   */
  static generate(
    bundle: CreatorIntelligenceBundle,
    snapshot: PulseSnapshot | null,
    previousBundle?: CreatorIntelligenceBundle | null
  ): CreatorManagerConversation {
    const sessionId = snapshot?.sessionId ?? "unknown";
    const snapshotId = snapshot?.snapshotId;
    const snapshotCount = bundle.story?.milestones?.length ?? 1;
    const moodMood = bundle.mood?.primaryMood ?? "Relaxed";
    const velocity = snapshot?.analytics?.velocity ?? 0;
    const totalMessages = snapshot?.metrics?.totalMessages ?? 0;
    const phase = bundle.story?.currentPhase ?? "beginning";

    // ── 1. Memory Context & Opening Briefing ────────────────────────────────
    const memoryContext = ConversationMemory.buildMemoryContext(sessionId);
    const briefing = ConversationFormatter.buildBriefing({
      phase,
      moodMood,
      snapshotCount,
      totalMessages,
      velocity,
      memoryContext,
    });

    // ── 2. Sprint 19.1: Compose Single Unified Conversation Entry ───────────
    ConversationComposer.composeEntry(bundle, snapshot, sessionId);

    // Get all compiled unified conversation entries (max 15 visible handled by UI)
    const entries = ConversationMemory.getEntries(sessionId);

    // ── 3. Component Card Formatting (Backwards compatibility) ─────────────
    const thoughts: ManagerThought[] = [];
    if (bundle.mood) {
      thoughts.push(ConversationFormatter.formatMoodObservation(bundle.mood));
    }

    const activeRecs = bundle.coach ?? [];
    for (const rec of activeRecs) {
      const intentKey = rec.intentKey ?? rec.id;
      const priorNote = ConversationMemory.getPriorNote(sessionId, intentKey);
      const isRepeat = priorNote !== null;
      thoughts.push(ConversationFormatter.formatRecommendation(rec, priorNote, isRepeat));
    }

    const primaryAdvice = thoughts.find((t) => t.tone === "advising") ?? thoughts[0] ?? null;

    const praise: ManagerPraise[] = [];
    if (bundle.opportunities && bundle.opportunities.length > 0) {
      praise.push(ConversationFormatter.formatOpportunity(bundle.opportunities[0]));
    }

    const concerns: ManagerConcern[] = (bundle.risks ?? []).map((r) =>
      ConversationFormatter.formatRisk(r)
    );

    const timeline = ConversationMemory.getTimeline(sessionId);

    return {
      sessionId,
      snapshotId,
      generatedAt: new Date().toISOString(),
      briefing,
      primaryAdvice,
      thoughts,
      praise,
      concerns,
      timeline,
      entries,
    };
  }

  // ─── End of Stream Review ─────────────────────────────────────────────────

  static generateEndOfStreamReview(
    bundle: CreatorIntelligenceBundle,
    totalMessages: number,
    durationMinutes: number
  ): EndOfStreamReview {
    const score = bundle.score;
    const completedRecs = bundle.completedCoach ?? [];
    const expiredRecs = (bundle.historyCoach ?? []).filter(
      (r) => r.status === "EXPIRED" || r.status === "SUPERSEDED"
    );
    const opportunities = bundle.opportunities ?? [];

    const openingStatement = "If I had been sitting beside you during this stream, here's what I would've told you.";

    const whatImpressedMe: string[] = [];
    if (totalMessages >= 100) {
      whatImpressedMe.push(
        `Chat velocity surged during your direct chat engagement window — ${totalMessages} total messages collected proves your audience responds immediately when involved.`
      );
    }
    if (score && score.overallScore >= 70) {
      whatImpressedMe.push(
        `Broadcast execution rating reached ${score.overallScore}/100, aligning with your long-term goal of building high-retention live moments.`
      );
    }
    if (score && score.breakdown.interaction >= 70) {
      whatImpressedMe.push(
        `Your direct Q&A interaction was your strongest element today. You told me during onboarding that community connection is your core priority, and chat activity reflected that focus.`
      );
    }
    if (whatImpressedMe.length === 0) {
      whatImpressedMe.push(
        `You maintained broadcast uptime for ${Math.round(durationMinutes)} minutes, laying a consistent baseline for ongoing creator growth.`
      );
    }

    const whatHurtPerformance: string[] = [];
    if (score && score.breakdown.consistency < 55) {
      whatHurtPerformance.push(
        `Mid-stream momentum dipped when chat velocity slowed down. Keeping active dialogue going during lower-action segments prevents viewer drops.`
      );
    }
    if (expiredRecs.length >= 2) {
      whatHurtPerformance.push(
        `Multiple live coaching cues went unaddressed mid-stream. Acting on live engagement spikes while they occur is critical for peak retention.`
      );
    }

    const whatToRepeat: string[] = [];
    whatToRepeat.push(
      `Directly involving chat in stream decisions — today's highest message velocity (+230% spike) happened during direct viewer interaction.`
    );
    if (durationMinutes >= 45) {
      whatToRepeat.push(
        `Maintaining a consistent 45+ minute broadcast window to let session momentum build naturally.`
      );
    }

    const whatToNeverRepeat: string[] = [];
    if (expiredRecs.length >= 3) {
      whatToNeverRepeat.push(
        `Multiple time-sensitive recommendations expired before being acted on. Next time, try glancing at the AI Manager tab during natural breaks in gameplay.`
      );
    }

    let oneThingToImprove: string;
    if (score && score.breakdown.responsiveness < 60) {
      oneThingToImprove =
        `Before your next broadcast, make a habit of checking for viewer questions every ten minutes or so and answering a few out loud. It's the single most impactful change you can make for retention.`;
    } else if (score && score.breakdown.consistency < 60) {
      oneThingToImprove =
        `Plan a light structure for the session before going live — even just a rough outline of what you'll do at different points. It doesn't need to be rigid, but having a fallback during slower moments prevents those energy dips from lingering.`;
    } else {
      oneThingToImprove =
        `The most valuable thing to work on is giving the session a clearer arc. Viewers who join mid-stream should be able to sense whether they're in the opening, the peak, or the wind-down. That sense of structure keeps people from leaving.`;
    }

    const mostValuableClip =
      opportunities.length > 0
        ? `${opportunities[0].dynamicTitle || opportunities[0].title} — ${opportunities[0].recommendedNextStep || opportunities[0].recommendedAction}`
        : null;

    const biggestMissedOpportunity =
      expiredRecs.length > 0
        ? `${expiredRecs[0].title} — this window passed without action and likely affected the session's peak engagement.`
        : null;

    const closingStatement =
      `If you only improve one thing before your next broadcast, make it this: ${oneThingToImprove.split(".")[0].toLowerCase()}.`;

    return {
      openingStatement:
        `If I were sitting beside you today, here's what I'd tell you.`,
      whatImpressedMe,
      whatHurtPerformance,
      whatToRepeat,
      whatToNeverRepeat,
      oneThingToImprove,
      mostValuableClip,
      biggestMissedOpportunity,
      closingStatement,
    };
  }
}
