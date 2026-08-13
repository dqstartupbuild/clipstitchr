import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertStudioBetaAccess } from "../studioBetaAccess/assertStudioBetaAccess";
import { assertStudioClipsActiveProduct } from "./assertStudioClipsActiveProduct";
import { assertStudioClipsIdentifier } from "./assertStudioClipsIdentifier";
import { getStudioClipsTaskOutputCount } from "./getStudioClipsTaskOutputCount";
import { toStudioClipsTaskSummary } from "./toStudioClipsTaskSummary";
import { getActiveStudioClipsRenderRevisionForTask } from "../studioClipsRenderRevisions/getActiveStudioClipsRenderRevisionForTask";
import { toStudioClipsRenderRevisionSummary } from "../studioClipsRenderRevisions/toStudioClipsRenderRevisionSummary";

export const list = query({
  args: {
    includeArchived: v.optional(v.boolean()),
    limit: v.optional(v.number()),
    productId: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    await assertStudioBetaAccess(ctx, ownerId);
    const productId = assertStudioClipsIdentifier(args.productId, "Product ID");
    await assertStudioClipsActiveProduct(ctx, ownerId, productId);
    const limit = Math.max(1, Math.min(100, Math.floor(args.limit ?? 30)));
    const tasks = await ctx.db
      .query("studioClipsTasks")
      .withIndex("by_owner_product_created", (query) =>
        query.eq("ownerId", ownerId).eq("productId", productId),
      )
      .order("desc")
      .take(args.includeArchived ? limit : Math.min(100, limit * 2));
    const visible = (args.includeArchived
      ? tasks
      : tasks.filter((task) => !task.archivedAt)
    ).slice(0, limit);
    return await Promise.all(
      visible.map(async (task) => {
        const [outputCount, activeRenderRevision] = await Promise.all([
          getStudioClipsTaskOutputCount(
            ctx,
            ownerId,
            productId,
            task.id,
          ),
          getActiveStudioClipsRenderRevisionForTask(ctx, {
            ownerId,
            productId,
            taskId: task.id,
          }),
        ]);
        return toStudioClipsTaskSummary(
          task,
          outputCount,
          activeRenderRevision
            ? toStudioClipsRenderRevisionSummary(activeRenderRevision)
            : undefined,
        );
      }),
    );
  },
});
