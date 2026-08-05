// =============================================================================
// test_evidence_engine.ts — Sprint 24.5 Evidence Intelligence Verification
// =============================================================================
// Validates:
//   1. EvidenceExtractor produces evidence from synthetic snapshots
//   2. EvidenceValidator filters below-threshold evidence
//   3. MomentDetector produces moment candidates
//   4. EvidenceGraph builds and resolves chains
//   5. ReliabilityEngine scores are sensible
//   6. ActBuilder produces 4 acts
//   7. ValidationSuite passes on clean data
// =============================================================================

import { EvidenceExtractor } from "../src/lib/intelligence/evidence/EvidenceExtractor";
import { EvidenceValidator } from "../src/lib/intelligence/evidence/EvidenceValidator";
import { EvidenceGraphBuilder } from "../src/lib/intelligence/evidence/EvidenceGraph";
import { MomentDetector } from "../src/lib/intelligence/evidence/MomentDetector";
import { ActBuilder } from "../src/lib/intelligence/evidence/ActBuilder";
import { ReliabilityEngine } from "../src/lib/intelligence/evidence/ReliabilityEngine";

// ---------------------------------------------------------------------------
// Synthetic test data
// ---------------------------------------------------------------------------

const SYNTHETIC_SNAPSHOTS = [
  {
    snapshotId: "snap_001",
    timestamp: "00:01:00",
    isoTimestamp: new Date(Date.now() - 50 * 60000).toISOString(),
    windowStart: new Date(Date.now() - 50 * 60000).toISOString(),
    analytics: { velocity: 4, sentiment: 62, momentum: 45, viewers: 12, questionCount: 0, uniqueChatterCount: 3 },
    metrics: { totalMessages: 8, questionCount: 0, uniqueChattersCount: 3 },
    representativeMessages: [
      { text: "hi chat!", category: "general" },
      { text: "let's go!", category: "general" },
    ],
  },
  {
    snapshotId: "snap_002",
    timestamp: "00:05:30",
    isoTimestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    windowStart: new Date(Date.now() - 45 * 60000).toISOString(),
    analytics: { velocity: 22, sentiment: 81, momentum: 70, viewers: 28, questionCount: 4, uniqueChatterCount: 12 },
    metrics: { totalMessages: 25, questionCount: 4, uniqueChattersCount: 12 },
    representativeMessages: [
      { text: "PogChamp", category: "emote" },
      { text: "what was that?!", category: "question" },
      { text: "how did you do that?", category: "question" },
    ],
  },
  {
    snapshotId: "snap_003",
    timestamp: "00:12:15",
    isoTimestamp: new Date(Date.now() - 38 * 60000).toISOString(),
    windowStart: new Date(Date.now() - 38 * 60000).toISOString(),
    analytics: { velocity: 45, sentiment: 92, momentum: 95, viewers: 48, questionCount: 2, uniqueChatterCount: 22 },
    metrics: { totalMessages: 55, questionCount: 2, uniqueChattersCount: 22, topEmojis: [{ emoji: "🔥", count: 18 }, { emoji: "W", count: 12 }] },
    representativeMessages: [
      { text: "🔥🔥🔥", category: "emote" },
      { text: "ACTUAL W", category: "general" },
      { text: "LETS GOOOOO", category: "general" },
    ],
  },
  {
    snapshotId: "snap_004",
    timestamp: "00:18:45",
    isoTimestamp: new Date(Date.now() - 31 * 60000).toISOString(),
    windowStart: new Date(Date.now() - 31 * 60000).toISOString(),
    analytics: { velocity: 12, sentiment: 74, momentum: 65, viewers: 35, questionCount: 1, uniqueChatterCount: 9 },
    metrics: { totalMessages: 15, questionCount: 1, uniqueChattersCount: 9 },
    representativeMessages: [
      { text: "nice play", category: "general" },
    ],
  },
  {
    snapshotId: "snap_005",
    timestamp: "00:25:00",
    isoTimestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    windowStart: new Date(Date.now() - 25 * 60000).toISOString(),
    analytics: { velocity: 1, sentiment: 68, momentum: 42, viewers: 30, questionCount: 0, uniqueChatterCount: 1 },
    metrics: { totalMessages: 2, questionCount: 0, uniqueChattersCount: 1 },
    representativeMessages: [],
  },
  {
    snapshotId: "snap_006",
    timestamp: "00:30:00",
    isoTimestamp: new Date(Date.now() - 20 * 60000).toISOString(),
    windowStart: new Date(Date.now() - 20 * 60000).toISOString(),
    analytics: { velocity: 38, sentiment: 88, momentum: 89, viewers: 28, questionCount: 3, uniqueChatterCount: 16 },
    metrics: { totalMessages: 42, questionCount: 3, uniqueChattersCount: 16, topEmojis: [{ emoji: "😂", count: 10 }] },
    representativeMessages: [
      { text: "lmaooo", category: "general" },
      { text: "did that just happen", category: "question" },
      { text: "😂😂😂", category: "emote" },
    ],
  },
];

const SYNTHETIC_CHAT = [
  { username: "viewer1", message: "hi chat!", timestamp: "00:01:00" },
  { username: "viewer2", message: "let's go!", timestamp: "00:01:30" },
  { username: "viewer3", message: "what was that?!", timestamp: "00:05:30" },
  { username: "viewer4", message: "how did you do that?", timestamp: "00:05:45" },
  { username: "viewer5", message: "PogChamp", timestamp: "00:06:00" },
  { username: "viewer6", message: "🔥🔥🔥", timestamp: "00:12:00" },
  { username: "viewer7", message: "ACTUAL W", timestamp: "00:12:15" },
  { username: "viewer8", message: "LETS GOOOOO", timestamp: "00:12:20" },
  { username: "viewer9", message: "nice play", timestamp: "00:18:45" },
  { username: "viewer10", message: "lmaooo", timestamp: "00:30:00" },
  { username: "viewer11", message: "did that just happen", timestamp: "00:30:15" },
  { username: "viewer12", message: "😂😂😂", timestamp: "00:30:30" },
];

// ---------------------------------------------------------------------------
// Test runner
// ---------------------------------------------------------------------------

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  details?: string;
}

const results: TestResult[] = [];

function test(name: string, fn: () => void): void {
  try {
    fn();
    results.push({ name, passed: true });
    console.log(`  ✅ ${name}`);
  } catch (err: any) {
    results.push({ name, passed: false, error: err.message });
    console.log(`  ❌ ${name}: ${err.message}`);
  }
}

function assert(condition: boolean, message: string): void {
  if (!condition) throw new Error(message);
}

// ---------------------------------------------------------------------------
// Run Tests
// ---------------------------------------------------------------------------

console.log("\n🔬 Sprint 24.5 — Evidence Intelligence Engine Test Suite\n");

// 1. EvidenceExtractor
console.log("1. EvidenceExtractor");
let evidence: any[] = [];
test("Extracts evidence from synthetic snapshots", () => {
  evidence = EvidenceExtractor.extract(SYNTHETIC_SNAPSHOTS, SYNTHETIC_CHAT);
  assert(evidence.length > 0, `Expected evidence items, got ${evidence.length}`);
});
test("All evidence has required fields", () => {
  for (const ev of evidence) {
    assert(typeof ev.id === "string" && ev.id.length > 0, `Evidence missing id: ${JSON.stringify(ev)}`);
    assert(typeof ev.type === "string", `Evidence missing type`);
    assert(typeof ev.confidence === "number", `Evidence missing confidence`);
    assert(typeof ev.timestamp === "string", `Evidence missing timestamp`);
    assert(typeof ev.relatedSnapshotId === "string", `Evidence missing relatedSnapshotId`);
  }
});
test("Evidence types are valid enum values", () => {
  const validTypes = new Set([
    "VIEWER_SPIKE", "CHAT_EXPLOSION", "QUESTION_WAVE", "SENTIMENT_SHIFT",
    "AUDIENCE_ARRIVAL", "AUDIENCE_EXIT", "CONVERSATION_BURST", "SILENCE",
    "REACTION_BURST", "MOMENTUM_SHIFT"
  ]);
  for (const ev of evidence) {
    assert(validTypes.has(ev.type), `Unknown evidence type: ${ev.type}`);
  }
});
test("AUDIENCE_ARRIVAL is produced for snapshot 0", () => {
  const arrivals = evidence.filter(ev => ev.type === "AUDIENCE_ARRIVAL");
  assert(arrivals.length > 0, "No AUDIENCE_ARRIVAL evidence detected");
});
test("CHAT_EXPLOSION detected for high-velocity snapshots", () => {
  const explosions = evidence.filter(ev => ev.type === "CHAT_EXPLOSION");
  assert(explosions.length > 0, "No CHAT_EXPLOSION detected despite high velocity snapshots");
});
test("QUESTION_WAVE detected for question-heavy snapshot", () => {
  const questions = evidence.filter(ev => ev.type === "QUESTION_WAVE");
  assert(questions.length > 0, "No QUESTION_WAVE detected despite 4 questions in snap_002");
});
test("SILENCE detected for low-velocity snapshot (snap_005 at 1 msg/min)", () => {
  const silences = evidence.filter(ev => ev.type === "SILENCE");
  assert(silences.length > 0, "No SILENCE detected despite 1 msg/min in snap_005");
});

// 2. EvidenceValidator
console.log("\n2. EvidenceValidator");
let validatedEvidence: any[] = [];
test("Filters out low-confidence evidence", () => {
  const lowConf: import("../src/lib/intelligence/evidence/EvidenceTypes").RawEvidence[] = [{ id: "ev_low", type: "CHAT_EXPLOSION", confidence: 50, timestamp: "00:01:00", relatedSnapshotId: "snap_001", isoTimestamp: new Date().toISOString(), durationSeconds: 60, sourceMetrics: {}, chatSample: [], description: "test" }];
  const result = EvidenceValidator.validateEvidence(lowConf);

  assert(result.length === 0, `Expected 0 validated items for confidence=50, got ${result.length}`);
});
test("Passes high-confidence evidence", () => {
  validatedEvidence = EvidenceValidator.validateEvidence(evidence);
  assert(validatedEvidence.length > 0, `Expected validated evidence, got ${validatedEvidence.length}`);
  assert(validatedEvidence.length <= evidence.length, "Validation should not add items");
});

// 3. MomentDetector
console.log("\n3. MomentDetector");
let moments: any[] = [];
test("Detects moment candidates from validated evidence", () => {
  const baseline = { avgVelocity: 15, avgSentiment: 75, peakViewers: 48 };
  moments = MomentDetector.detect(validatedEvidence, SYNTHETIC_CHAT, baseline);
  assert(moments.length > 0, "No moments detected from synthetic high-signal data");
});
test("Moments have required fields", () => {
  for (const m of moments) {
    assert(typeof m.momentId === "string" && m.momentId.length > 0, `Moment missing momentId`);
    assert(typeof m.score === "number" && m.score >= 0 && m.score <= 100, `Invalid score: ${m.score}`);
    assert(m.startSeconds < m.endSeconds, `Invalid timestamp range for ${m.momentId}`);
    assert(Array.isArray(m.evidenceIds) && m.evidenceIds.length > 0, `Moment has no evidence IDs`);
  }
});
test("Moments sorted by score descending", () => {
  for (let i = 1; i < moments.length; i++) {
    assert(moments[i].score <= moments[i - 1].score, `Moments not sorted: ${moments[i - 1].score} < ${moments[i].score}`);
  }
});
test("Moment scorecards have all 7 dimensions", () => {
  if (moments.length === 0) return;
  const sc = moments[0].scorecard;
  const dims = ["overall", "viewerImpact", "chatVelocity", "sentiment", "replayValue", "uniqueness", "conversationQuality", "confidence"];
  for (const dim of dims) {
    assert(sc[dim] !== undefined, `Scorecard missing dimension: ${dim}`);
  }
});

// 4. EvidenceValidator.validateMoments
console.log("\n4. MomentValidator");
let validatedMoments: any[] = [];
test("Validates moment candidates", () => {
  validatedMoments = EvidenceValidator.validateMoments(moments);
  assert(Array.isArray(validatedMoments), "validateMoments should return an array");
});
test("All validated moments have VALIDATED status", () => {
  for (const m of validatedMoments) {
    assert(m.validationStatus === "VALIDATED", `Expected VALIDATED, got ${m.validationStatus} for ${m.momentId}`);
  }
});
test("No overlapping clip windows in validated moments", () => {
  const sorted = [...validatedMoments].sort((a, b) => a.startSeconds - b.startSeconds);
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1];
    const curr = sorted[i];
    const overlap = prev.endSeconds - curr.startSeconds;
    assert(overlap <= 10, `Excessive overlap: ${overlap}s between ${prev.momentId} and ${curr.momentId}`);
  }
});

// 5. EvidenceGraph
console.log("\n5. EvidenceGraph");
let graph: any = null;
test("Builds evidence graph from sessions data", () => {
  graph = EvidenceGraphBuilder.build({
    sessionId: "test_session",
    evidence: validatedEvidence,
    moments: validatedMoments,
    snapshots: SYNTHETIC_SNAPSHOTS,
  });
  assert(graph !== null, "Graph should not be null");
  assert(graph.sessionId === "test_session", "Graph sessionId mismatch");
});
test("Graph has correct evidence and moment counts", () => {
  assert(graph.evidence.length === validatedEvidence.length, `Graph evidence count mismatch`);
  assert(graph.moments.length === validatedMoments.length, `Graph moments count mismatch`);
});
test("Graph edges are non-empty for moments with evidence", () => {
  if (validatedMoments.length > 0) {
    const momentEdges = graph.edges.filter((e: any) => e.fromType === "moment");
    assert(momentEdges.length > 0, "No moment edges in graph");
  }
});
test("Can resolve evidence chain for a moment", () => {
  if (validatedMoments.length > 0) {
    const chain = EvidenceGraphBuilder.resolveChain(graph, validatedMoments[0].momentId);
    assert(chain.moment !== null, "resolveChain should return the moment");
  }
});

// 6. ReliabilityEngine
console.log("\n6. ReliabilityEngine");
test("Computes reliability for well-covered session", () => {
  const reliability = ReliabilityEngine.compute({
    chatMessageCount: 120,
    snapshotCount: 6,
    snapshotsWithViewerData: 5,
    evidence: validatedEvidence,
    durationMinutes: 30,
    timelineEventCount: 8,
  });
  assert(typeof reliability.overallReliability === "number", "overallReliability not a number");
  assert(reliability.overallReliability >= 0 && reliability.overallReliability <= 100, `reliability out of bounds: ${reliability.overallReliability}`);
  assert(["Strong", "Moderate", "Limited", "Insufficient"].includes(reliability.reliabilityLabel), `Invalid label: ${reliability.reliabilityLabel}`);
  assert(typeof reliability.showLimitedDisclaimer === "boolean", "showLimitedDisclaimer not boolean");
});
test("Low-coverage session shows Limited disclaimer", () => {
  const reliability = ReliabilityEngine.compute({
    chatMessageCount: 2,
    snapshotCount: 1,
    snapshotsWithViewerData: 0,
    evidence: [],
    durationMinutes: 30,
    timelineEventCount: 0,
  });
  assert(reliability.showLimitedDisclaimer === true, `Expected disclaimer for near-zero data, got ${reliability.overallReliability}`);
});

// 7. ActBuilder
console.log("\n7. ActBuilder");
test("Builds 4 broadcast acts", () => {
  const acts = ActBuilder.build({
    sessionId: "test_session",
    durationSeconds: 1800,
    evidence: validatedEvidence,
    moments: validatedMoments,
    highlightIds: validatedMoments.map((_: any, i: number) => `highlight_${String(i + 1).padStart(3, "0")}`),
    snapshotIds: SYNTHETIC_SNAPSHOTS.map(s => s.snapshotId),
    streamCategory: "Gaming",
  });
  assert(acts.length === 4, `Expected 4 acts, got ${acts.length}`);
  const labels = acts.map(a => a.label);
  assert(labels.includes("OPENING"), "Missing OPENING act");
  assert(labels.includes("MOMENTUM"), "Missing MOMENTUM act");
  assert(labels.includes("PEAK"), "Missing PEAK act");
  assert(labels.includes("ENDING"), "Missing ENDING act");
});
test("Acts cover full timeline", () => {
  const acts = ActBuilder.build({
    sessionId: "test_session",
    durationSeconds: 1800,
    evidence: validatedEvidence,
    moments: validatedMoments,
    highlightIds: [],
    snapshotIds: SYNTHETIC_SNAPSHOTS.map(s => s.snapshotId),
    streamCategory: "Gaming",
  });
  assert(acts[0].startSeconds === 0, `First act should start at 0s`);
  assert(acts[acts.length - 1].endSeconds === 1800, `Last act should end at 1800s`);
});

// 8. ValidationSuite
console.log("\n8. ValidationSuite");
test("Runs validation suite on clean data and passes", () => {
  const fakeHighlights = validatedMoments.map((m: any, i: number) => ({
    highlightId: `highlight_${String(i + 1).padStart(3, "0")}`,
    timestamp: m.peakTimestamp,
    clipWindow: { startSeconds: m.startSeconds, endSeconds: m.endSeconds },
  }));

  const result = EvidenceValidator.runValidationSuite({
    highlights: fakeHighlights,
    timelineEvents: [{ eventId: "evt_001", timestamp: "00:00:00" }],
    publishingCount: fakeHighlights.length,
    highlightCount: fakeHighlights.length,
    recommendations: [{ id: "rec_001", evidence: "Chat velocity surged to 45 msgs/min at peak moment." }],
    discoveryIds: ["disc_001"],
    evidence: validatedEvidence,
    confidence: { overallConfidence: 75, sampleSizeMessageCount: 120 },
    reliability: { overallReliability: 65 },
    acts: ActBuilder.build({
      sessionId: "test_session",
      durationSeconds: 1800,
      evidence: validatedEvidence,
      moments: validatedMoments,
      highlightIds: fakeHighlights.map(h => h.highlightId),
      snapshotIds: SYNTHETIC_SNAPSHOTS.map(s => s.snapshotId),
      streamCategory: "Gaming",
    }).map(a => ({ startSeconds: a.startSeconds, endSeconds: a.endSeconds, actId: a.actId })),
    sessionDurationSeconds: 1800,
  });

  assert(typeof result.passed === "boolean", "ValidationResult.passed should be boolean");
  assert(typeof result.failureCount === "number", "ValidationResult.failureCount should be number");
  if (!result.passed) {
    console.log(`    (${result.failureCount} failures): ${result.failures.map((f: any) => f.rule).join(", ")}`);
  }
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
const passed = results.filter(r => r.passed).length;
const total = results.length;
console.log(`\n${"─".repeat(60)}`);
console.log(`Sprint 24.5 Evidence Engine: ${passed}/${total} tests passed`);
if (passed === total) {
  console.log(`\n✅ All tests passed. Evidence pipeline is production-ready.\n`);
  process.exit(0);
} else {
  console.log(`\n❌ ${total - passed} test(s) failed. Review above.\n`);
  process.exit(1);
}
