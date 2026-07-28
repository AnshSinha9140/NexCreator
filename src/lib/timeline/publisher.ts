import clientPromise from "@/lib/mongodb";
import { SupportedPlatform } from "@/types";

export interface TimelineEventDoc {
  id: string;
  sessionId: string;
  platform: SupportedPlatform;
  eventType: string;
  title: string;
  description: string;
  severity: "info" | "success" | "warning" | "error";
  details?: Record<string, any>;
  timestamp: string;
}

export class TimelinePublisher {
  public static async publish(
    sessionId: string,
    platform: SupportedPlatform,
    eventType: string,
    title: string,
    description: string,
    severity: "info" | "success" | "warning" | "error" = "info",
    details?: Record<string, any>
  ): Promise<TimelineEventDoc | null> {
    const eventDoc: TimelineEventDoc = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      sessionId,
      platform,
      eventType,
      title,
      description,
      severity,
      details: details || {},
      timestamp: new Date().toISOString(),
    };

    try {
      const client = await clientPromise;
      const db = client.db("nexcreator");
      await db.collection("timeline_events").insertOne(eventDoc);
      console.log(`[TimelinePublisher] Published '${title}' event for session '${sessionId}' ✅`);
      return eventDoc;
    } catch (err: any) {
      console.warn(`[TimelinePublisher] Failed to persist timeline event for session '${sessionId}':`, err.message);
      return null;
    }
  }
}
