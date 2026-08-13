import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function getStudioClipsTaskOutputCount(
  ctx: MutationCtx | QueryCtx,
  ownerId: string,
  productId: string,
  taskId: string,
) {
  const outputs = await ctx.db
    .query("studioClipsOutputs")
    .withIndex("by_owner_product_task_created", (query) =>
      query
        .eq("ownerId", ownerId)
        .eq("productId", productId)
        .eq("taskId", taskId),
    )
    .collect();
  return outputs.length;
}
