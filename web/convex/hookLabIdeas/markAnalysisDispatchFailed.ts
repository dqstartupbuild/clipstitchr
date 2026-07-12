import { v } from "convex/values";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { mutation } from "../_generated/server";

export const markAnalysisDispatchFailed = mutation({
  args: {
    id: v.string(),
    secret: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, { id, secret, updatedAt }) => {
    assertRateLimitApiSecret(secret);
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const idea = await ctx.db
      .query("hookLabIdeas")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", ownerId).eq("id", id.trim()),
      )
      .unique();

    if (!idea || idea.status !== "analyzing") {
      return null;
    }

    await ctx.db.patch(idea._id, {
      failureCode: "analysis_dispatch_failed",
      failureMessage:
        "We saved this idea but could not start learning it yet. Try again when you are ready.",
      status: "needs_attention",
      updatedAt,
    });

    return idea.id;
  },
});
