import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";

export const failSocialAnalyticsRefreshRun = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    errorMessage: v.string(),
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
      return;
    }

    await ctx.db.patch(run._id, {
      status: "failed",
      progress: 1,
      errorMessage: args.errorMessage,
      updatedAt: args.now,
      completedAt: args.now,
    });
  },
});
