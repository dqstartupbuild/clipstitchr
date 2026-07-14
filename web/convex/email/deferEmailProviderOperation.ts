import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalMutation } from "../_generated/server";

export const deferEmailProviderOperation = internalMutation({
  args: {
    deferredAt: v.number(),
    delayMs: v.number(),
    operationId: v.id("emailProviderOperations"),
    workerId: v.string(),
  },
  handler: async (ctx, args) => {
    const operation = await ctx.db.get(args.operationId);

    if (
      !operation ||
      operation.status !== "claimed" ||
      operation.leaseOwner !== args.workerId ||
      !Number.isFinite(args.deferredAt) ||
      !Number.isFinite(args.delayMs) ||
      args.delayMs < 1_000 ||
      args.delayMs > 5 * 60 * 1_000
    ) {
      return { deferred: false as const };
    }

    const retryAt = args.deferredAt + args.delayMs;
    await ctx.db.patch(operation._id, {
      status: "pending",
      attemptLeaseOwner: undefined,
      leaseOwner: undefined,
      leaseExpiresAt: undefined,
      nextAttemptAt: retryAt,
      updatedAt: args.deferredAt,
    });
    await ctx.scheduler.runAt(
      retryAt,
      internal.email.processEmailProviderOperation.processEmailProviderOperation,
      { operationId: operation._id },
    );

    return { deferred: true as const, retryAt };
  },
});
