/**
 * Sprint 19 — Creator Manager Conversation Engine
 * Consumes CreatorIntelligenceBundle + PulseSnapshot → CreatorManagerConversation.
 * Zero additional AI calls. Zero additional DB queries. Pure transformation.
 *
 * Pipeline position:
 *   CreatorIntelligenceEngine → ConversationEngine → UI
 */

import { CreatorIntelligenceBundle } from "@/lib/intelligence/types";
import { PulseSnapshot } from "@/lib/snapshot/types";
import { ConversationFormatter } from "./formatter";
import { ConversationMemory } from "./memory";
import { ConfidenceLanguage } from "./confidence";
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

    // ── 1. Memory context ──────────────────────────────────────────────────
    const memoryContext = ConversationMemory.buildMemoryContext(sessionId);

    // ── 2. Opening Briefing ────────────────────────────────────────────────
    const briefing = ConversationFormatter.buildBriefing({
      phase,
      moodMood,
      snapshotCount,
      totalMessages,
      velocity,
      memoryContext,
    });

    // ── 3. Mood Observation ────────────────────────────────────────────────
    const thoughts: ManagerThought[] = [];

    if (bundle.mood) {
      const moodThought = ConversationFormatter.formatMoodObservation(bundle.mood);
      thoughts.push(moodThought);

      ConversationMemory.addTimelineEntry(sessionId, moodThought.headline, moodThought.tone);
    }

    // ── 4. Recommendations → Thoughts ─────────────────────────────────────
    const activeRecs = bundle.coach ?? [];

    for (const rec of activeRecs) {
      const intentKey = rec.intentKey ?? rec.id;
      const priorNote = ConversationMemory.getPriorNote(sessionId, intentKey);
      const isRepeat = priorNote !== null;

      const thought = ConversationFormatter.formatRecommendation(rec, priorNote, isRepeat);
      thoughts.push(thought);

      const timesIssued = ConversationMemory.recordIssued(sessionId, intentKey, thought.headline);
      ConversationMemory.addTimelineEntry(sessionId, thought.headline, "advising");
    }

    // ── 5. Primary Advice (top-priority thought) ──────────────────────────
    const primaryAdvice =
      thoughts.find((t) => t.tone === "advising") ?? thoughts[0] ?? null;

    // ── 6. Praise (opportunities) ─────────────────────────────────────────
    const praise: ManagerPraise[] = [];

    if (bundle.opportunities && bundle.opportunities.length > 0) {
      const topOpp = bundle.opportunities[0];
      praise.push(ConversationFormatter.formatOpportunity(topOpp));
      ConversationMemory.addTimelineEntry(sessionId, "There's a clip-worthy moment here.", "praising");
    }

    // ── 7. Concerns (risks) ───────────────────────────────────────────────
    const concerns: ManagerConcern[] = (bundle.risks ?? []).map((r) =>
      ConversationFormatter.formatRisk(r)
    );

    if (concerns.length > 0) {
      ConversationMemory.addTimelineEntry(sessionId, concerns[0].headline, "concerned");
    }

    // ── 8. Conversation Timeline ──────────────────────────────────────────
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
    };
  }

  // ─── End of Stream Review ─────────────────────────────────────────────────

  /**
   * Generates the End of Stream Review. Called once when session completes.
   */
  static generateEndOfStreamReview(
    bundle: CreatorIntelligenceBundle,
    totalMessages: number,
    durationMinutes: number
  ): EndOfStreamReview {
    const score = bundle.score;
    const mood = bundle.mood;
    const completedRecs = bundle.completedCoach ?? [];
    const expiredRecs = (bundle.historyCoach ?? []).filter(
      (r) => r.status === "EXPIRED" || r.status === "SUPERSEDED"
    );
    const opportunities = bundle.opportunities ?? [];
    const story = bundle.story;
    const phase = story?.currentPhase ?? "growth";

    // ── What impressed me ─────────────────────────────────────────────────
    const whatImpressedMe: string[] = [];

    if (totalMessages >= 100) {
      whatImpressedMe.push(
        `The overall chat volume was strong — ${totalMessages} messages across the session is a healthy sign of active community participation.`
      );
    }
    if (score && score.overallScore >= 70) {
      whatImpressedMe.push(
        `The broadcast quality held up well. A score of ${score.overallScore}/100 puts this session in solid territory.`
      );
    }
    if (score && score.breakdown.interaction >= 70) {
      whatImpressedMe.push(
        `Your interaction with chat was one of the session's strongest elements. Viewers responded noticeably when you engaged with them directly.`
      );
    }
    if (mood?.primaryMood === "Hyped" || mood?.primaryMood === "Excited") {
      whatImpressedMe.push(
        `The audience reached a genuine excitement peak during this session. That's the kind of energy that keeps people coming back.`
      );
    }
    if (whatImpressedMe.length === 0) {
      whatImpressedMe.push(
        `You completed the session. Given the data available, the stream was functional and maintained viewer attention throughout.`
      );
    }

    // ── What hurt performance ─────────────────────────────────────────────
    const whatHurtPerformance: string[] = [];

    if (score && score.breakdown.consistency < 55) {
      whatHurtPerformance.push(
        `Consistency was below average. There were noticeable dips in energy and chat activity mid-session that broke the momentum.`
      );
    }
    if (expiredRecs.length >= 2) {
      whatHurtPerformance.push(
        `Several coaching recommendations were issued but went unaddressed. The opportunities they represented passed without action.`
      );
    }
    if (score && score.breakdown.responsiveness < 50) {
      whatHurtPerformance.push(
        `Viewer questions weren't being answered consistently. When chat asks things and gets no response, participation tends to drop off.`
      );
    }
    if (whatHurtPerformance.length === 0 && score && score.overallScore < 60) {
      whatHurtPerformance.push(
        `The broadcast score came in below 60, which usually reflects an opportunity to improve how actively you're engaging with what's happening in chat.`
      );
    }

    // ── What to repeat ────────────────────────────────────────────────────
    const whatToRepeat: string[] = [];

    if (durationMinutes >= 45) {
      whatToRepeat.push(
        `Streaming for ${Math.round(durationMinutes)} minutes gave the audience enough time to warm up and the session enough time to build momentum. Keep the duration consistent.`
      );
    }
    if (completedRecs.length > 0) {
      whatToRepeat.push(
        `You acted on at least some coaching suggestions mid-stream. That responsiveness during a live session is worth repeating.`
      );
    }

    // ── What to never repeat ─────────────────────────────────────────────
    const whatToNeverRepeat: string[] = [];

    if (score && score.breakdown.energy < 50) {
      whatToNeverRepeat.push(
        `The energy level dipped significantly at points in this session. Long stretches of low energy without re-engagement strategies are difficult to recover from.`
      );
    }
    if (expiredRecs.length >= 3) {
      whatToNeverRepeat.push(
        `Multiple time-sensitive recommendations expired before being acted on. Next time, try glancing at the AI Manager tab during natural breaks in gameplay.`
      );
    }

    // ── One thing to improve ──────────────────────────────────────────────
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

    // ── Most valuable clip ────────────────────────────────────────────────
    const mostValuableClip =
      opportunities.length > 0
        ? `${opportunities[0].dynamicTitle || opportunities[0].title} — ${opportunities[0].recommendedNextStep || opportunities[0].recommendedAction}`
        : null;

    // ── Biggest missed opportunity ────────────────────────────────────────
    const biggestMissedOpportunity =
      expiredRecs.length > 0
        ? `${expiredRecs[0].title} — this window passed without action and likely affected the session's peak engagement.`
        : null;

    // ── Closing statement ─────────────────────────────────────────────────
    const closingStatement =
      `If you only improve one thing before your next broadcast, make it this: ${oneThingToImprove.split(".")[0].toLowerCase()}.`;

    return {
      openingStatement:
        `If I were your manager, here's what I'd tell you about today's broadcast.`,
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
