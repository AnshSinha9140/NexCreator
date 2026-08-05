import { connectToDatabase } from "@/lib/mongodb";
import { CreatorDNA, CreatorDNAFeedback } from "./CreatorDNATypes";

const collectionName = "creator_dna";

export async function getCreatorDNA(creatorId: string): Promise<CreatorDNA | null> {
  const { db } = await connectToDatabase();
  return db.collection<CreatorDNA>(collectionName).findOne({ creatorId });
}

export async function saveCreatorDNA(dna: CreatorDNA): Promise<CreatorDNA> {
  const { db } = await connectToDatabase();
  const updatedAt = new Date().toISOString();
  const next = { ...dna, updatedAt };
  await db.collection<CreatorDNA>(collectionName).updateOne({ creatorId: dna.creatorId }, { $set: next }, { upsert: true });
  return next;
}

export async function recordCreatorDNAFeedback(creatorId: string, feedback: CreatorDNAFeedback): Promise<void> {
  const { db } = await connectToDatabase();
  await db.collection<CreatorDNA>(collectionName).updateOne(
    { creatorId },
    { $push: { feedback: feedback }, $set: { updatedAt: new Date().toISOString() } },
  );
}
