import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalMutation } from "../_generated/server";

export const requeueZeroAttemptConfigurationFailure = internalMutation({
  args: {
    operationId: v.id("emailProviderOperations"),
    requeuedAt: v.number(),
  },
  handler: async (ctx, { operationId, requeuedAt }) => {
    const operation = await ctx.db.get(operationId);

    if (
      !operation ||
      !Number.isFinite(requeuedAt) ||
      operation.kind !== "transactional" ||
      operation.transactionalTemplateKey !== "email-confirmation" ||
      operation.status !== "deadLetter" ||
      operation.failureCategory !== "configuration" ||
      operation.attemptCount !== 0 ||
      operation.acceptanceStatus !== "rejected" ||
      operation.providerMessageId !== undefined ||
      operation.acceptedAt !== undefined ||
      operation.deliveredAt !== undefined
    ) {
      return { requeued: false as const };
    }

    const token = operation.confirmationTokenId
      ? await ctx.db.get(operation.confirmationTokenId)
      : null;

    if (
      !token ||
      token.usedAt !== undefined ||
      token.supersededAt !== undefined ||
      token.expiresAt <= requeuedAt
    ) {
      return { requeued: false as const };
    }

    await ctx.db.patch(operationId, {
      acceptanceStatus: "notAttempted",
      failureCategory: undefined,
      nextAttemptAt: requeuedAt,
      status: "pending",
      terminalAt: undefined,
      updatedAt: requeuedAt,
    });
    await ctx.scheduler.runAfter(
      0,
      internal.email.processEmailProviderOperation
        .processEmailProviderOperation,
      { operationId },
    );

    return { requeued: true as const };
  },
});
