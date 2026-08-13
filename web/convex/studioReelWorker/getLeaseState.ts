import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertStudioReelWorkerSecret } from "./assertStudioReelWorkerSecret";
import { getStudioReelWorkerRun } from "./getStudioReelWorkerRun";
import { getStudioReelWorkerScopeState } from "./getStudioReelWorkerScopeState";

export const getLeaseState = query({
  args: {
    leaseAttempt: v.number(),
    leaseId: v.string(),
    ownerId: v.string(),
    productId: v.string(),
    runAttempt: v.number(),
    runId: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, args) => {
    assertStudioReelWorkerSecret(args.secret);
    const run = await getStudioReelWorkerRun(ctx, args);
    const scope = await getStudioReelWorkerScopeState(
      ctx,
      args.ownerId,
      args.productId,
    );
    const leaseValid = Boolean(
      run &&
        run.attempt === args.runAttempt &&
        run.workerLeaseAttempt === args.leaseAttempt &&
        run.workerLeaseId === args.leaseId &&
        run.workerLeaseExpiresAt &&
        Date.parse(run.workerLeaseExpiresAt) > Date.now() &&
        (run.status === "intentReady" || run.status === "canceled"),
    );
    return {
      cancellationRequested: Boolean(
        run?.cancelRequestedAt || run?.status === "canceled",
      ),
      execution: scope.execution,
      leaseValid,
      productOwned: scope.productOwned,
      runFound: Boolean(run),
      status: run?.status ?? null,
      studioAccess: scope.studioAccess,
    };
  },
});
