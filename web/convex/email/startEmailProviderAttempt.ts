import { v } from "convex/values";
import { internalMutation } from "../_generated/server";
import { emailProviderIdempotencyLifetimeMs } from "./emailProviderIdempotencyLifetimeMs";
import { emailProviderMaxAttempts } from "./emailProviderMaxAttempts";

export const startEmailProviderAttempt = internalMutation({
  args: {
    operationId: v.id("emailProviderOperations"),
    startedAt: v.number(),
    workerId: v.string(),
  },
  handler: async (ctx, { operationId, startedAt, workerId }) => {
    const operation = await ctx.db.get(operationId);

    if (
      !operation ||
      operation.status !== "claimed" ||
      operation.leaseOwner !== workerId ||
      operation.leaseExpiresAt === undefined ||
      operation.leaseExpiresAt <= startedAt ||
      !Number.isFinite(startedAt)
    ) {
      return { started: false as const };
    }

    if (operation.attemptLeaseOwner === workerId) {
      return {
        attemptCount: operation.attemptCount,
        idempotencyExpiresAt: operation.idempotencyExpiresAt,
        started: false as const,
      };
    }

    if (operation.attemptCount >= emailProviderMaxAttempts) {
      await ctx.db.patch(operationId, {
        status: "deadLetter",
        failureCategory: "retryLimit",
        leaseOwner: undefined,
        leaseExpiresAt: undefined,
        terminalAt: startedAt,
        updatedAt: startedAt,
      });
      return { started: false as const };
    }

    const attemptCount = operation.attemptCount + 1;
    const idempotencyExpiresAt =
      operation.attemptCount === 0
        ? startedAt + emailProviderIdempotencyLifetimeMs
        : operation.idempotencyExpiresAt;
    await ctx.db.patch(operationId, {
      attemptCount,
      attemptLeaseOwner: workerId,
      idempotencyExpiresAt,
      updatedAt: startedAt,
    });

    return { attemptCount, idempotencyExpiresAt, started: true as const };
  },
});
