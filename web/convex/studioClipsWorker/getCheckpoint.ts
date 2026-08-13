import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertStudioClipsWorkerLease } from "./assertStudioClipsWorkerLease";
import { assertStudioClipsWorkerSecret } from "./assertStudioClipsWorkerSecret";
import { getStudioClipsWorkerTask } from "./getStudioClipsWorkerTask";

export const getCheckpoint = query({
  args: {
    attempt: v.number(),
    leaseId: v.string(),
    ownerId: v.string(),
    productId: v.string(),
    revision: v.number(),
    secret: v.string(),
    taskId: v.string(),
  },
  handler: async (ctx, args) => {
    assertStudioClipsWorkerSecret(args.secret);
    const task = assertStudioClipsWorkerLease(
      await getStudioClipsWorkerTask(ctx, args),
      args,
    );
    const checkpoint = await ctx.db
      .query("studioClipsCheckpoints")
      .withIndex("by_owner_product_task_revision", (query) =>
        query
          .eq("ownerId", task.ownerId)
          .eq("productId", task.productId)
          .eq("taskId", task.id)
          .eq("revision", args.revision),
      )
      .unique();
    if (!checkpoint) return null;
    return {
      checkpoint: checkpoint.checkpoint,
      revision: checkpoint.revision,
      snapshotJson: checkpoint.snapshotJson,
    };
  },
});
