import clientPromise from "./mongodb";

export interface AnalysisJob {
  _id?: string;
  id: string; // unique UUID string
  creatorEmail: string;
  platform: "youtube" | "kick";
  videoId: string;
  videoUrl: string;
  title: string;
  thumbnailUrl: string;
  status: "QUEUED" | "SCRAPING" | "ANALYZING" | "COMPLETED" | "FAILED";
  progressMessage: string;
  error?: string;
  analysis?: {
    sentiment: { positive: number; neutral: number; negative: number };
    vibe: string;
    questions: string[];
    highlights: { time: string; reason: string }[];
    strategicTips: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export async function getJobsCollection() {
  const client = await clientPromise;
  const db = client.db();
  const collection = db.collection<AnalysisJob>("analysis_jobs");
  
  // Create indexes for fast quota lookup & auto-expiration
  try {
    await collection.createIndex({ creatorEmail: 1, createdAt: -1 });
    await collection.createIndex({ id: 1 }, { unique: true });
    // Expire jobs after 30 days to keep MongoDB M0 free tier storage small
    await collection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });
  } catch (err) {
    // Ignore index creation errors during builds
  }

  return collection;
}

// Check how many videos creator has analyzed in the last 24 hours (Max 2 allowed)
export async function getDailyQuotaUsage(creatorEmail: string): Promise<number> {
  try {
    const collection = await getJobsCollection();
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const count = await collection.countDocuments({
      creatorEmail,
      createdAt: { $gte: twentyFourHoursAgo },
      status: { $ne: "FAILED" } // Don't count failed jobs against their quota
    });

    return count;
  } catch (error) {
    console.error("Error checking daily quota usage:", error);
    return 0;
  }
}

export async function createAnalysisJob(data: Omit<AnalysisJob, "_id" | "createdAt" | "updatedAt">): Promise<AnalysisJob> {
  const collection = await getJobsCollection();
  const now = new Date().toISOString();
  
  const job: AnalysisJob = {
    ...data,
    createdAt: now,
    updatedAt: now
  };

  await collection.insertOne(job as any);
  return job;
}

export async function updateAnalysisJobStatus(
  id: string,
  updates: {
    status?: AnalysisJob["status"];
    progressMessage?: string;
    error?: string;
    analysis?: AnalysisJob["analysis"];
    title?: string;
    thumbnailUrl?: string;
  }
) {
  try {
    const collection = await getJobsCollection();
    const updatedAt = new Date().toISOString();

    await collection.updateOne(
      { id },
      {
        $set: {
          ...updates,
          updatedAt
        }
      }
    );
  } catch (error) {
    console.error(`Failed to update status for job ${id}:`, error);
  }
}

export async function getJobById(id: string): Promise<AnalysisJob | null> {
  try {
    const collection = await getJobsCollection();
    const job = await collection.findOne({ id }, { projection: { _id: 0 } });
    return job;
  } catch (error) {
    console.error(`Error fetching job ${id}:`, error);
    return null;
  }
}

export async function getCreatorJobHistory(creatorEmail: string, limit = 5): Promise<AnalysisJob[]> {
  try {
    const collection = await getJobsCollection();
    const jobs = await collection
      .find({ creatorEmail, status: "COMPLETED" }, { projection: { _id: 0 } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return jobs;
  } catch (error) {
    console.error("Error fetching creator job history:", error);
    return [];
  }
}
