import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";

export const completeSocialAnalyticsRefreshRun = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    apifyRunCount: v.optional(v.number()),
    errorMessage: v.optional(v.string()),
    now: v.string(),
  },
  handler: async (ctx, args) => {
    assertProviderWorkerSecret(args.secret);

    const run = await ctx.db
      .query("socialAnalyticsRefreshRuns")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", args.ownerId).eq("id", args.id),
      )
      .unique();

    if (!run) {
      throw new Error("Analytics refresh not found.");
    }

    const status =
      run.failedPublicationCount === 0
        ? "completed"
        : run.completedPublicationCount > 0
          ? "partially_completed"
          : "failed";

    await ctx.db.patch(run._id, {
      status,
      progress: 1,
      apifyRunCount: args.apifyRunCount,
      errorMessage: args.errorMessage,
      updatedAt: args.now,
      completedAt: args.now,
    });
  },
});
