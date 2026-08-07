const delay = (ms) => new Promise((res) => setTimeout(res, ms));

async function runMetaRefresh() {
  const appUrl = (process.env.APP_URL || "http://localhost:3000").replace(/\/$/, "");
  const cronSecret = process.env.CRON_SECRET || "";

  console.log(`[Meta Refresh Orchestrator] Starting weekly refresh batch against: ${appUrl}`);

  const headers = {
    "Content-Type": "application/json",
    ...(cronSecret ? { Authorization: `Bearer ${cronSecret}` } : {}),
  };

  try {
    // 1. Fetch list of eligible creators
    const listResponse = await fetch(`${appUrl}/api/intelligence/refresh-list`, {
      method: "GET",
      headers,
    });

    if (!listResponse.ok) {
      const errorText = await listResponse.text();
      throw new Error(`Failed to fetch creator refresh list (${listResponse.status}): ${errorText}`);
    }

    const listData = await listResponse.json();
    const creators = listData.creators || [];

    console.log(`[Meta Refresh Orchestrator] Found ${creators.length} eligible creator(s) for refresh.`);

    if (creators.length === 0) {
      console.log("[Meta Refresh Orchestrator] No creators to update. Job complete.");
      return;
    }

    let successCount = 0;
    let failCount = 0;

    // 2. Iterate through creators and trigger single refresh
    for (const item of creators) {
      const creatorId = item.creatorId || item.id;
      console.log(`[Meta Refresh Orchestrator] Triggering refresh for creator: ${creatorId} (${item.creatorName || "N/A"})...`);

      try {
        const refreshResponse = await fetch(`${appUrl}/api/intelligence/refresh-single`, {
          method: "POST",
          headers,
          body: JSON.stringify({ creatorId }),
        });

        if (refreshResponse.ok) {
          const result = await refreshResponse.json();
          console.log(`[Meta Refresh Orchestrator] ✅ Success for ${creatorId}: Phase updated to "${result.updatedLifecyclePhase}"`);
          successCount++;
        } else {
          const errText = await refreshResponse.text();
          console.error(`[Meta Refresh Orchestrator] ❌ Failed for ${creatorId} (${refreshResponse.status}): ${errText}`);
          failCount++;
        }
      } catch (singleErr) {
        console.error(`[Meta Refresh Orchestrator] ❌ Error refreshing creator ${creatorId}:`, singleErr.message);
        failCount++;
      }

      // 3. Pause for 2000ms between requests to prevent rate-limiting
      console.log("[Meta Refresh Orchestrator] Waiting 2000ms before next request...");
      await delay(2000);
    }

    console.log(`\n[Meta Refresh Orchestrator] Weekly batch execution finished.`);
    console.log(`Total: ${creators.length} | Succeeded: ${successCount} | Failed: ${failCount}`);

    if (failCount > 0 && successCount === 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error("[Meta Refresh Orchestrator Fatal Error]:", error.message);
    process.exit(1);
  }
}

runMetaRefresh();
