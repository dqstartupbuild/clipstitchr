import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertStudioReelBoundedString } from "../studioReel/assertStudioReelBoundedString";
import { getStudioReelAuthenticatedScope } from "../studioReel/getStudioReelAuthenticatedScope";

export const list = query({
  args: {
    productId: v.string(),
    generationRunId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { ownerId, productId } = await getStudioReelAuthenticatedScope(
      ctx,
      args.productId,
    );
    const generationRunId = assertStudioReelBoundedString(args.generationRunId, {
      label: "Generation run ID",
      maxLength: 120,
    });
    return await ctx.db
      .query("studioReelOutputs")
      .withIndex("by_owner_product_run_created", (query) =>
        query
          .eq("ownerId", ownerId)
          .eq("productId", productId)
          .eq("generationRunId", generationRunId),
      )
      .order("desc")
      .take(Math.max(1, Math.min(100, Math.floor(args.limit ?? 50))));
  },
});
