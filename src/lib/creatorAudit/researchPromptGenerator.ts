/**
 * Sprint 20.4 — Creator Deep Research Prompt Generator (Stage 1)
 * Generates structured prompt instructing LLMs (ChatGPT Pro / Gemini Advanced)
 * to conduct deep evidence research across web, YouTube, Kick, Twitch, and comments.
 * Returns ONLY a structured Markdown research document. NO JSON. NO recommendations.
 */

export class ResearchPromptGenerator {
  static generatePrompt(creator: {
    displayName: string;
    email: string;
    kickUrl?: string;
    youtubeUrl?: string;
    notes?: string;
  }): string {
    const name = creator.displayName || creator.email.split("@")[0];
    const kick = creator.kickUrl ? `Kick Channel: ${creator.kickUrl}` : "Kick Channel: None provided";
    const yt = creator.youtubeUrl ? `YouTube Channel: ${creator.youtubeUrl}` : "YouTube Channel: None provided";

    return `System: You are an Elite Creator Intelligence Researcher conducting a Deep Research Briefing on live streamer / content creator "${name}".

Target Creator: ${name}
Email: ${creator.email}
${kick}
${yt}
${creator.notes ? `Additional Notes: ${creator.notes}` : ""}

==================================================
DEEP RESEARCH INSTRUCTIONS (STAGE 1 EVIDENCE GATHERING)
==================================================

Your objective is strictly EVIDENCE GATHERING and DEEP RESEARCH.
Do NOT generate final creator recommendations. Do NOT output JSON.
Do NOT write high-level summary advice.

Search public sources, YouTube channel metrics, Kick chatrooms, Twitch archives, comment sections, stream titles, thumbnail patterns, and social media discussions to construct a comprehensive Markdown Research Document.

REQUIREMENTS:
1. Every claim must be backed by evidence (observed title, viewer comment theme, upload cadence, or chat pattern).
2. For every opinion or observation, explicitly explain WHY (e.g. "The reason I observe this is...").
3. Include specific sections listed below. Do not omit any section.

==================================================
REQUIRED MARKDOWN OUTPUT FORMAT
==================================================

# Deep Research Document: ${name}

## 1. Executive Summary
- Primary category and streaming identity summary.
- Key observation on current growth trajectory and broadcast tone.

## 2. Creator Identity & Content Overview
- Primary Hook & Broadcast Style (e.g., high-octane FPS gamer, chill Q&A host, comedic reactor).
- Upload cadence, stream length patterns, thumbnail & title trends.

## 3. Audience Psychology & Community Culture
- Viewer demographics, core viewer motivations (why do they watch?).
- Community culture, inside jokes, chat memes, chat sentiment velocity.

## 4. Strengths & Unique Advantages
- Top 3 distinct creator strengths with observed evidence.
- Unique positioning vs competitors in the same niche.

## 5. Weaknesses & Vulnerabilities
- Top 3 recurring broadcast bottlenecks (e.g., unread chat bursts during intense gameplay, slow stream start energy).
- Observed viewer complaints or drop-off moments.

## 6. Recurring Themes & Viewer Feedback
- Most common positive chat feedback.
- Most common constructive complaints or requested content changes.

## 7. Content Evolution & Historical Performance
- Most successful content formats (highest CCV / clips).
- Least successful content formats (viewer drop-offs).
- How content has evolved over the past 6-12 months.

## 8. Competitor & Market Positioning
- Similar creators in the niche.
- Key differentiators setting ${name} apart.

## 9. Growth & Monetization Opportunities
- Untapped short-form content opportunities (TikTok/Reels/Shorts).
- Brand sponsorship compatibility & revenue ideas.

## 10. Risk Assessment & Unknown Areas
- Long-term burnout risks or single-game reliance.
- Unknown areas requiring further stream monitoring.

## 11. Evidence Sources & Research Confidence
- List of observed URLs / channels / sources analyzed.
- Overall Research Confidence Score (0-100%).

Return ONLY the complete Markdown document starting with '# Deep Research Document: ${name}'.
`;
  }

  static generateEvidenceExtractionPrompt(creatorName: string, markdownReport: string): string {
    return `You are a Senior Data Engineer and Creator Intelligence Parser.

==================================================
STAGE 2: EVIDENCE EXTRACTION (SCHEMA v2.0)
==================================================

Your task is to extract a compact, machine-readable Evidence JSON object from the Stage 1 Research Report below for creator "${creatorName}".

RULES:
1. Extract facts, evidence, reasoning, and classifications ONLY.
2. Do NOT generate action plans, recommendations, or strategy.
3. Every strength/weakness MUST contain explicit evidence and reasoning.
4. Output ONLY valid JSON matching the exact schema below.

==================================================
ORIGINAL RESEARCH REPORT:
==================================================
${markdownReport}
==================================================

REQUIRED OUTPUT JSON SCHEMA (version: "2.0"):

{
  "version": "2.0",
  "creatorId": "usr_extracted",
  "extractedAt": "${new Date().toISOString()}",
  "creator": {
    "name": "${creatorName}",
    "platforms": ["kick", "youtube"],
    "category": "Gaming & Variety",
    "identity": "Authentic gaming reactor with high-energy chat banter",
    "brandTone": "Relatable, witty, supportive"
  },
  "content": {
    "primaryFormats": ["Live Gameplay", "Interactive Q&A", "Reaction vods"],
    "uploadCadence": "3 streams / week",
    "streamLength": "4-6 hours",
    "titlePatterns": ["Clutch moments", "Unfiltered reactions"],
    "thumbnailPatterns": ["Bold face expressions", "High-contrast action"],
    "historicalChanges": ["Evolved from quiet gaming to active chat Q&A"]
  },
  "audience": {
    "demographics": "Core gaming audience 18-28",
    "motivations": ["Recognition", "Community banter", "Clutch moments"],
    "expectations": ["Immediate chat responses", "Consistent energy"],
    "communityCulture": "High emote usage, friendly trolling, protective",
    "chatPatterns": ["High velocity during Q&A", "Emote bursts on wins"],
    "viewerFeedback": {
      "positive": ["Authentic commentary", "Great chat engagement"],
      "negative": ["Unanswered questions during clutch gameplay"]
    }
  },
  "strengths": [
    {
      "title": "Natural Unscripted Charisma",
      "classification": "Performance",
      "evidence": "Observed high chat velocity during unscripted Q&A commentary",
      "reasoning": "Viewers connect emotionally with spontaneous reactions rather than gameplay mechanics"
    }
  ],
  "weaknesses": [
    {
      "title": "Unanswered Chat Bursts",
      "classification": "Engagement",
      "evidence": "Questions pile up unanswered during intense 10-minute gameplay sequences",
      "reasoning": "Pacing drop-off occurs when high-tier chatters feel unacknowledged"
    }
  ],
  "opportunities": [
    {
      "title": "Short-Form Clip Repurposing",
      "reasoning": "High density of 30-second hilarious reaction spikes ideal for TikTok/Shorts"
    }
  ],
  "risks": [
    {
      "title": "Single-Game Burnout",
      "reasoning": "Heavy reliance on single main title creates audience drop-off risks during meta shifts"
    }
  ],
  "competitors": [
    {
      "name": "Ludwig",
      "difference": "Higher chat-driven Q&A focus and community interactive events"
    }
  ],
  "unknowns": [
    "Sponsor deliverable performance metrics",
    "Secondary social media conversion rate"
  ],
  "questionsForCreator": [
    "What game categories do you enjoy outside your main title?",
    "How much time can you dedicate to short-form video editing each week?"
  ],
  "researchConfidence": {
    "overall": 85,
    "notes": "Solid stream titles, comment sections, and public channel metrics analyzed."
  }
}

Respond ONLY with valid JSON matching the schema above.
`;
  }
}
