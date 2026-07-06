import { v } from "convex/values";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { query } from "../_generated/server";
import { cliLibraryListLimit } from "./cliLibraryListLimit";

export const listCliStitches = query({
  args: {
    limit: v.optional(v.number()),
    ownerId: v.string(),
    productId: v.optional(v.string()),
    readyOnly: v.optional(v.boolean()),
    secret: v.string(),
  },
  handler: async (
    ctx,
    { limit, ownerId, productId, readyOnly = false, secret },
  ) => {
    assertRateLimitApiSecret(secret);

    const normalizedProductId = productId?.trim() || undefined;
    const requestedLimit =
      Number.isFinite(limit) && limit && limit > 0
        ? Math.min(Math.floor(limit), cliLibraryListLimit)
        : cliLibraryListLimit;
    const stitches = await ctx.db
      .query("stitchCards")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .take(cliLibraryListLimit * 4);

    return stitches
      .filter(
        (stitch) => !normalizedProductId || stitch.productId === normalizedProductId,
      )
      .filter((stitch) => !readyOnly || Boolean(stitch.stitchObject))
      .slice(0, requestedLimit)
      .map((stitch) => ({
        createdAt: stitch.createdAt,
        duration: stitch.duration,
        hasRenderedVideo: Boolean(stitch.stitchObject),
        id: stitch.id,
        isPosted: stitch.isPosted,
        name: stitch.name,
        productId: stitch.productId,
      }));
  },
});
