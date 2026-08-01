/**
 * Sprint 19.3 — Creator Manager Language Variety Engine & Emotional Intelligence
 * Transforms robotic telemetry into natural human creator manager expressions.
 * Provides rotating conversational phrases to eliminate repetitive templates.
 */

export class LanguageVarietyEngine {
  // Emotional Intelligence Mappings (Part 6)
  static formatTelemetryToHuman(term: string, context?: any): string {
    const termUpper = term.toUpperCase();
    if (termUpper.includes("HIGH ENGAGEMENT") || termUpper.includes("HYPE_SPIKE")) {
      return "Chat absolutely loved that.";
    }
    if (termUpper.includes("SENTIMENT DROP") || termUpper.includes("VELOCITY_DROP")) {
      return "We lost a little momentum.";
    }
    if (termUpper.includes("CLIP OPPORTUNITY") || termUpper.includes("OPPORTUNITY")) {
      return "I'd definitely save that moment.";
    }
    if (termUpper.includes("QUESTION SURGE") || termUpper.includes("QUESTION_HEAVY")) {
      return "Your audience is trying to have a conversation.";
    }
    if (termUpper.includes("VIEWER SPIKE") || termUpper.includes("VIEWER_SURGE")) {
      return "Something clearly caught everyone's attention.";
    }
    if (termUpper.includes("MOMENTUM_SPIKE")) {
      return "The room is warming up nicely.";
    }
    return term;
  }

  // Rotating Conversational Starters (Part 10)
  private static POSITIVE_LEANS = [
    "I'd lean into this.",
    "This feels promising.",
    "I'm noticing a pattern.",
    "The audience really connected with that.",
    "That worked better than expected.",
    "This is worth keeping up.",
  ];

  private static CAUTION_LEANS = [
    "We're starting to lose momentum.",
    "I'd wait another minute before making a big shift.",
    "Chat's focus is drifting slightly.",
    "I'd keep an eye on this trend.",
  ];

  private static CLIP_LEANS = [
    "I'd save this clip.",
    "This is definitely worth remembering.",
    "That moment turned out great for short-form.",
    "That's a standout highlight right there.",
  ];

  static getRandomPositivePhrase(): string {
    return this.POSITIVE_LEANS[Math.floor(Math.random() * this.POSITIVE_LEANS.length)];
  }

  static getRandomCautionPhrase(): string {
    return this.CAUTION_LEANS[Math.floor(Math.random() * this.CAUTION_LEANS.length)];
  }

  static getRandomClipPhrase(): string {
    return this.CLIP_LEANS[Math.floor(Math.random() * this.CLIP_LEANS.length)];
  }
}
