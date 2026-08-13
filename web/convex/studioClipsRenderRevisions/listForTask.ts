import type { MutationCtx, QueryCtx } from "../_generated/server";
import { STUDIO_CLIPS_PERSISTENCE_LIMITS } from "../studioClipsTasks/studioClipsPersistenceLimits";
import { toStudioClipsRenderRevisionSummary } from "./toStudioClipsRenderRevisionSummary";

export async function listStudioClipsRenderRevisionsForTask(
  ctx: MutationCtx | QueryCtx,
  input: { ownerId: string; productId: string; taskId: string },
) {
  const values = await ctx.db
    .query("studioClipsRenderRevisions")
    .withIndex("by_owner_product_created", (query) =>
      query.eq("ownerId", input.ownerId).eq("productId", input.productId),
    )
    .order("desc")
    .take(STUDIO_CLIPS_PERSISTENCE_LIMITS.renderRevisionHistoryCount);
  return values
    .filter((value) => value.taskId === input.taskId)
    .map(toStudioClipsRenderRevisionSummary);
}
