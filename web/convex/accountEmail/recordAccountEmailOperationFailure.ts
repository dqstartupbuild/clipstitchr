import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalMutation } from "../_generated/server";
import { emailProviderFailureCategoryValidator } from "../validators/emailProviderFailureCategory";
import { emailProviderMaxAttempts } from "../email/emailProviderMaxAttempts";
import { getEmailProviderRetryDelayMs } from "../email/getEmailProviderRetryDelayMs";

export const recordAccountEmailOperationFailure = internalMutation({
  args: {
    acceptanceUnknown: v.boolean(),
    failedAt: v.number(),
    failureCategory: emailProviderFailureCategoryValidator,
    operationId: v.id("accountEmailOperations"),
    retryable: v.boolean(),
    workerId: v.string(),
  },
  handler: async (ctx, args) => {
    const operation = await ctx.db.get(args.operationId);

    if (
      !operation ||
      !Number.isFinite(args.failedAt) ||
      operation.status !== "claimed" ||
      operation.leaseOwner !== args.workerId
    ) {
      return { status: "ignored" as const };
    }

    const idempotencyExpired =
      args.failedAt >= operation.idempotencyExpiresAt;
    const attemptsExhausted =
      operation.attemptCount >= emailProviderMaxAttempts;
    const deadLetter =
      !args.retryable ||
      attemptsExhausted ||
      (args.acceptanceUnknown && idempotencyExpired);

    if (deadLetter) {
      await ctx.db.patch(operation._id, {
        acceptanceStatus: args.acceptanceUnknown ? "unknown" : "rejected",
        ambiguousAt: args.acceptanceUnknown
          ? (operation.ambiguousAt ?? args.failedAt)
          : operation.ambiguousAt,
        attemptLeaseOwner: undefined,
        failureCategory:
          args.acceptanceUnknown && idempotencyExpired
            ? "ambiguous"
            : attemptsExhausted
              ? "retryLimit"
              : args.failureCategory,
        leaseExpiresAt: undefined,
        leaseOwner: undefined,
        status: "deadLetter",
        terminalAt: args.failedAt,
        updatedAt: args.failedAt,
      });
      return { status: "deadLetter" as const };
    }

    const retryAt =
      args.failedAt + getEmailProviderRetryDelayMs(operation.attemptCount);
    await ctx.db.patch(operation._id, {
      acceptanceStatus: args.acceptanceUnknown ? "unknown" : "notAttempted",
      ambiguousAt: args.acceptanceUnknown
        ? (operation.ambiguousAt ?? args.failedAt)
        : operation.ambiguousAt,
      attemptLeaseOwner: undefined,
      failureCategory: args.failureCategory,
      leaseExpiresAt: undefined,
      leaseOwner: undefined,
      nextAttemptAt: retryAt,
      status: "pending",
      updatedAt: args.failedAt,
    });
    await ctx.scheduler.runAt(
      retryAt,
      internal.accountEmail.processAccountEmailOperation
        .processAccountEmailOperation,
      { operationId: operation._id },
    );

    return { retryAt, status: "pending" as const };
  },
});
