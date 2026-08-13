import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertStudioReelWorkerLease } from "./assertStudioReelWorkerLease";
import { assertStudioReelWorkerSecret } from "./assertStudioReelWorkerSecret";
import { getStudioReelWorkerRun } from "./getStudioReelWorkerRun";

export const getCheckpoint = query({
  args: {
    leaseAttempt: v.number(),
    leaseId: v.string(),
    ownerId: v.string(),
    productId: v.string(),
    revision: v.number(),
    runAttempt: v.number(),
    runId: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, args) => {
    assertStudioReelWorkerSecret(args.secret);
    const run = assertStudioReelWorkerLease(
      await getStudioReelWorkerRun(ctx, args),
      args,
    );
    if (!Number.isInteger(args.revision) || args.revision < 1) {
      throw new Error("Studio Stitch checkpoint revision is invalid.");
    }
    const checkpoint = await ctx.db
      .query("studioReelWorkerCheckpoints")
      .withIndex("by_owner_product_run_attempt_revision", (query) =>
        query
          .eq("ownerId", run.ownerId)
          .eq("productId", run.productId)
          .eq("runId", run.id)
          .eq("runAttempt", run.attempt)
          .eq("revision", args.revision),
      )
      .unique();
    if (!checkpoint) throw new Error("Studio Stitch checkpoint not found.");
    return {
      checkpoint: checkpoint.checkpoint,
      recipeIndex: checkpoint.recipeIndex,
      revision: checkpoint.revision,
      snapshotJson: checkpoint.snapshotJson,
    };
  },
});
