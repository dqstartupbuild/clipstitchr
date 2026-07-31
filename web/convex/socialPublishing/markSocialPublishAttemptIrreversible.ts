import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";

export const markSocialPublishAttemptIrreversible = mutation({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
    stage: v.string(),
    now: v.string(),
  },
  handler: async (ctx, args) => {
    assertProviderWorkerSecret(args.secret);

    const attempt = await ctx.db
      .query("socialPublishAttempts")
      .withIndex("by_owner_target", (index) =>
        index.eq("ownerId", args.ownerId),
      )
      .filter((query) => query.eq(query.field("id"), args.id))
      .first();

    if (!attempt || attempt.status !== "running") {
      throw new Error("Running social publishing attempt not found.");
    }

    await ctx.db.patch(attempt._id, {
      stage: args.stage,
      retrySafety: "do_not_retry_reconcile_only",
      updatedAt: args.now,
    });
  },
});
