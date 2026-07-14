import { v } from "convex/values";
import { internal } from "../_generated/api";
import { mutation } from "../_generated/server";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";

export const resumeHeldEmailProviderOperations = mutation({
  args: {
    resumedAt: v.number(),
    secret: v.string(),
  },
  handler: async (ctx, { resumedAt, secret }) => {
    assertRateLimitApiSecret(secret);

    if (!Number.isFinite(resumedAt)) throw new Error("Invalid resume time.");

    const operations = await ctx.db
      .query("emailProviderOperations")
      .withIndex("by_status_next_attempt", (query) =>
        query.eq("status", "held"),
      )
      .take(50);

    for (const operation of operations) {
      await ctx.db.patch(operation._id, {
        status: "pending",
        failureCategory: undefined,
        nextAttemptAt: resumedAt,
        updatedAt: resumedAt,
      });
      await ctx.scheduler.runAfter(
        0,
        internal.email.processEmailProviderOperation
          .processEmailProviderOperation,
        { operationId: operation._id },
      );
    }

    return { hasMore: operations.length === 50, resumedCount: operations.length };
  },
});
