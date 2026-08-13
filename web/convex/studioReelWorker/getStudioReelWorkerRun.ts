import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function getStudioReelWorkerRun(
  ctx: MutationCtx | QueryCtx,
  input: { ownerId: string; productId: string; runId: string },
) {
  return await ctx.db
    .query("studioReelGenerationRuns")
    .withIndex("by_owner_product_id", (query) =>
      query
        .eq("ownerId", input.ownerId)
        .eq("productId", input.productId)
        .eq("id", input.runId),
    )
    .unique();
}
