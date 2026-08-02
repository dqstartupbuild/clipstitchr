import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";

const inventoryScanLimit = 10_000;

export const getPostBridgeCutoverInventory = query({
  args: {
    secret: v.string(),
  },
  handler: async (ctx, { secret }) => {
    assertRateLimitApiSecret(secret);

    const [settings, mappings, stitches, swipes] = await Promise.all([
      ctx.db.query("postBridgeSettings").take(inventoryScanLimit + 1),
      ctx.db
        .query("postBridgePostProductMappings")
        .take(inventoryScanLimit + 1),
      ctx.db.query("stitches").take(inventoryScanLimit + 1),
      ctx.db.query("swipes").take(inventoryScanLimit + 1),
    ]);
    const postReferences = [
      ...stitches.flatMap((stitch) => stitch.postBridgePosts ?? []),
      ...swipes.flatMap((swipe) => swipe.postBridgePosts ?? []),
    ];
    const statusCounts = {
      failed: 0,
      posted: 0,
      processing: 0,
      scheduled: 0,
    };
    const nowEpochMs = Date.now();
    const futureScheduleTimes: string[] = [];
    const processingUpdateTimes: string[] = [];

    for (const postReference of postReferences) {
      statusCounts[postReference.status] += 1;

      if (
        postReference.status === "scheduled" &&
        postReference.scheduledAt &&
        Date.parse(postReference.scheduledAt) > nowEpochMs
      ) {
        futureScheduleTimes.push(postReference.scheduledAt);
      }

      if (postReference.status === "processing") {
        processingUpdateTimes.push(postReference.updatedAt);
      }
    }

    futureScheduleTimes.sort();
    processingUpdateTimes.sort();

    return {
      auditedAt: new Date(nowEpochMs).toISOString(),
      earliestFutureSchedule: futureScheduleTimes[0] ?? null,
      futureScheduledReferences: futureScheduleTimes.length,
      latestFutureSchedule: futureScheduleTimes.at(-1) ?? null,
      mappingsCount: Math.min(mappings.length, inventoryScanLimit),
      newestProcessingUpdate: processingUpdateTimes.at(-1) ?? null,
      oldestProcessingUpdate: processingUpdateTimes[0] ?? null,
      scanLimit: inventoryScanLimit,
      settingsCount: Math.min(settings.length, inventoryScanLimit),
      statusCounts,
      stitchRecordsWithPostBridgeHistory: stitches.filter(
        (stitch) => (stitch.postBridgePosts?.length ?? 0) > 0,
      ).length,
      swipeRecordsWithPostBridgeHistory: swipes.filter(
        (swipe) => (swipe.postBridgePosts?.length ?? 0) > 0,
      ).length,
      totalPostReferences: postReferences.length,
      truncated:
        settings.length > inventoryScanLimit ||
        mappings.length > inventoryScanLimit ||
        stitches.length > inventoryScanLimit ||
        swipes.length > inventoryScanLimit,
    };
  },
});
