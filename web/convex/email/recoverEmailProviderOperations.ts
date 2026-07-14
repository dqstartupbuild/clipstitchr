import { internal } from "../_generated/api";
import { internalMutation } from "../_generated/server";

const recoveryBatchSize = 50;

export const recoverEmailProviderOperations = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const pendingOperations = await ctx.db
      .query("emailProviderOperations")
      .withIndex("by_status_next_attempt", (query) =>
        query.eq("status", "pending").lte("nextAttemptAt", now),
      )
      .take(recoveryBatchSize);
    const expiredClaims = await ctx.db
      .query("emailProviderOperations")
      .withIndex("by_status_lease_expiration", (query) =>
        query.eq("status", "claimed").lte("leaseExpiresAt", now),
      )
      .take(recoveryBatchSize);

    for (const operation of [...pendingOperations, ...expiredClaims]) {
      await ctx.scheduler.runAfter(
        0,
        internal.email.processEmailProviderOperation
          .processEmailProviderOperation,
        { operationId: operation._id },
      );
    }

    return {
      hasMore:
        pendingOperations.length === recoveryBatchSize ||
        expiredClaims.length === recoveryBatchSize,
      recoveredCount: pendingOperations.length + expiredClaims.length,
    };
  },
});
