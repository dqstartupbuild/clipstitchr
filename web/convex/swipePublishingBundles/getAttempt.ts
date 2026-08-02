import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";

export const get = query({
  args: {
    attemptId: v.string(),
  },
  handler: async (ctx, { attemptId }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const attempt = await ctx.db
      .query("swipePublishingUploadAttempts")
      .withIndex("by_owner_attempt", (index) =>
        index.eq("ownerId", ownerId).eq("attemptId", attemptId.trim()),
      )
      .unique();

    if (!attempt) {
      return null;
    }

    return {
      bundle: attempt.bundle,
      status: attempt.status,
      swipeId: attempt.swipeId,
    };
  },
});
