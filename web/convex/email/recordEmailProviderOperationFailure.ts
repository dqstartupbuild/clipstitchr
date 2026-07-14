import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalMutation } from "../_generated/server";
import { emailProviderFailureCategoryValidator } from "../validators/emailProviderFailureCategory";
import { emailProviderMaxAttempts } from "./emailProviderMaxAttempts";
import { enqueueContactDeleteCompensation } from "./enqueueContactDeleteCompensation";
import { getEmailProviderRetryDelayMs } from "./getEmailProviderRetryDelayMs";

export const recordEmailProviderOperationFailure = internalMutation({
  args: {
    acceptanceUnknown: v.boolean(),
    failedAt: v.number(),
    failureCategory: emailProviderFailureCategoryValidator,
    operationId: v.id("emailProviderOperations"),
    retryable: v.boolean(),
    workerId: v.string(),
  },
  handler: async (ctx, args) => {
    const operation = await ctx.db.get(args.operationId);

    if (!operation || !Number.isFinite(args.failedAt)) {
      return { status: "ignored" as const };
    }

    if (
      operation.status !== "claimed" ||
      operation.leaseOwner !== args.workerId
    ) {
      const compensationOperationId =
        operation.status === "canceled" &&
        operation.kind !== "contactDelete" &&
        operation.attemptCount >= 1 &&
        args.acceptanceUnknown
          ? await enqueueContactDeleteCompensation(ctx, {
              compensatesOperationId: operation._id,
              contactId: operation.contactId,
              now: args.failedAt,
            })
          : null;

      return {
        compensationQueued: compensationOperationId !== null,
        status: "ignored" as const,
      };
    }

    const idempotencyExpired = args.failedAt >= operation.idempotencyExpiresAt;
    const attemptsExhausted = operation.attemptCount >= emailProviderMaxAttempts;
    const shouldDeadLetter =
      !args.retryable || attemptsExhausted ||
      (operation.kind !== "contactDelete" &&
        args.acceptanceUnknown &&
        idempotencyExpired);

    if (shouldDeadLetter) {
      await ctx.db.patch(operation._id, {
        status: "deadLetter",
        acceptanceStatus: args.acceptanceUnknown ? "unknown" : "rejected",
        ambiguousAt: args.acceptanceUnknown
          ? (operation.ambiguousAt ?? args.failedAt)
          : operation.ambiguousAt,
        failureCategory:
          operation.kind !== "contactDelete" &&
          args.acceptanceUnknown &&
          idempotencyExpired
          ? "ambiguous"
          : attemptsExhausted
            ? "retryLimit"
            : args.failureCategory,
        attemptLeaseOwner: undefined,
        leaseOwner: undefined,
        leaseExpiresAt: undefined,
        terminalAt: args.failedAt,
        updatedAt: args.failedAt,
      });

      return { status: "deadLetter" as const };
    }

    const retryAt =
      args.failedAt + getEmailProviderRetryDelayMs(operation.attemptCount);
    await ctx.db.patch(operation._id, {
      status: "pending",
      acceptanceStatus: args.acceptanceUnknown ? "unknown" : "notAttempted",
      ambiguousAt: args.acceptanceUnknown
        ? (operation.ambiguousAt ?? args.failedAt)
        : operation.ambiguousAt,
      failureCategory: args.failureCategory,
      attemptLeaseOwner: undefined,
      leaseOwner: undefined,
      leaseExpiresAt: undefined,
      nextAttemptAt: retryAt,
      updatedAt: args.failedAt,
    });
    await ctx.scheduler.runAt(
      retryAt,
      internal.email.processEmailProviderOperation.processEmailProviderOperation,
      { operationId: operation._id },
    );

    return { retryAt, status: "pending" as const };
  },
});
