export interface CreatorIdentity {
  name: string;
  platforms: string[];
  category: string;
  contentArchetype: string; // e.g. "Multiplayer Social RP" rather than just "GTA 5"
  identity: string;
  brandTone: string;
  lifecyclePhase?: string;
}

export interface LiveMonitoringBaselines {
  averageChatVelocityMsgsPerMin: number;
  typicalFatiguePointHours: number;
  highEngagementTriggers: string[];
  dropoffTriggers: string[];
}

export interface ArchetypeCrossPollination {
  sourceGameOrCreator: string;
  winningStrategy: string;
  applicableToCreator: string;
}

export interface EvidenceItem {
  title: string;
  classification: "Core Strength" | "Growth Driver" | "Retention Bottleneck" | "Audience Friction" | "Risk";
  evidence: string;
  reasoning: string;
}

export interface Stage1Extraction {
  creator: CreatorIdentity;
  liveMonitoringBaselines: LiveMonitoringBaselines;
  archetypeCrossPollination: ArchetypeCrossPollination[];
  strengths: EvidenceItem[];
  weaknesses: EvidenceItem[];
  risks: string[];
}

export interface ExecutiveLetter {
  opening: string;
  bodyParagraphs: string[];
  closingCommitment: string;
}

export interface ArchetypeStrategy {
  primaryArchetype: string;
  recommendedCrossOverFormats: string[];
}

export interface GrowthPhaseItem {
  phase: string; // e.g. "Days 1-30: Identity Anchor"
  actionItem: string;
  evidenceJustification: string;
}

export interface GrowthRoadmap {
  ninetyDayPlan: GrowthPhaseItem[];
  oneYearVision: string;
}

export interface Stage2Strategy {
  executiveLetter: ExecutiveLetter;
  archetypeStrategy: ArchetypeStrategy;
  growthRoadmap: GrowthRoadmap;
  liveMonitoringRules: string[];
}

export interface CreatorIntelligenceBundle {
  id?: string;
  userId: string;
  creatorEmail: string;
  creatorName: string;
  generatedAt: string;
  stage1: Stage1Extraction;
  stage2: Stage2Strategy;
}

export interface GenerateIntelligencePayload {
  userId?: string;
  creatorName: string;
  creatorEmail: string;
  kickUrl?: string;
  youtubeUrl?: string;
  vodTranscriptsSummary?: string;
}
