import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function getActiveStudioClipsTaskForOwnerProduct(
  ctx: MutationCtx | QueryCtx,
  input: { excludeTaskId?: string; ownerId: string; productId: string },
) {
  const tasks = await Promise.all(
    (["processing", "queued"] as const).map(async (status) =>
      await ctx.db
        .query("studioClipsTasks")
        .withIndex("by_owner_product_status_created", (query) =>
          query
            .eq("ownerId", input.ownerId)
            .eq("productId", input.productId)
            .eq("status", status),
        )
        .order("asc")
        .take(input.excludeTaskId ? 2 : 1),
    ),
  );
  return (
    tasks
      .flat()
      .find((task) => task.id !== input.excludeTaskId) ?? null
  );
}
