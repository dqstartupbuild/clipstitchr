import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";

export const markSocialAnalyticsRefreshRunRunning = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    apifyMaximumTotalChargeUsd: v.optional(v.number()),
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

    if (
      run.status === "completed" ||
      run.status === "partially_completed" ||
      run.status === "failed" ||
      run.status === "canceled"
    ) {
      return run;
    }

    await ctx.db.patch(run._id, {
      status: "running",
      apifyMaximumTotalChargeUsd: args.apifyMaximumTotalChargeUsd,
      updatedAt: args.now,
    });

    return await ctx.db.get(run._id);
  },
});
