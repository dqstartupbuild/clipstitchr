import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { mutation } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";

export const remove = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexRecordDelete", {
      key: ownerId,
      throws: true,
    });

    const post = await ctx.db
      .query("hookLabPosts")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", ownerId).eq("id", id.trim()),
      )
      .unique();

    if (!post) {
      return null;
    }

    if (post.status === "analyzing") {
      throw new Error(
        "Hook Lab is still analyzing this post. Let it finish before deleting it.",
      );
    }

    await ctx.db.delete(post._id);

    return {
      id: post.id,
      thumbnailObject: post.thumbnailObject,
    };
  },
});
