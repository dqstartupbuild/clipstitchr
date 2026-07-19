import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { mutation } from "../_generated/server";

export const markAnalysisDispatchFailed = mutation({
  args: {
    id: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, { id, updatedAt }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const post = await ctx.db
      .query("hookLabPosts")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", ownerId).eq("id", id.trim()),
      )
      .unique();

    if (!post || post.status !== "analyzing") {
      return null;
    }

    await ctx.db.patch(post._id, {
      failureCode: "dispatch_failed",
      failureMessage:
        "The analysis could not start. Try this post again in a moment.",
      status: "needs_attention",
      updatedAt,
    });

    return post.id;
  },
});
