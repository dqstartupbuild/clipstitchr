import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { consumeStudioReelProviderIntentRateLimits } from "../studioReel/consumeStudioReelProviderIntentRateLimits";
import { consumeStudioReelWorkerWriteRateLimits } from "../studioReelRateLimits/consumeStudioReelWorkerWriteRateLimits";
import { studioReelProviderValidator } from "../validators/studioReelProvider";
import { studioReelWorkerProviderOperationValidator } from "../validators/studioReelWorkerProviderOperation";
import { assertStudioReelWorkerIdentifier } from "./assertStudioReelWorkerIdentifier";
import { assertStudioReelWorkerLease } from "./assertStudioReelWorkerLease";
import { assertStudioReelWorkerSecret } from "./assertStudioReelWorkerSecret";
import { getStudioReelWorkerRun } from "./getStudioReelWorkerRun";
import { getStudioReelWorkerScopeState } from "./getStudioReelWorkerScopeState";

const operations = {
  dansugc: "acquire_reaction",
  gemini: "analyze_demo",
  elevenlabs: "generate_voice",
  render: "render_recipe",
} as const;

export const reserveCost = mutation({
  args: {
    invocationId: v.string(),
    leaseAttempt: v.number(),
    leaseId: v.string(),
    operation: studioReelWorkerProviderOperationValidator,
    ownerId: v.string(),
    productId: v.string(),
    provider: studioReelProviderValidator,
    recipeId: v.string(),
    runAttempt: v.number(),
    runId: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, args) => {
    assertStudioReelWorkerSecret(args.secret);
    const invocationId = assertStudioReelWorkerIdentifier(
      args.invocationId,
      "Invocation ID",
    );
    if (operations[args.provider] !== args.operation) {
      throw new Error("Studio Stitch provider operation is invalid.");
    }
    const run = assertStudioReelWorkerLease(
      await getStudioReelWorkerRun(ctx, args),
      args,
    );
    if (!run.recipeIds.includes(args.recipeId) || run.cancelRequestedAt) {
      throw new Error("Studio Stitch cost request is outside the active run.");
    }
    const scope = await getStudioReelWorkerScopeState(
      ctx,
      run.ownerId,
      run.productId,
    );
    if (
      scope.execution.state === "unavailable" ||
      !scope.studioAccess ||
      !scope.productOwned
    ) {
      throw new Error("Studio Stitch execution access was revoked.");
    }
    const existing = await ctx.db
      .query("studioReelWorkerCostReservations")
      .withIndex("by_run_attempt_invocation", (query) =>
        query
          .eq("runId", run.id)
          .eq("runAttempt", run.attempt)
          .eq("invocationId", invocationId),
      )
      .unique();
    if (existing) {
      if (
        existing.ownerId !== run.ownerId ||
        existing.productId !== run.productId ||
        existing.recipeId !== args.recipeId ||
        existing.provider !== args.provider ||
        existing.operation !== args.operation
      ) {
        throw new Error("Studio Stitch invocation ID conflict.");
      }
      return {
        alreadyReserved: true,
        disposition:
          existing.provider === "render" || existing.provider === "dansugc"
            ? ("reserved" as const)
            : ("uncertain" as const),
        reservationId: existing.reservationId,
      };
    }
    await consumeStudioReelWorkerWriteRateLimits(ctx, run.ownerId);
    await consumeStudioReelProviderIntentRateLimits(
      ctx,
      run.ownerId,
      args.provider,
      1,
    );
    const nowMs = Date.now();
    const reservationId = `studio_stitch_cost_${run.id}_${run.attempt}_${invocationId}_${nowMs}`;
    await ctx.db.insert("studioReelWorkerCostReservations", {
      ownerId: run.ownerId,
      productId: run.productId,
      runId: run.id,
      runAttempt: run.attempt,
      leaseAttempt: args.leaseAttempt,
      recipeId: args.recipeId,
      provider: args.provider,
      operation: args.operation,
      invocationId,
      reservationId,
      createdAt: new Date(nowMs).toISOString(),
    });
    return {
      alreadyReserved: false,
      disposition: "reserved" as const,
      reservationId,
    };
  },
});
