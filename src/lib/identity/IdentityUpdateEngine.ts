import { SessionIntelligence } from "@/lib/intelligence/canonicalTypes";
import { connectToDatabase } from "@/lib/mongodb";
import { evolveCreatorDNAFromSession } from "@/lib/creatorDNA/CreatorDNAUpdater";
import { evolveMissionFromSession } from "@/lib/creatorMission/MissionUpdater";
import { updateKnowledgeGraphFromVerifiedSession } from "@/lib/creatorKnowledge/sessionKnowledgeUpdater";

const dnaCollection = "creator_dna";
const missionCollection = "creator_mission";
const graphCollection = "creator_knowledge_graph";
const brainCollection = "creator_brain";
const evolutionCollection = "creator_evolution";

export class IdentityUpdateEngine {
  static async processSession(creatorId: string, session: SessionIntelligence): Promise<void> {
    const { db } = await connectToDatabase();
    const nowStr = new Date().toISOString();

    // 1. Evidence Validation (Check reliability & graph evidence)
    const reliability = session.sessionReliability?.overallReliability ?? 0;
    if (!session.evidenceGraph || reliability < 40) {
      console.log(`[IdentityUpdateEngine] Session ${session.sessionId} skipped: low reliability (${reliability}%).`);
      return;
    }

    const validatedEvidence = session.evidenceGraph.evidence.filter((item) => item.confidence >= 50);
    if (validatedEvidence.length === 0) {
      console.log(`[IdentityUpdateEngine] Session ${session.sessionId} skipped: no validated evidence with confidence >= 50.`);
      return;
    }

    console.log(`[IdentityUpdateEngine] Processing session ${session.sessionId} for creator ${creatorId}...`);

    // 2. Knowledge Graph Update
    await updateKnowledgeGraphFromVerifiedSession(creatorId, session);

    // 3. Creator DNA Update (Evolve)
    const currentDNA = await db.collection(dnaCollection).findOne({ creatorId });
    if (currentDNA) {
      const updatedDNA = evolveCreatorDNAFromSession(currentDNA as any, session);
      // Bump version (Part 3)
      updatedDNA.version = (currentDNA.version || 1) + 1;
      updatedDNA.updatedAt = nowStr;
      
      // Update overall confidence based on observed count (Part 7)
      if (updatedDNA.observedStreams > 0 && updatedDNA.domainConfidence) {
        // Naturally raise domain-specific confidence
        updatedDNA.domainConfidence.audienceUnderstanding = Math.min(95, 18 + updatedDNA.observedStreams * 7);
        updatedDNA.domainConfidence.humorStyle = Math.min(95, 24 + updatedDNA.observedStreams * 5);
        updatedDNA.domainConfidence.editingStyle = Math.min(95, 12 + updatedDNA.observedStreams * 8);
        updatedDNA.domainConfidence.relationshipConfidence = Math.min(95, 5 + updatedDNA.observedStreams * 6);
      }
      
      await db.collection(dnaCollection).updateOne({ creatorId }, { $set: updatedDNA });
    }

    // 4. Mission Update (Evolve)
    const currentMission = await db.collection(missionCollection).findOne({ creatorId });
    if (currentMission) {
      const updatedMission = evolveMissionFromSession(currentMission as any, session);
      updatedMission.version = String(Number(currentMission.version || "1") + 1);
      updatedMission.updatedAt = nowStr;
      await db.collection(missionCollection).updateOne({ creatorId }, { $set: updatedMission });
    }

    // 5. Creator Brain Update (Part 9 — Relationship Stage)
    const currentBrain = await db.collection(brainCollection).findOne({ creatorId });
    if (currentBrain) {
      const streamsObserved = (currentBrain.streamsObserved || 0) + 1;
      
      // Determine Relationship Stage (Part 9)
      let relationshipLevel = "NEW_CREATOR";
      if (streamsObserved >= 16) relationshipLevel = "LONG_TERM_PARTNER";
      else if (streamsObserved >= 9) relationshipLevel = "TRUSTED";
      else if (streamsObserved >= 4) relationshipLevel = "UNDERSTANDING";
      else if (streamsObserved >= 1) relationshipLevel = "LEARNING";

      const overallConfidence = Math.min(95, 18 + streamsObserved * 5);

      await db.collection(brainCollection).updateOne(
        { creatorId },
        {
          $set: {
            status: relationshipLevel === "NEW_CREATOR" ? "LEARNING" : "UNDERSTANDING",
            relationshipLevel,
            streamsObserved,
            overallConfidence,
            lastUpdated: nowStr,
          },
        }
      );
    }

    // 6. Evolution Entry (Part 6)
    const streamsCount = currentDNA ? (currentDNA.observedStreams || 0) + 1 : 1;
    const evolutionEntry = {
      creatorId,
      day: streamsCount,
      eventType: "Stream Observed",
      description: `Monitored stream session ${session.sessionId} completed. Creator DNA and Mission evolved.`,
      source: ["monitored_stream", "verified_session"],
      confidence: Math.min(95, 32 + streamsCount * 4),
      timestamp: nowStr,
    };
    await db.collection(evolutionCollection).insertOne(evolutionEntry);
  }
}
