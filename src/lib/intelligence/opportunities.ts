import { PulseSnapshot } from "@/lib/snapshot/types";
import { OpportunityItem, RiskItem } from "./types";

export class OpportunityDetector {
  public static detect(snapshot: PulseSnapshot): OpportunityItem[] {
    const { sessionId, snapshotId, metrics, viewerMetrics, analytics } = snapshot;
    const opportunities: OpportunityItem[] = [];

    const mpm = analytics?.velocity ?? (metrics.messagesPerMinute || 0);
    const viewers = analytics?.viewers || viewerMetrics?.averageViewerCount || 0;
    const questions = analytics?.questionCount ?? (metrics.questionCount || 0);

    if (questions >= 2) {
      const urgencyScore = 90;
      const expectedImpactScore = 85;
      const confidence = 90;
      const rankScore = Math.round(urgencyScore * 0.4 + expectedImpactScore * 0.4 + confidence * 0.2);

      opportunities.push({
        id: `opp_q_${Date.now()}`,
        sessionId,
        snapshotId,
        title: "Question Surge Opportunity",
        reason: `${questions} chatters asked questions in this window.`,
        recommendedAction: "Host a mini 60-second Q&A answer session.",
        expectedBenefit: "Drives community engagement and boosts viewer loyalty.",
        priority: "high",
        confidence,
        urgencyScore,
        expectedImpactScore,
        rankScore,
        createdAt: new Date().toISOString(),
      });
    }

    if (viewers > 10 || mpm >= 15) {
      const urgencyScore = 85;
      const expectedImpactScore = 95;
      const confidence = 92;
      const rankScore = Math.round(urgencyScore * 0.4 + expectedImpactScore * 0.4 + confidence * 0.2);

      opportunities.push({
        id: `opp_v_${Date.now()}`,
        sessionId,
        snapshotId,
        title: "High Hype Moment Clip Opportunity",
        reason: "Audience activity and viewer numbers are peaking.",
        recommendedAction: "Mark clip timestamp or tell moderators to clip this segment.",
        expectedBenefit: "Provides high-converting YouTube Short / TikTok content.",
        priority: "high",
        confidence,
        urgencyScore,
        expectedImpactScore,
        rankScore,
        createdAt: new Date().toISOString(),
      });
    }

    // Rank opportunities descending by rankScore
    return opportunities.sort((a, b) => (b.rankScore || 0) - (a.rankScore || 0));
  }
}

export class RiskDetector {
  public static detect(snapshot: PulseSnapshot): RiskItem[] {
    const { sessionId, snapshotId, metrics, analytics } = snapshot;
    const risks: RiskItem[] = [];

    const sentiment = analytics?.sentiment ?? 50;
    const mpm = analytics?.velocity ?? (metrics.messagesPerMinute || 0);

    if (sentiment <= 35) {
      const probabilityScore = 90;
      const impactScore = 85;
      const recoveryDifficultyScore = 75;
      const confidence = 88;
      const rankScore = Math.round(impactScore * 0.4 + probabilityScore * 0.3 + recoveryDifficultyScore * 0.3);

      risks.push({
        id: `risk_sent_${Date.now()}`,
        sessionId,
        snapshotId,
        title: "Sentiment Drop Detected",
        cause: "Negative chat comments or complaints detected in recent window.",
        mitigationRecommendation: "Acknowledge issue calmly or shift gameplay/topic focus.",
        severity: "high",
        confidence,
        probabilityScore,
        impactScore,
        recoveryDifficultyScore,
        rankScore,
        createdAt: new Date().toISOString(),
      });
    }

    if (mpm <= 1 && metrics.totalMessages < 3) {
      const probabilityScore = 80;
      const impactScore = 70;
      const recoveryDifficultyScore = 50;
      const confidence = 85;
      const rankScore = Math.round(impactScore * 0.4 + probabilityScore * 0.3 + recoveryDifficultyScore * 0.3);

      risks.push({
        id: `risk_dead_${Date.now()}`,
        sessionId,
        snapshotId,
        title: "Dead Chat Risk",
        cause: "Minimal audience message activity detected.",
        mitigationRecommendation: "Ask a poll or open-ended question to re-engage chatters.",
        severity: "medium",
        confidence,
        probabilityScore,
        impactScore,
        recoveryDifficultyScore,
        rankScore,
        createdAt: new Date().toISOString(),
      });
    }

    // Rank risks descending by rankScore
    return risks.sort((a, b) => (b.rankScore || 0) - (a.rankScore || 0));
  }
}

