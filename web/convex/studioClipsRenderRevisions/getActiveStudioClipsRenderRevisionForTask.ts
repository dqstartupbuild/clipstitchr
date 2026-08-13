import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function getActiveStudioClipsRenderRevisionForTask(
  ctx: MutationCtx | QueryCtx,
  input: { ownerId: string; productId: string; taskId: string },
) {
  const active = await Promise.all(
    (["processing", "queued"] as const).map((status) =>
      ctx.db
        .query("studioClipsRenderRevisions")
        .withIndex("by_owner_product_status_created", (query) =>
          query
            .eq("ownerId", input.ownerId)
            .eq("productId", input.productId)
            .eq("status", status),
        )
        .order("asc")
        .take(2),
    ),
  );
  return active.flat().find((value) => value.taskId === input.taskId) ?? null;
}
