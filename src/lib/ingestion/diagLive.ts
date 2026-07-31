import fs from "fs";
import path from "path";

try {
  const envPath = path.join(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    envContent.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const eqIdx = trimmed.indexOf("=");
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim();
          process.env[key] = val;
        }
      }
    });
  }
} catch (e) {}

async function checkSnapshots() {
  const { MongoClient } = await import("mongodb");
  const client = new MongoClient(process.env.MONGODB_URI!);
  await client.connect();
  const db = client.db("nexcreator");

  const snap = await db.collection("pulse_snapshots").findOne(
    {},
    { sort: { createdAt: -1 } }
  );

  if (!snap) {
    console.log("❌ No snapshots found.");
  } else {
    console.log("\n=== Latest Pulse Snapshot ===");
    console.log("Session:", snap.sessionId);
    console.log("Window:", snap.windowStart, "->", snap.windowEnd);
    console.log("Messages:", snap.metrics?.totalMessages);
    console.log("\n--- Analytics field ---");
    console.log(JSON.stringify(snap.analytics, null, 2));
    console.log("\n--- Representative messages (first 3) ---");
    (snap.representativeMessages || []).slice(0, 3).forEach((m: any) => {
      console.log(`  @${m.author?.username || "?"}: ${m.message || m.displayText}`);
    });
  }

  await client.close();
  process.exit(0);
}

checkSnapshots().catch(console.error);
