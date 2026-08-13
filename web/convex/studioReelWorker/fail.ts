import { v } from "convex/values";
import type { StudioReelWorkerFailure } from "../../lib/clipstitchr/types/studioStitchWorker/StudioReelWorkerFailure";
import { mutation } from "../_generated/server";
import { consumeStudioReelWorkerWriteRateLimits } from "../studioReelRateLimits/consumeStudioReelWorkerWriteRateLimits";
import { studioReelWorkerCheckpointValidator } from "../validators/studioReelWorkerCheckpoint";
import { studioReelWorkerFailureKindValidator } from "../validators/studioReelWorkerFailureKind";
import { assertStudioReelWorkerLease } from "./assertStudioReelWorkerLease";
import { assertStudioReelWorkerSecret } from "./assertStudioReelWorkerSecret";
import { getStudioReelWorkerRun } from "./getStudioReelWorkerRun";
import { normalizeStudioReelWorkerFailure } from "./normalizeStudioReelWorkerFailure";

export const fail = mutation({
  args: {
    checkpoint: studioReelWorkerCheckpointValidator,
    failure: v.object({
      code: v.string(),
      kind: studioReelWorkerFailureKindValidator,
      message: v.string(),
    }),
    leaseAttempt: v.number(),
    leaseId: v.string(),
    ownerId: v.string(),
    productId: v.string(),
    recipeIndex: v.number(),
    runAttempt: v.number(),
    runId: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, args) => {
    assertStudioReelWorkerSecret(args.secret);
    const failure = normalizeStudioReelWorkerFailure(
      args.failure as StudioReelWorkerFailure,
    );
    const candidate = await getStudioReelWorkerRun(ctx, args);
    if (
      candidate?.status === "failed" &&
      candidate.attempt === args.runAttempt &&
      !candidate.workerLeaseId &&
      candidate.failureCode === failure.code &&
      candidate.failureKind === failure.kind &&
      candidate.failureMessage === failure.message
    ) {
      return { failed: false };
    }
    const run = assertStudioReelWorkerLease(candidate, args);
    if (
      !Number.isInteger(args.recipeIndex) ||
      args.recipeIndex < 0 ||
      args.recipeIndex >= run.recipeIds.length
    ) {
      throw new Error("Studio Stitch failure is outside the active run.");
    }
    await consumeStudioReelWorkerWriteRateLimits(ctx, run.ownerId);
    const now = new Date().toISOString();
    await ctx.db.insert("studioReelWorkerEvents", {
      ownerId: run.ownerId,
      productId: run.productId,
      runId: run.id,
      runAttempt: run.attempt,
      leaseAttempt: args.leaseAttempt,
      recipeId: run.recipeIds[args.recipeIndex],
      recipeIndex: args.recipeIndex,
      checkpoint: args.checkpoint,
      code: "failed",
      state: "failed",
      progressPercent: run.executionProgressPercent ?? 0,
      occurredAt: now,
    });
    await ctx.db.patch(run._id, {
      executionCheckpoint: args.checkpoint,
      executionCode: "failed",
      executionRecipeIndex: args.recipeIndex,
      failedAt: now,
      failureCode: failure.code,
      failureKind: failure.kind,
      failureMessage: failure.message,
      failureRetryable: failure.kind === "retryable",
      revision: run.revision + 1,
      status: "failed",
      updatedAt: now,
      workerLeaseExpiresAt: undefined,
      workerLeaseId: undefined,
      workerLeaseWorkerId: undefined,
    });
    return { failed: true };
  },
});
