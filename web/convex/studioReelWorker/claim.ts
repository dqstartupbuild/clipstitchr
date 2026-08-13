import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { consumeStudioReelWorkerClaimRateLimit } from "../studioReelRateLimits/consumeStudioReelWorkerClaimRateLimit";
import { consumeStudioReelWorkerWriteRateLimits } from "../studioReelRateLimits/consumeStudioReelWorkerWriteRateLimits";
import { assertStudioReelWorkerIdentifier } from "./assertStudioReelWorkerIdentifier";
import { assertStudioReelWorkerSecret } from "./assertStudioReelWorkerSecret";
import { getStudioReelExecutionAvailability } from "./getStudioReelExecutionAvailability";
import { getStudioReelWorkerScopeState } from "./getStudioReelWorkerScopeState";
import { resolveStudioReelWorkerRecipe } from "./resolveStudioReelWorkerRecipe";
import { toStudioReelWorkerClaim } from "./toStudioReelWorkerClaim";

export const claim = mutation({
  args: {
    leaseSeconds: v.optional(v.number()),
    secret: v.string(),
    workerId: v.string(),
  },
  handler: async (ctx, args) => {
    assertStudioReelWorkerSecret(args.secret);
    const workerId = assertStudioReelWorkerIdentifier(args.workerId, "Worker ID");
    const leaseSeconds = Math.floor(args.leaseSeconds ?? 300);
    if (leaseSeconds < 30 || leaseSeconds > 900) {
      throw new Error("Studio Stitch lease must be between 30 and 900 seconds.");
    }
    await consumeStudioReelWorkerClaimRateLimit(ctx, workerId);
    const availability = getStudioReelExecutionAvailability();
    if (availability.state === "unavailable") {
      return { availability, claim: null };
    }
    const nowMs = Date.now();
    const intentReady = await ctx.db
      .query("studioReelGenerationRuns")
      .withIndex("by_status_created", (query) => query.eq("status", "intentReady"))
      .order("asc")
      .take(50);
    const run = intentReady.find((candidate) => {
      const leaseExpiry = candidate.workerLeaseExpiresAt
        ? Date.parse(candidate.workerLeaseExpiresAt)
        : 0;
      return !candidate.cancelRequestedAt && leaseExpiry <= nowMs;
    });
    if (!run) return { availability, claim: null };

    await consumeStudioReelWorkerWriteRateLimits(ctx, run.ownerId);
    const scope = await getStudioReelWorkerScopeState(
      ctx,
      run.ownerId,
      run.productId,
    );
    if (
      scope.execution.state === "unavailable" ||
      !scope.studioAccess ||
      !scope.productOwned ||
      run.attempt > 5
    ) {
      const now = new Date(nowMs).toISOString();
      await ctx.db.patch(run._id, {
        failedAt: now,
        failureCode: run.attempt > 5 ? "MAX_ATTEMPTS_EXCEEDED" : "ACCESS_REVOKED",
        failureKind: "permanent",
        failureMessage:
          run.attempt > 5
            ? "Studio Stitch exhausted its retry attempts."
            : "Studio access, execution, or Product ownership changed before processing.",
        failureRetryable: false,
        revision: run.revision + 1,
        status: "failed",
        updatedAt: now,
      });
      return { availability, claim: null };
    }

    const recipes = [];
    try {
      for (const recipeId of run.recipeIds) {
        recipes.push(
          await resolveStudioReelWorkerRecipe(ctx, {
            ownerId: run.ownerId,
            productId: run.productId,
            recipeId,
          }),
        );
      }
    } catch {
      const now = new Date(nowMs).toISOString();
      await ctx.db.patch(run._id, {
        failedAt: now,
        failureCode: "SOURCE_SCOPE_INVALID",
        failureKind: "permanent",
        failureMessage: "Studio Stitch source scope is invalid.",
        failureRetryable: false,
        revision: run.revision + 1,
        status: "failed",
        updatedAt: now,
      });
      return { availability, claim: null };
    }

    const leaseAttempt = (run.workerLeaseAttempt ?? 0) + 1;
    const now = new Date(nowMs).toISOString();
    const leaseId = `studio_stitch_lease_${run.id}_${run.attempt}_${leaseAttempt}_${nowMs}`;
    const workerLeaseExpiresAt = new Date(
      nowMs + leaseSeconds * 1_000,
    ).toISOString();
    await ctx.db.patch(run._id, {
      executionCheckpoint: run.executionCheckpoint ?? "claim_validated",
      executionCode: "worker_started",
      executionProgressPercent: run.executionProgressPercent ?? 0,
      executionRecipeIndex: run.executionRecipeIndex ?? 0,
      failureCode: undefined,
      failureKind: undefined,
      failureMessage: undefined,
      failureRetryable: undefined,
      revision: run.revision + 1,
      startedAt: run.startedAt ?? now,
      updatedAt: now,
      workerLeaseAttempt: leaseAttempt,
      workerLeaseExpiresAt,
      workerLeaseId: leaseId,
      workerLeaseWorkerId: workerId,
    });
    const claimed = await ctx.db.get(run._id);
    if (!claimed) throw new Error("Studio Stitch claim disappeared.");
    const checkpoint = claimed.resumeRevision
      ? await ctx.db
          .query("studioReelWorkerCheckpoints")
          .withIndex("by_owner_product_run_attempt_revision", (query) =>
            query
              .eq("ownerId", claimed.ownerId)
              .eq("productId", claimed.productId)
              .eq("runId", claimed.id)
              .eq("runAttempt", claimed.attempt)
              .eq("revision", claimed.resumeRevision as number),
          )
          .unique()
      : null;
    return {
      availability,
      claim: toStudioReelWorkerClaim(claimed, recipes, checkpoint),
    };
  },
});
