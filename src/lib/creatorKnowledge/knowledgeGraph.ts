import { connectToDatabase } from "@/lib/mongodb";
import { CreatorKnowledgeGraph } from "./types";

/**
 * Fetch the CreatorKnowledgeGraph for a given creatorId.
 */
export async function getKnowledgeGraph(creatorId: string): Promise<CreatorKnowledgeGraph | null> {
  const { db } = await connectToDatabase();
  const graph = await db.collection("creator_knowledge_graph").findOne({ creatorId });
  return graph as CreatorKnowledgeGraph | null;
}

/**
 * Save/Update the CreatorKnowledgeGraph for a given creatorId.
 */
export async function saveKnowledgeGraph(graph: CreatorKnowledgeGraph): Promise<void> {
  const { db } = await connectToDatabase();
  graph.updatedAt = new Date().toISOString();
  await db.collection("creator_knowledge_graph").updateOne(
    { creatorId: graph.creatorId },
    { $set: graph },
    { upsert: true }
  );
}
