import { v } from "convex/values";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { query, type QueryCtx } from "../_generated/server";

async function getSourceName(
  ctx: QueryCtx,
  ownerId: string,
  sourceId: string,
  sourceType: "stitch" | "swipe",
) {
  const tableName = sourceType === "stitch" ? "stitchCards" : "swipeCards";
  const source = await ctx.db
    .query(tableName)
    .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", sourceId))
    .unique();

  return source?.name;
}

export const listCliQueueSourceSummaries = query({
  args: {
    ownerId: v.string(),
    postIds: v.array(v.string()),
    secret: v.string(),
  },
  handler: async (ctx, { ownerId, postIds, secret }) => {
    assertRateLimitApiSecret(secret);

    const uniquePostIds = [...new Set(postIds)].slice(0, 100);
    const summaries = [];

    for (const postId of uniquePostIds) {
      const mapping = await ctx.db
        .query("postBridgePostProductMappings")
        .withIndex("by_owner_post", (q) =>
          q.eq("ownerId", ownerId).eq("postId", postId),
        )
        .unique();

      if (!mapping) {
        continue;
      }

      const product = await ctx.db
        .query("productCards")
        .withIndex("by_owner_id", (q) =>
          q.eq("ownerId", ownerId).eq("id", mapping.productId),
        )
        .unique();

      summaries.push({
        postId,
        productId: mapping.productId,
        productName: product?.name,
        sourceId: mapping.sourceId,
        sourceName: await getSourceName(
          ctx,
          ownerId,
          mapping.sourceId,
          mapping.sourceType,
        ),
        sourceType: mapping.sourceType,
      });
    }

    return summaries;
  },
});
