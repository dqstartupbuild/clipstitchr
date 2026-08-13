import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function getStudioClipsWorkerTask(
  ctx: MutationCtx | QueryCtx,
  input: { ownerId: string; productId: string; taskId: string },
) {
  const task = await ctx.db
    .query("studioClipsTasks")
    .withIndex("by_owner_product_id", (query) =>
      query
        .eq("ownerId", input.ownerId)
        .eq("productId", input.productId)
        .eq("id", input.taskId),
    )
    .unique();
  if (task) return task;
  return await ctx.db
    .query("studioClipsRenderRevisions")
    .withIndex("by_owner_product_id", (query) =>
      query
        .eq("ownerId", input.ownerId)
        .eq("productId", input.productId)
        .eq("id", input.taskId),
    )
    .unique();
}
