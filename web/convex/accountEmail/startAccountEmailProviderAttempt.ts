import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { emailProviderIdempotencyLifetimeMs } from "../email/emailProviderIdempotencyLifetimeMs";
import { emailProviderMaxAttempts } from "../email/emailProviderMaxAttempts";

export const startAccountEmailProviderAttempt = internalMutation({
  args: {
    operationId: v.id("accountEmailOperations"),
    startedAt: v.number(),
    workerId: v.string(),
  },
  handler: async (ctx, args) => {
    const operation = await ctx.db.get(args.operationId);

    if (
      !operation ||
      operation.status !== "claimed" ||
      operation.leaseOwner !== args.workerId ||
      operation.leaseExpiresAt === undefined ||
      operation.leaseExpiresAt <= args.startedAt ||
      !Number.isFinite(args.startedAt) ||
      operation.attemptLeaseOwner === args.workerId
    ) {
      return { started: false as const };
    }

    if (operation.attemptCount >= emailProviderMaxAttempts) {
      await ctx.db.patch(operation._id, {
        failureCategory: "retryLimit",
        leaseExpiresAt: undefined,
        leaseOwner: undefined,
        status: "deadLetter",
        terminalAt: args.startedAt,
        updatedAt: args.startedAt,
      });
      return { started: false as const };
    }

    const attemptCount = operation.attemptCount + 1;
    const idempotencyExpiresAt =
      operation.attemptCount === 0
        ? args.startedAt + emailProviderIdempotencyLifetimeMs
        : operation.idempotencyExpiresAt;
    await ctx.db.patch(operation._id, {
      attemptCount,
      attemptLeaseOwner: args.workerId,
      idempotencyExpiresAt,
      updatedAt: args.startedAt,
    });

    return { attemptCount, idempotencyExpiresAt, started: true as const };
  },
});
