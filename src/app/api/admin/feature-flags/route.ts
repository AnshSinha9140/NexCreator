import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import clientPromise from "@/lib/mongodb";

const DEFAULT_FLAGS = [
  {
    key: "ai_copilot_enabled",
    name: "AI Copilot Engine",
    description: "Enables event-driven AI Copilot recommendations during live streams",
    enabled: true,
    rolloutPercentage: 100,
    category: "Core Features",
  },
  {
    key: "executive_reports_enabled",
    name: "Executive Reports",
    description: "Generates post-stream executive reports automatically on stream completion",
    enabled: true,
    rolloutPercentage: 100,
    category: "Core Features",
  },
  {
    key: "rule_engine_enabled",
    name: "Heuristic Rule Engine",
    description: "Runs local rule engine evaluation before invoking LLMs",
    enabled: true,
    rolloutPercentage: 100,
    category: "AI Optimization",
  },
  {
    key: "groq_fallback_enabled",
    name: "Groq Llama 3.3 Failover",
    description: "Automatically failover to Groq when Gemini API is rate-limited or fails",
    enabled: true,
    rolloutPercentage: 100,
    category: "AI Infrastructure",
  },
  {
    key: "event_driven_mode",
    name: "Event-Driven Sampling",
    description: "Reduces Gemini API calls by 80-95% using event detection triggers",
    enabled: true,
    rolloutPercentage: 100,
    category: "AI Optimization",
  },
  {
    key: "budget_manager_enabled",
    name: "AI Budget Manager",
    description: "Enforces rate limits and daily cost caps per creator tier",
    enabled: true,
    rolloutPercentage: 100,
    category: "AI Infrastructure",
  },
];

export async function GET(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "nexcreator");
    const storedFlags = await db.collection("feature_flags").find({}).toArray();

    if (storedFlags.length === 0) {
      // Seed default flags into DB
      const seeded = DEFAULT_FLAGS.map((f) => ({
        ...f,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      await db.collection("feature_flags").insertMany(seeded);
      return NextResponse.json({ success: true, data: seeded });
    }

    const formatted = storedFlags.map((f) => ({
      id: f._id?.toString() || f.key,
      key: f.key,
      name: f.name || f.key,
      description: f.description || "",
      enabled: f.enabled ?? true,
      rolloutPercentage: f.rolloutPercentage ?? 100,
      category: f.category || "General",
      updatedAt: f.updatedAt,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (e: any) {
    return NextResponse.json({ success: true, data: DEFAULT_FLAGS });
  }
}

export async function POST(request: NextRequest) {
  const auth = await verifyAdminSession(request);
  if (!auth.authorized) return auth.errorResponse!;

  try {
    const { key, enabled, rolloutPercentage } = await request.json();

    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB_NAME || "nexcreator");
    await db.collection("feature_flags").updateOne(
      { key },
      { $set: { enabled, rolloutPercentage, updatedAt: new Date().toISOString() } },
      { upsert: true }
    );

    // Record audit log
    await db.collection("admin_audit_logs").insertOne({
      timestamp: new Date().toISOString(),
      admin: auth.user?.email || "admin@nexcreator.com",
      action: "Feature Flag Updated",
      target: key,
      reason: `Set enabled=${enabled}, rolloutPercentage=${rolloutPercentage}%`,
      metadata: { key, enabled, rolloutPercentage },
    });

    return NextResponse.json({ success: true, message: `Feature flag '${key}' updated.` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
