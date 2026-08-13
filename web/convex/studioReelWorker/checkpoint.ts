import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { consumeStudioReelWorkerWriteRateLimits } from "../studioReelRateLimits/consumeStudioReelWorkerWriteRateLimits";
import { studioReelWorkerCheckpointValidator } from "../validators/studioReelWorkerCheckpoint";
import { assertStudioReelWorkerLease } from "./assertStudioReelWorkerLease";
import { assertStudioReelWorkerSecret } from "./assertStudioReelWorkerSecret";
import { getStudioReelWorkerRun } from "./getStudioReelWorkerRun";
import { normalizeStudioReelWorkerCheckpointSnapshot } from "./normalizeStudioReelWorkerCheckpointSnapshot";

export const checkpoint = mutation({
  args: {
    checkpoint: studioReelWorkerCheckpointValidator,
    expectedRevision: v.number(),
    leaseAttempt: v.number(),
    leaseId: v.string(),
    ownerId: v.string(),
    productId: v.string(),
    recipeIndex: v.number(),
    runAttempt: v.number(),
    runId: v.string(),
    secret: v.string(),
    snapshotJson: v.string(),
  },
  handler: async (ctx, args) => {
    assertStudioReelWorkerSecret(args.secret);
    if (
      !Number.isInteger(args.expectedRevision) ||
      args.expectedRevision < 0 ||
      !Number.isInteger(args.recipeIndex) ||
      args.recipeIndex < 0
    ) {
      throw new Error("Studio Stitch checkpoint revision is invalid.");
    }
    const run = assertStudioReelWorkerLease(
      await getStudioReelWorkerRun(ctx, args),
      args,
    );
    if (args.recipeIndex >= run.recipeIds.length || run.cancelRequestedAt) {
      throw new Error("Studio Stitch checkpoint is outside the active run.");
    }
    const snapshot = normalizeStudioReelWorkerCheckpointSnapshot(
      args.snapshotJson,
    );
    const revision = args.expectedRevision + 1;
    const existing = await ctx.db
      .query("studioReelWorkerCheckpoints")
      .withIndex("by_owner_product_run_attempt_revision", (query) =>
        query
          .eq("ownerId", run.ownerId)
          .eq("productId", run.productId)
          .eq("runId", run.id)
          .eq("runAttempt", run.attempt)
          .eq("revision", revision),
      )
      .unique();
    if (existing) {
      if (
        existing.checkpoint !== args.checkpoint ||
        existing.recipeIndex !== args.recipeIndex ||
        existing.snapshotJson !== snapshot.json
      ) {
        throw new Error("Studio Stitch checkpoint revision conflict.");
      }
      return { checkpoint: existing.checkpoint, revision: existing.revision };
    }
    if ((run.resumeRevision ?? 0) !== args.expectedRevision) {
      throw new Error("Studio Stitch checkpoint revision conflict.");
    }
    await consumeStudioReelWorkerWriteRateLimits(ctx, run.ownerId);
    const now = new Date().toISOString();
    await ctx.db.insert("studioReelWorkerCheckpoints", {
      ownerId: run.ownerId,
      productId: run.productId,
      runId: run.id,
      runAttempt: run.attempt,
      leaseAttempt: args.leaseAttempt,
      revision,
      recipeIndex: args.recipeIndex,
      checkpoint: args.checkpoint,
      snapshotJson: snapshot.json,
      snapshotByteLength: snapshot.byteLength,
      createdAt: now,
    });
    await ctx.db.patch(run._id, {
      executionCheckpoint: args.checkpoint,
      executionRecipeIndex: args.recipeIndex,
      resumeRevision: revision,
      revision: run.revision + 1,
      updatedAt: now,
      workerLeaseExpiresAt: new Date(Date.now() + 300_000).toISOString(),
    });
    return { checkpoint: args.checkpoint, revision };
  },
});
