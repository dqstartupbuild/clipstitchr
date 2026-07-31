import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { rateLimiter } from "../rateLimiter";
import { refreshSocialPostStatus } from "./refreshSocialPostStatus";

export const cancelSocialPost = mutation({
  args: {
    id: v.string(),
    now: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    const post = await ctx.db
      .query("socialPosts")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", ownerId).eq("id", args.id),
      )
      .unique();

    if (!post) {
      throw new Error("Scheduled post not found.");
    }

    const targets = await ctx.db
      .query("socialPostTargets")
      .withIndex("by_owner_post", (index) =>
        index.eq("ownerId", ownerId).eq("postId", post.id),
      )
      .collect();
    const blocked = new Set([
      "publishing",
      "status_check",
      "outcome_unknown",
      "waiting_for_user",
    ]);

    if (targets.some((target) => blocked.has(target.status))) {
      throw new Error(
        "This post is already being sent. Wait for its delivery status before changing it.",
      );
    }

    let canceledTargetCount = 0;

    for (const target of targets) {
      if (target.status === "published" || target.status === "canceled") {
        continue;
      }

      await ctx.db.patch(target._id, {
        status: "canceled",
        nextAttemptAt: undefined,
        nextStatusCheckAt: undefined,
        needsAttentionReason: undefined,
        updatedAt: args.now,
      });
      canceledTargetCount += 1;
    }

    await refreshSocialPostStatus(ctx, ownerId, post.id, args.now);

    return { canceledTargetCount };
  },
});
