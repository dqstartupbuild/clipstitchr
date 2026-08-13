import type { MutationCtx, QueryCtx } from "../_generated/server";

export async function getActiveStudioClipsRenderRevision(
  ctx: MutationCtx | QueryCtx,
  input: { excludeId?: string; ownerId: string; productId: string },
) {
  const revisions = await Promise.all(
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
        .take(input.excludeId ? 2 : 1),
    ),
  );
  return revisions.flat().find((value) => value.id !== input.excludeId) ?? null;
}
