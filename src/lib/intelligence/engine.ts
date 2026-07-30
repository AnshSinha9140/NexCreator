import { PulseSnapshot } from "@/lib/snapshot/types";
import { CreatorIntelligenceBundle, DeveloperDiagnostics } from "./types";
import { StreamCoach } from "./coach";
import { AudienceMoodAnalyzer } from "./mood";
import { TopicDetector } from "./topics";
import { OpportunityDetector, RiskDetector } from "./opportunities";
import { BroadcastScoreEngine } from "./score";
import { SessionStoryBuilder, CreatorActionGenerator } from "./story";
import { IntelligenceStorage } from "./storage";
import { RecommendationMemory } from "./memory";
import { RecommendationLifecycleEngine } from "./lifecycle";
import { RecommendationDeduplicator } from "./deduplicator";
import { ConfidenceCalibrationEngine } from "./calibration";
import { RecommendationQualityEngine } from "./quality";
import { ContinuousSessionLearningEngine } from "./learning";
import { RecommendationValidator } from "./validator";
import { IntelligenceHealthEngine } from "./health";

export class CreatorIntelligenceEngine {
  public static async processSnapshot(snapshot: PulseSnapshot): Promise<CreatorIntelligenceBundle> {
    console.log(`[CreatorIntelligenceEngine] 🧠 Generating Calibrated Intelligence for snapshot '${snapshot.snapshotId}' (Session: '${snapshot.sessionId}')...`);

    const existingBundle = await IntelligenceStorage.fetchLatestBundle(snapshot.sessionId);
    const memory = RecommendationMemory.getForSession(snapshot.sessionId);

    // 1. Continuous Session Learning Evaluation
    ContinuousSessionLearningEngine.evaluateSessionOutcomes(snapshot);

    // 2. Generate raw recommendations
    const rawRecommendations = StreamCoach.evaluate(snapshot);

    // 3. Deduplication (Merge similar intent, retain highest confidence version)
    const { deduplicated, duplicatesRemovedCount } = RecommendationDeduplicator.deduplicate(rawRecommendations);

    // 4. Calibration & Quality Scoring
    const calibratedRecommendations = deduplicated.map((rec) => {
      const calibratedConf = ConfidenceCalibrationEngine.calibrate(snapshot, rec);
      rec.rawConfidence = rec.confidence;
      rec.confidence = calibratedConf;
      rec.qualityScore = RecommendationQualityEngine.calculateQualityScore(rec);
      return rec;
    });

    // 5. Quality Filter
    const { passed: qualityPassedRecs, filteredCount: qualityFilteredCount } = RecommendationQualityEngine.filterQualityRecommendations(calibratedRecommendations);

    // 6. Pre-Publish Validation
    const { valid: validatedRecs, invalidCount } = RecommendationValidator.validateCoach(snapshot.sessionId, qualityPassedRecs);

    // 7. Lifecycle Processing
    const { active, expired, completed } = RecommendationLifecycleEngine.processLifecycle(snapshot, validatedRecs);

    // Record newly active recommendations in continuous learning tracker
    for (const activeRec of active) {
      ContinuousSessionLearningEngine.recordIssuedRecommendation(snapshot, activeRec);
    }

    // 8. Mood Stability & Story Builder
    const mood = AudienceMoodAnalyzer.analyze(snapshot, existingBundle?.mood);
    const topicsDoc = TopicDetector.detect(snapshot);
    const opportunities = OpportunityDetector.detect(snapshot);
    const rawRisks = RiskDetector.detect(snapshot);

    // Filter Contradictions
    const { opportunities: validOpps, risks: validRisks, contradictionCount } = RecommendationValidator.filterContradictions(opportunities, rawRisks);

    const score = BroadcastScoreEngine.calculate(snapshot);
    const story = SessionStoryBuilder.build(snapshot, existingBundle?.story);
    const actions = CreatorActionGenerator.generate(snapshot);

    // 9. Intelligence Health Report & Developer Diagnostics
    const totalFiltered = qualityFilteredCount + invalidCount;
    const health = IntelligenceHealthEngine.evaluateHealth(
      snapshot.sessionId,
      active,
      totalFiltered,
      duplicatesRemovedCount,
      contradictionCount
    );

    const historyCoach = memory.recommendations;
    const completedCoach = memory.getCompletedRecommendations();
    const dismissedCoach = memory.getDismissedRecommendations();
    const currentRecommendation = active.length > 0 ? active[0] : null;

    // Previous recommendation lookup
    const sortedHistory = [...historyCoach].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const previousRecommendation = sortedHistory.length > 1 ? sortedHistory[1] : null;

    const diagnostics: DeveloperDiagnostics = {
      recommendationsGenerated: rawRecommendations.length,
      recommendationsFiltered: totalFiltered,
      duplicatesRemoved: duplicatesRemovedCount,
      recommendationsExpired: expired.length,
      recommendationsCompleted: completed.length,
      confidenceDistribution: {
        high: active.filter((r) => r.confidence >= 80).length,
        medium: active.filter((r) => r.confidence >= 60 && r.confidence < 80).length,
        low: active.filter((r) => r.confidence < 60).length,
      },
      qualityScores: active.map((r) => r.qualityScore || 0),
      recommendationHistory: historyCoach,
      intelligenceHealth: health,
    };

    const bundle: CreatorIntelligenceBundle = {
      coach: active,
      historyCoach,
      completedCoach,
      dismissedCoach,
      currentRecommendation,
      previousRecommendation,
      mood,
      topics: topicsDoc.topics,
      opportunities: validOpps,
      risks: validRisks,
      score,
      story,
      actions,
      health,
      diagnostics,
    };

    await IntelligenceStorage.saveBundle(snapshot.sessionId, snapshot.snapshotId, bundle);
    return bundle;
  }
}

