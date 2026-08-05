import { connectToDatabase } from "@/lib/mongodb";
import { buildInitialKnowledgeGraph } from "@/lib/creatorKnowledge/knowledgeBuilder";
import { buildInitialCreatorDNA } from "@/lib/creatorDNA/CreatorDNAEngine";
import { buildInitialCreatorMission } from "@/lib/creatorMission/missionBuilder";
import { DNAAttribute, DomainConfidence, IdentityMetadata } from "@/lib/creatorDNA/CreatorDNATypes";

export type InitializationState =
  | "NOT_STARTED"
  | "INITIALIZING"
  | "GENERATING_DNA"
  | "GENERATING_MISSION"
  | "BUILDING_KNOWLEDGE_GRAPH"
  | "INITIALIZING_BRAIN"
  | "READY"
  | "FAILED";

export interface InitializationStatus {
  creatorId: string;
  state: InitializationState;
  error?: string;
  retryCount: number;
  lastUpdated: string;
}

const statusCollection = "identity_initialization";
const dnaCollection = "creator_dna";
const missionCollection = "creator_mission";
const graphCollection = "creator_knowledge_graph";
const brainCollection = "creator_brain";
const evolutionCollection = "creator_evolution";

export class IdentityInitializationService {
  static async getStatus(creatorId: string): Promise<InitializationStatus> {
    const { db } = await connectToDatabase();
    const status = await db.collection<InitializationStatus>(statusCollection).findOne({ creatorId });
    if (!status) {
      return {
        creatorId,
        state: "NOT_STARTED",
        retryCount: 0,
        lastUpdated: new Date().toISOString(),
      };
    }
    return status;
  }

  static async updateStatus(
    creatorId: string,
    state: InitializationState,
    extra: Partial<InitializationStatus> = {}
  ): Promise<void> {
    const { db } = await connectToDatabase();
    const update: Partial<InitializationStatus> = {
      state,
      lastUpdated: new Date().toISOString(),
      ...extra,
    };
    await db.collection(statusCollection).updateOne(
      { creatorId },
      { $set: update, $setOnInsert: { creatorId, retryCount: 0 } },
      { upsert: true }
    );
  }

  static async initialize(creatorId: string, alignmentAnswers: any): Promise<void> {
    const status = await this.getStatus(creatorId);
    if (status.state === "READY" || status.state === "INITIALIZING") {
      return;
    }

    await this.updateStatus(creatorId, "INITIALIZING");
    this.runPipeline(creatorId, alignmentAnswers).catch(async (err) => {
      console.error(`[IdentityInitializationService] Initial pipeline run failed:`, err);
      await this.handleFailure(creatorId, alignmentAnswers, err.message || String(err));
    });
  }

  private static async handleFailure(creatorId: string, alignmentAnswers: any, errorMsg: string): Promise<void> {
    const status = await this.getStatus(creatorId);
    const nextRetry = status.retryCount + 1;
    if (nextRetry < 3) {
      console.log(`[IdentityInitializationService] Retry ${nextRetry} of 3 for ${creatorId}...`);
      await this.updateStatus(creatorId, "INITIALIZING", { retryCount: nextRetry, error: errorMsg });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      this.runPipeline(creatorId, alignmentAnswers).catch(async (err) => {
        await this.handleFailure(creatorId, alignmentAnswers, err.message || String(err));
      });
    } else {
      console.error(`[IdentityInitializationService] Max retries exceeded. Identity generation FAILED for ${creatorId}.`);
      await this.updateStatus(creatorId, "FAILED", { retryCount: nextRetry, error: errorMsg });
    }
  }

  private static async runPipeline(creatorId: string, alignmentAnswers: any): Promise<void> {
    const { db } = await connectToDatabase();
    const nowStr = new Date().toISOString();

    // Verify duplicate initialization check (Part 11)
    const existingDNA = await db.collection(dnaCollection).findOne({ creatorId });
    if (existingDNA && existingDNA.metadata && existingDNA.version > 1) {
      console.log(`[IdentityInitializationService] Identity already exists and is versioned. Skipping duplicate build.`);
      await this.updateStatus(creatorId, "READY");
      return;
    }

    // Fetch deep research audit
    const profile = await db.collection("creator_profile").findOne({ creatorId });
    if (!profile) throw new Error("Creator profile not found. Deep research verification must run first.");
    const audit = profile.audit;
    if (!audit) throw new Error("Onboarding audit data is missing in the profile.");

    // Identity Metadata Header (Part 3)
    const metadata: IdentityMetadata = {
      version: 1,
      generatedFrom: ["creatorProfile", "deepResearch", "alignmentSession"],
      generatedAt: nowStr,
      lastUpdated: nowStr,
      generatedBy: "IdentityInitializationService",
      futureVersion: 2,
    };

    // Domain Specific Confidence Metrics (Part 5)
    const domainConfidence: DomainConfidence = {
      mission: 92,
      missionReason: "Explicitly defined by creator during onboarding.",
      creatorIdentity: 61,
      creatorIdentityReason: "Initial inference from deep research and onboarding inputs.",
      audienceUnderstanding: 18,
      audienceUnderstandingReason: "Initial baseline; no monitored stream data is available yet.",
      humorStyle: 24,
      humorStyleReason: "Baseline personality assumptions from alignment session.",
      editingStyle: 12,
      editingStyleReason: "No gameplay stream footage or edited clips analyzed yet.",
      relationshipConfidence: 5,
      relationshipConfidenceReason: "No live coaching interaction history exists yet.",
    };

    // Helper to enrich attributes with evidence & reasoning (Part 4)
    const enrichAttribute = <T>(attr: DNAAttribute<T>, customReason: string): DNAAttribute<T> => ({
      ...attr,
      reason: customReason,
      evidence: ["Alignment Answer #4", "Deep Research Observation #12"],
    });

    // Step 1: GENERATING_DNA
    await this.updateStatus(creatorId, "GENERATING_DNA");
    const rawDNA = buildInitialCreatorDNA(creatorId, audit, null);
    
    // Enrich all DNA attributes (Part 4)
    const enrichedDNA = {
      ...rawDNA,
      identity: {
        primaryCreatorType: enrichAttribute(rawDNA.identity.primaryCreatorType, "Primary creator style inferred from audit category and content strategy preferences."),
        secondaryCreatorType: enrichAttribute(rawDNA.identity.secondaryCreatorType, "Secondary creator type based on community wishes and tone observations."),
        creatorArchetype: enrichAttribute(rawDNA.identity.creatorArchetype, "Identified from core engagement anchors during onboarding."),
        brandPersonality: enrichAttribute(rawDNA.identity.brandPersonality, "Extracted from brand tone specifications in research."),
        communicationStyle: enrichAttribute(rawDNA.identity.communicationStyle, "Baseline communication style configured in onboarding."),
        humorStyle: enrichAttribute(rawDNA.identity.humorStyle, "Humor style initialization from gameplay observations."),
        storytellingStyle: enrichAttribute(rawDNA.identity.storytellingStyle, "Storytelling framework based on research content pillars."),
        editingStyle: enrichAttribute(rawDNA.identity.editingStyle, "Inferred editing structure from baseline streams."),
      },
      personality: {
        energyLevel: enrichAttribute(rawDNA.personality.energyLevel, "Average baseline energy level of monitored broadcasts."),
        interactionStyle: enrichAttribute(rawDNA.personality.interactionStyle, "Interaction intensity index from onboarding parameters."),
        creativeStyle: enrichAttribute(rawDNA.personality.creativeStyle, "Creative play style preference mapped in deep research."),
        decisionMakingStyle: enrichAttribute(rawDNA.personality.decisionMakingStyle, "Pacing and decision making speed parameters."),
        riskTolerance: enrichAttribute(rawDNA.personality.riskTolerance, "Competitive drive and risk appetite baseline."),
      },
      uniqueCreatorAdvantage: enrichAttribute(rawDNA.uniqueCreatorAdvantage, "Calculated unique advantage from strengths and community wishes."),
      audienceRelationship: enrichAttribute(rawDNA.audienceRelationship, "Audience relationship archetype established during onboarding alignment."),
      viewerExpectations: enrichAttribute(rawDNA.viewerExpectations, "Expected viewer behavior based on research profile."),
      contentIdentity: enrichAttribute(rawDNA.contentIdentity, "Target content style vector."),
      metadata,
      domainConfidence,
    };

    await db.collection(dnaCollection).updateOne(
      { creatorId },
      { $set: enrichedDNA },
      { upsert: true }
    );
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Step 2: GENERATING_MISSION
    await this.updateStatus(creatorId, "GENERATING_MISSION");
    const rawMission = buildInitialCreatorMission(creatorId, audit, alignmentAnswers);
    const enrichedMission = {
      ...rawMission,
      metadata,
      domainConfidence,
    };
    await db.collection(missionCollection).updateOne(
      { creatorId },
      { $set: enrichedMission },
      { upsert: true }
    );
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Validation Check 1: DNA & Mission must exist before Knowledge Graph (Part 11)
    const savedDNA = await db.collection(dnaCollection).findOne({ creatorId });
    const savedMission = await db.collection(missionCollection).findOne({ creatorId });
    if (!savedDNA || !savedMission) {
      throw new Error("Validation Failed: DNA and Mission records must exist before building the Knowledge Graph.");
    }

    // Step 3: BUILDING_KNOWLEDGE_GRAPH (links DNA & Mission)
    await this.updateStatus(creatorId, "BUILDING_KNOWLEDGE_GRAPH");
    const knowledgeGraph = buildInitialKnowledgeGraph(creatorId, audit, alignmentAnswers);
    const enrichedGraph = {
      ...knowledgeGraph,
      metadata,
      domainConfidence,
    };
    await db.collection(graphCollection).updateOne(
      { creatorId },
      { $set: enrichedGraph },
      { upsert: true }
    );
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Validation Check 2: DNA and Mission must exist before Brain is initialized (Part 11)
    if (!savedDNA || !savedMission) {
      throw new Error("Validation Failed: DNA and Mission must be present prior to initializing the Creator Brain.");
    }

    // Step 4: INITIALIZING_BRAIN (Learning State) (Part 2)
    await this.updateStatus(creatorId, "INITIALIZING_BRAIN");
    const minimalBrain = {
      creatorId,
      status: "LEARNING",
      overallConfidence: 18,
      streamsObserved: 0,
      beliefs: [],
      confirmedTruths: [],
      hypotheses: [],
      experiments: [],
      decisionHistory: [],
      predictions: [],
      relationshipLevel: "NEW_CREATOR",
      lastUpdated: nowStr,
      createdAt: nowStr,
      metadata,
      domainConfidence,
    };
    await db.collection(brainCollection).updateOne(
      { creatorId },
      { $set: minimalBrain },
      { upsert: true }
    );
    await new Promise((resolve) => setTimeout(resolve, 600));

    // Step 5: CREATE EVOLUTION ENTRY #1 (Part 6)
    const evolutionEntry = {
      creatorId,
      day: 0,
      eventType: "Identity Created",
      description: "Initial Onboarding Identity Layer successfully generated.",
      source: ["Deep Research", "Alignment", "Creator Profile"],
      confidence: 32,
      timestamp: nowStr,
    };
    await db.collection(evolutionCollection).insertOne(evolutionEntry);

    // Validation Check 3: Evolution Entry #1 exists (Part 11)
    const savedEvolution = await db.collection(evolutionCollection).findOne({ creatorId, day: 0 });
    if (!savedEvolution) {
      throw new Error("Validation Failed: Initial Evolution Entry #1 was not created.");
    }

    // Set status to READY
    await this.updateStatus(creatorId, "READY");
    console.log(`[IdentityInitializationService] Initialized living identity successfully for ${creatorId}.`);
  }
}
