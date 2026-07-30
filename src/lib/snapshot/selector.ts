import { LiveChatMessage } from "@/lib/ingestion/types";
import { RepresentativeMessage } from "./types";

const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;

export function selectRepresentativeMessages(
  messages: LiveChatMessage[],
  maxCount: number = 15
): RepresentativeMessage[] {
  if (messages.length === 0) return [];

  const selectedIds = new Set<string>();
  const result: RepresentativeMessage[] = [];

  const toRepresentative = (
    msg: LiveChatMessage,
    category: RepresentativeMessage["category"]
  ): RepresentativeMessage => ({
    messageId: msg.id,
    timestamp: msg.timestamp,
    author: {
      username: msg.author.username,
      displayName: msg.author.displayName,
      badges: msg.author.badges || [],
    },
    text: (msg as any).semanticText || msg.message,
    category,
  });


  // 1. Identify Questions (up to 4)
  const questions = messages.filter((m) => {
    const text = m.message.trim();
    return text.endsWith("?") || /^(who|what|why|how|when|where|is|are|can|will|should)\b/i.test(text);
  });
  for (let i = 0; i < Math.min(4, questions.length); i++) {
    const q = questions[i];
    if (!selectedIds.has(q.id)) {
      selectedIds.add(q.id);
      result.push(toRepresentative(q, "question"));
    }
  }

  // 2. Identify Reaction / Emoji Hype Messages (up to 4)
  const reactionEmoji = messages.filter((m) => {
    const text = m.message;
    const matches = text.match(EMOJI_REGEX) || [];
    return matches.length >= 2 || (m.emotes && m.emotes.length > 0);
  });
  for (let i = 0; i < Math.min(4, reactionEmoji.length); i++) {
    const r = reactionEmoji[i];
    if (!selectedIds.has(r.id)) {
      selectedIds.add(r.id);
      result.push(toRepresentative(r, "reaction_emoji"));
    }
  }

  // 3. Identify Long-Form Detailed Messages (up to 3)
  const longForm = messages.filter((m) => m.message.length >= 60);
  for (let i = 0; i < Math.min(3, longForm.length); i++) {
    const l = longForm[i];
    if (!selectedIds.has(l.id)) {
      selectedIds.add(l.id);
      result.push(toRepresentative(l, "long_form"));
    }
  }

  // 4. Identify Repeated Spam / Copypasta (up to 2)
  const textFrequency = new Map<string, LiveChatMessage[]>();
  for (const m of messages) {
    const norm = m.message.trim().toLowerCase();
    if (norm.length > 3) {
      if (!textFrequency.has(norm)) textFrequency.set(norm, []);
      textFrequency.get(norm)!.push(m);
    }
  }
  const repeatedBatches = Array.from(textFrequency.values())
    .filter((batch) => batch.length >= 2)
    .sort((a, b) => b.length - a.length);

  for (let i = 0; i < Math.min(2, repeatedBatches.length); i++) {
    const repMsg = repeatedBatches[i][0];
    if (repMsg && !selectedIds.has(repMsg.id)) {
      selectedIds.add(repMsg.id);
      result.push(toRepresentative(repMsg, "repeated_spam"));
    }
  }

  // 5. Fill Remaining Slots with Evenly Sampled General Messages
  const unselected = messages.filter((m) => !selectedIds.has(m.id));
  const remainingSlots = maxCount - result.length;

  if (remainingSlots > 0 && unselected.length > 0) {
    const step = Math.max(1, Math.floor(unselected.length / remainingSlots));
    for (let i = 0; i < unselected.length && result.length < maxCount; i += step) {
      const g = unselected[i];
      if (!selectedIds.has(g.id)) {
        selectedIds.add(g.id);
        result.push(toRepresentative(g, "general"));
      }
    }
  }

  // Sort by timestamp ascending for coherent temporal timeline
  return result.sort((a, b) => {
    const tA = new Date(a.timestamp).getTime();
    const tB = new Date(b.timestamp).getTime();
    return tA - tB;
  });
}
