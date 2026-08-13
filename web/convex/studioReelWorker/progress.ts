import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { consumeStudioReelWorkerWriteRateLimits } from "../studioReelRateLimits/consumeStudioReelWorkerWriteRateLimits";
import { studioReelWorkerCheckpointValidator } from "../validators/studioReelWorkerCheckpoint";
import { studioReelWorkerExecutionStateValidator } from "../validators/studioReelWorkerExecutionState";
import { studioReelWorkerProgressCodeValidator } from "../validators/studioReelWorkerProgressCode";
import { assertStudioReelWorkerLease } from "./assertStudioReelWorkerLease";
import { assertStudioReelWorkerSecret } from "./assertStudioReelWorkerSecret";
import { getStudioReelWorkerRun } from "./getStudioReelWorkerRun";

export const progress = mutation({
  args: {
    checkpoint: studioReelWorkerCheckpointValidator,
    code: studioReelWorkerProgressCodeValidator,
    leaseAttempt: v.number(),
    leaseId: v.string(),
    occurredAt: v.string(),
    ownerId: v.string(),
    productId: v.string(),
    progressPercent: v.number(),
    recipeId: v.optional(v.string()),
    recipeIndex: v.number(),
    runAttempt: v.number(),
    runId: v.string(),
    secret: v.string(),
    state: studioReelWorkerExecutionStateValidator,
  },
  handler: async (ctx, args) => {
    assertStudioReelWorkerSecret(args.secret);
    if (
      !Number.isInteger(args.progressPercent) ||
      args.progressPercent < 0 ||
      args.progressPercent > 100 ||
      !Number.isInteger(args.recipeIndex) ||
      args.recipeIndex < 0 ||
      !Number.isFinite(Date.parse(args.occurredAt))
    ) {
      throw new Error("Studio Stitch progress event is invalid.");
    }
    const run = assertStudioReelWorkerLease(
      await getStudioReelWorkerRun(ctx, args),
      args,
    );
    if (
      args.recipeIndex >= run.recipeIds.length ||
      (args.recipeId !== undefined &&
        run.recipeIds[args.recipeIndex] !== args.recipeId) ||
      args.progressPercent < (run.executionProgressPercent ?? 0)
    ) {
      throw new Error("Studio Stitch progress is outside the active run.");
    }
    if (run.cancelRequestedAt && args.state === "processing") {
      throw new Error("Studio Stitch cancellation was requested.");
    }
    await consumeStudioReelWorkerWriteRateLimits(ctx, run.ownerId);
    await ctx.db.insert("studioReelWorkerEvents", {
      ownerId: run.ownerId,
      productId: run.productId,
      runId: run.id,
      runAttempt: run.attempt,
      leaseAttempt: args.leaseAttempt,
      ...(args.recipeId ? { recipeId: args.recipeId } : {}),
      recipeIndex: args.recipeIndex,
      checkpoint: args.checkpoint,
      code: args.code,
      state: args.state,
      progressPercent: args.progressPercent,
      occurredAt: args.occurredAt,
    });
    const now = new Date().toISOString();
    await ctx.db.patch(run._id, {
      executionCheckpoint: args.checkpoint,
      executionCode: args.code,
      executionProgressPercent: args.progressPercent,
      executionRecipeIndex: args.recipeIndex,
      revision: run.revision + 1,
      updatedAt: now,
      ...(args.state === "cancelled"
        ? {
            workerLeaseExpiresAt: undefined,
            workerLeaseId: undefined,
            workerLeaseWorkerId: undefined,
          }
        : {
            workerLeaseExpiresAt: new Date(Date.now() + 300_000).toISOString(),
          }),
    });
    return { accepted: true };
  },
});
