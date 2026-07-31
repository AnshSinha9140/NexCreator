/**
 * Sprint 19 — Conversation Formatter
 * Stateless helpers that transform raw intelligence data into natural
 * manager language. These are the "voice" of the creator manager.
 * Never uses: "The analytics indicate...", "As an AI...", "Confidence: 72%"
 */

import {
  CoachRecommendation,
  AudienceMood,
  RiskItem,
  OpportunityItem,
} from "@/lib/intelligence/types";
import { ConfidenceLanguage } from "./confidence";
import { ManagerThought, ManagerConcern, ManagerPraise, ManagerBriefing } from "./types";

// ─── Recommendation → ManagerThought ────────────────────────────────────────

export class ConversationFormatter {
  /**
   * Converts a CoachRecommendation into a natural-language ManagerThought.
   */
  static formatRecommendation(
    rec: CoachRecommendation,
    memoryNote: string | null,
    isRepeat: boolean
  ): ManagerThought {
    const confPhrase = ConfidenceLanguage.toInlinePhrase(rec.confidence);
    const confLevel = ConfidenceLanguage.toLevel(rec.confidence);

    let body: string;
    let why: string;
    let whatToDo: string | undefined;
    let expectedResult: string | undefined;
    let ifIgnored: string | undefined;
    let headline: string;

    switch (rec.intentKey) {
      case "INTENT_QA_PAUSE": {
        const qCount = rec.evidenceList?.find(
          (e) => e.metrics?.questionCount !== undefined
        )?.metrics?.questionCount ?? 2;
        headline = "Your audience is asking questions.";
        body = `I'm noticing more viewer questions than usual right now. Over the last several minutes, chat has shifted from reactive messages to direct questions. That typically means viewers are paying close attention and want interaction, not just background noise.`;
        why = `There are ${qCount} unanswered questions in the recent window. When questions pile up without a response, the people who asked them tend to go quiet and eventually stop participating.`;
        whatToDo = `I'd take about a minute to answer two or three of them out loud. You don't need to stop what you're doing completely — acknowledge them, answer briefly, and keep moving.`;
        expectedResult = `If you do this now, you'll likely see a spike in chat activity immediately after. People respond when they feel heard.`;
        ifIgnored = `If you leave this, the question density will probably keep rising for a while, then drop sharply as people give up expecting a response.`;
        break;
      }

      case "INTENT_CHAT_QUESTION": {
        headline = "Chat has gone quiet.";
        body = `Things have slowed down in chat over the last few minutes. This isn't necessarily a problem, but it's the kind of quiet that can persist if nothing changes. Viewers who aren't actively chatting tend to drift away gradually.`;
        why = `The message rate is well below where it was earlier. A slow chat during active gameplay usually means viewers are watching passively rather than feeling involved.`;
        whatToDo = `Ask chat something directly. It doesn't have to be profound — "what should we do next?" or even a simple reaction prompt works. The goal is to make someone feel like responding.`;
        expectedResult = `A single direct question to chat usually produces an immediate uptick in messages within 30 to 60 seconds.`;
        ifIgnored = `Without something to respond to, passive viewers tend to drift rather than re-engage on their own.`;
        break;
      }

      case "INTENT_NARRATION":
      default: {
        headline = "The stream is running steadily.";
        body = `There's nothing here that needs immediate attention. Chat is active, the audience appears engaged, and the session is progressing normally. This is a good position to be in.`;
        why = `Engagement indicators are consistent across this window. No major changes in momentum or audience behavior.`;
        whatToDo = `Keep doing what you're doing. If anything, make sure you're still narrating your thought process out loud — it's one of the most effective things for keeping new viewers from feeling lost.`;
        expectedResult = `Consistent verbal commentary keeps the stream accessible to viewers who just joined and sustains the engagement you already have.`;
        break;
      }
    }

    // If this is a repeated recommendation, adjust the phrasing
    if (isRepeat && memoryNote) {
      body = `${memoryNote} The situation hasn't changed much. ${body}`;
    }

    return {
      id: rec.id,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      tone: "advising",
      headline,
      body,
      why,
      whatToDo,
      expectedResult,
      ifIgnored,
      confidencePhrase: confPhrase,
      confidenceLevel: confLevel,
      memoryNote: memoryNote || undefined,
      isNew: !isRepeat,
      intentKey: rec.intentKey,
    };
  }

  // ─── Mood → Natural Language ─────────────────────────────────────────────

  static formatMoodObservation(mood: AudienceMood): ManagerThought {
    const moodPhrases: Record<string, { headline: string; body: string; tone: "observing" | "praising" | "concerned" }> = {
      Hyped: {
        headline: "Your audience is genuinely excited right now.",
        body: `This isn't a temporary spike. The excitement in chat has been sustained for long enough that I'm reading it as real momentum, not just a reaction to a single moment. People are staying engaged because they're reacting to both what's happening on screen and your direct interaction with chat. This is the kind of energy that drives clip-worthy moments.`,
        tone: "praising",
      },
      Curious: {
        headline: "Your audience is in a curious, attentive state.",
        body: `Chat has shifted into question mode. Viewers are asking things rather than just reacting. That's usually a sign they're invested — they want to understand what's happening. It's worth pausing briefly to talk directly with them before this energy fades.`,
        tone: "observing",
      },
      Excited: {
        headline: "The mood in chat is positive.",
        body: `Sentiment is noticeably above baseline right now. People are reacting positively and the energy feels consistent rather than spikey. You're in a good rhythm. Keep it going.`,
        tone: "praising",
      },
      Relaxed: {
        headline: "Chat is calm and following along.",
        body: `Nothing alarming here. The audience is engaged at a steady pace without a lot of noise or friction. This is a baseline-healthy stream state. Nothing needs to change right now.`,
        tone: "observing",
      },
      Waiting: {
        headline: "Chat has gone passive.",
        body: `Very few messages are coming through right now. Viewers are watching but not participating. This tends to happen during quieter gameplay segments or when there hasn't been a conversational prompt for a while. Worth re-engaging chat soon.`,
        tone: "concerned",
      },
      Frustrated: {
        headline: "Something is bothering your audience.",
        body: `I'm seeing more negative signals in chat than I'd expect. It could be technical issues, a slow segment, or something in the stream content. I'd pay attention to what people are actually saying in chat right now to understand what's driving it.`,
        tone: "concerned",
      },
      Bored: {
        headline: "Audience energy is dipping.",
        body: `The excitement from earlier hasn't carried through. Chat participation is lower than it should be at this point in the session. Changing the pace or prompting a direct interaction with viewers would help.`,
        tone: "concerned",
      },
      Toxic: {
        headline: "There's some friction in chat right now.",
        body: `I'm noticing a higher-than-normal level of negative chat activity. You may want to acknowledge the community expectations briefly, or use moderation tools if needed. Don't let it derail the session.`,
        tone: "concerned",
      },
    };

    const phrases = moodPhrases[mood.primaryMood] || moodPhrases["Relaxed"];
    const confPhrase = ConfidenceLanguage.toInlinePhrase(mood.confidence);

    return {
      id: `mood_${mood.snapshotId}`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      tone: phrases.tone,
      headline: phrases.headline,
      body: phrases.body,
      why: mood.explanation,
      confidencePhrase: confPhrase,
      confidenceLevel: ConfidenceLanguage.toLevel(mood.confidence),
      isNew: true,
    };
  }

  // ─── Risk → ManagerConcern ─────────────────────────────────────────────

  static formatRisk(risk: RiskItem): ManagerConcern {
    const severityMap: Record<string, "watching" | "concerned" | "urgent"> = {
      low: "watching",
      medium: "concerned",
      high: "urgent",
      critical: "urgent",
    };

    const prefix =
      risk.severity === "critical" || risk.severity === "high"
        ? "I'm concerned about something."
        : "I'm keeping an eye on something.";

    return {
      id: risk.id,
      headline: risk.title,
      body: `${prefix} ${risk.cause} ${risk.mitigationRecommendation}`,
      severity: severityMap[risk.severity] || "watching",
    };
  }

  // ─── Opportunity → ManagerPraise ─────────────────────────────────────────

  static formatOpportunity(opp: OpportunityItem): ManagerPraise {
    return {
      id: opp.id,
      headline: "There's a clip-worthy moment here.",
      body: `${opp.reason} ${opp.recommendedAction}`,
    };
  }

  // ─── Opening Briefing ─────────────────────────────────────────────────────

  static buildBriefing(params: {
    phase: string;
    moodMood: string;
    snapshotCount: number;
    totalMessages: number;
    velocity: number;
    memoryContext?: string;
  }): ManagerBriefing {
    const { phase, moodMood, snapshotCount, totalMessages, velocity, memoryContext } = params;

    const isFirstSnapshot = snapshotCount <= 1;
    const type = isFirstSnapshot ? "live_update" : "mid_stream";

    let headline: string;
    let body: string;

    if (isFirstSnapshot) {
      headline = "First window complete.";
      body = `I've finished reviewing the opening segment of your stream. With ${totalMessages} messages and a chat rate of ${velocity} messages per minute, the session is off to a reasonable start. The audience mood reads as ${moodMood.toLowerCase()} right now. I'll continue watching and update you as the picture gets clearer.`;
    } else {
      const phaseLabel =
        phase === "peak"
          ? "peak phase"
          : phase === "growth"
          ? "growth phase"
          : phase === "ending"
          ? "final stretch"
          : "early stage";

      headline = `Stream is in its ${phaseLabel}.`;
      body = `Overall this session is progressing well. The audience is in a ${moodMood.toLowerCase()} state and chat activity is ${
        velocity >= 15
          ? "strong"
          : velocity >= 5
          ? "moderate"
          : "on the quieter side"
      }. I've been watching the session for ${snapshotCount} window${snapshotCount > 1 ? "s" : ""} now and have a reasonable read on where things stand.`;
    }

    return {
      type,
      headline,
      body,
      memoryContext,
    };
  }
}
