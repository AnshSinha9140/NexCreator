/**
 * End-to-End Pipeline Test
 * Simulates chat messages flowing through: Buffer → Accumulator → Snapshot Engine
 * Run: node test-e2e-pipeline.js
 */

const { RollingSessionBuffer } = require('./src/lib/ingestion/buffer.ts');
const { LiveMetricsAccumulator } = require('./src/lib/ingestion/accumulator.ts');

// Mock session
const sessionId = 'test-session-001';

const buffer = new RollingSessionBuffer(sessionId);
const accumulator = new LiveMetricsAccumulator(sessionId);

// Simulate 10 live chat messages
const fakeMessages = [
  { id: 'msg1', content: 'PogChamp PogChamp PogChamp let\'s go!', username: 'viewer1' },
  { id: 'msg2', content: 'what game is this?', username: 'viewer2' },
  { id: 'msg3', content: 'OMEGALUL', username: 'viewer3' },
  { id: 'msg4', content: 'first time watching this stream, looks cool', username: 'viewer4' },
  { id: 'msg5', content: 'how long have you been streaming?', username: 'viewer5' },
  { id: 'msg6', content: 'LET\'S GO LET\'S GO LET\'S GO LET\'S GO', username: 'viewer6' },
  { id: 'msg7', content: 'LET\'S GO LET\'S GO LET\'S GO LET\'S GO', username: 'viewer7' },
  { id: 'msg8', content: 'clip that clip that clip that clip that', username: 'viewer8' },
  { id: 'msg9', content: 'clip that clip that clip that clip that', username: 'viewer9' },
  { id: 'msg10', content: 'This is actually a really interesting game mechanic, I wonder how the AI handles the edge cases', username: 'viewer10' },
];

console.log(`\n=== E2E Pipeline Test ===\n`);
console.log(`Injecting ${fakeMessages.length} messages into buffer...`);

for (const raw of fakeMessages) {
  const msg = {
    id: raw.id,
    sessionId,
    platform: 'kick',
    timestamp: new Date(),
    author: { id: raw.id, username: raw.username, displayName: raw.username, badges: [] },
    message: raw.content,
    emotes: [],
  };
  buffer.add(msg);
  accumulator.processMessage(msg);
}

const messages = buffer.getMessages();
const summary = accumulator.getMetricsSummary();

console.log(`\n✅ Buffer contains ${messages.length} messages`);
console.log(`\n📊 Metrics Summary:`);
console.log(`  totalMessages: ${summary.totalMessages}`);
console.log(`  messagesPerMinute: ${summary.messagesPerMinute}`);
console.log(`  uniqueChattersCount: ${summary.uniqueChattersCount}`);
console.log(`  questionCount: ${summary.questionCount}`);
console.log(`  avgLength: ${summary.messageLengthStats.avgLength}`);
console.log(`  topWords: ${JSON.stringify(summary.topWords.slice(0, 5))}`);

// Simulate selectRepresentativeMessages
const { selectRepresentativeMessages } = require('./src/lib/snapshot/selector.ts');
const reps = selectRepresentativeMessages(messages, 15);

console.log(`\n📝 Representative Messages (${reps.length}):`);
for (const r of reps) {
  console.log(`  [${r.category}] ${r.author.username}: "${r.text}"`);
}

if (reps.length === 0) {
  console.log(`\n❌ PROBLEM: 0 representative messages selected!`);
} else {
  console.log(`\n✅ Pipeline is working correctly — messages ARE flowing to snapshot`);
}
