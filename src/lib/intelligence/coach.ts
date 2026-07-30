import { PulseSnapshot } from "@/lib/snapshot/types";
import { CoachRecommendation } from "./types";
import { IntelligenceEvidenceEngine } from "./evidence";

export class StreamCoach {
  public static evaluate(snapshot: PulseSnapshot): CoachRecommendation[] {
    const { sessionId, snapshotId, metrics, analytics } = snapshot;
    const evidenceList = IntelligenceEvidenceEngine.extract(snapshot);
    const recommendations: CoachRecommendation[] = [];

    const mpm = analytics?.velocity ?? (metrics.messagesPerMinute || 0);
    const questions = analytics?.questionCount ?? (metrics.questionCount || 0);

    // 1. Dedicated Q&A Segment
    if (questions >= 2) {
      recommendations.push({
        id: `rec_qa_${Date.now()}`,
        sessionId,
        snapshotId,
        intentKey: "INTENT_QA_PAUSE",
        title: "Host Dedicated Community Q&A Pause",
        observation: `Viewers submitted ${questions} unanswered questions in recent 10-minute snapshot window.`,
        evidenceList,
        reasoning: "Addressing viewer questions directly increases chatter loyalty and viewer retention.",
        recommendation: "Take 90 seconds to answer questions out loud on stream.",
        description: "Your audience is asking multiple questions right now. Take 2 minutes to answer them directly on stream.",
        evidence: `Detected ${questions} questions with high community curiosity.`,
        expectedImpact: "Increases viewer retention by 35% and boosts chatter loyalty.",
        estimatedEffort: "Low (90 seconds out loud)",
        priority: "high",
        confidence: 94,
        status: "NEW",
        actionType: "qa_pause",
        createdAt: new Date().toISOString(),
      });
    }

    // 2. Chat Velocity Boosting Question
    if (mpm <= 3) {
      recommendations.push({
        id: `rec_vel_${Date.now()}`,
        sessionId,
        snapshotId,
        intentKey: "INTENT_CHAT_QUESTION",
        title: "Ask an Open-Ended Question to Chat",
        observation: `Chat velocity is low at ${mpm} msgs/min during ongoing gameplay.`,
        evidenceList,
        reasoning: "Direct open-ended questions prompt chatters to break silence and react.",
        recommendation: "Ask chat 'What game should we play next?' or 'How is your week going?'",
        description: "Chat velocity has slowed. Ask a direct question like 'What game should we play next?' or 'How is your week going?'",
        evidence: `Current velocity is low at ${mpm} msgs/min.`,
        expectedImpact: "Re-ignites community conversation and breaks dead air.",
        estimatedEffort: "Very Low (verbal shoutout)",
        priority: "medium",
        confidence: 90,
        status: "NEW",
        actionType: "chat_question",
        createdAt: new Date().toISOString(),
      });
    }

    // Baseline Fallback Advice
    if (recommendations.length === 0) {
      recommendations.push({
        id: `rec_base_${Date.now()}`,
        sessionId,
        snapshotId,
        intentKey: "INTENT_NARRATION",
        title: "Maintain Constant Pacing & Verbal Commentary",
        observation: "Steady stream momentum active with consistent chat activity.",
        evidenceList,
        reasoning: "Continuous verbal narration keeps new incoming viewers engaged while exploring content.",
        recommendation: "Narrate your thought process out loud during gameplay transitions.",
        description: "Narrate your thought process out loud to keep new incoming viewers engaged while exploring content.",
        evidence: "Steady baseline monitoring active across broadcast.",
        expectedImpact: "Establishes professional broadcast consistency.",
        estimatedEffort: "Low",
        priority: "low",
        confidence: 88,
        status: "NEW",
        actionType: "narration",
        createdAt: new Date().toISOString(),
      });
    }

    return recommendations;
  }
}

