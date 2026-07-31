import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertOwnerCanPublishSocial } from "../billing/assertOwnerCanPublishSocial";
import { rateLimiter } from "../rateLimiter";
import { assertSocialScheduledForWithinHorizon } from "../../lib/clipstitchr/social/assertSocialScheduledForWithinHorizon";

export const updateSocialPost = mutation({
  args: {
    id: v.string(),
    title: v.string(),
    caption: v.string(),
    scheduledFor: v.optional(v.string()),
    now: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const caption = args.caption.trim();

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    if (caption.length > 2_200) {
      throw new Error("Keep the caption at 2,200 characters or fewer.");
    }

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
    const editableStatuses = new Set([
      "scheduled",
      "held",
      "needs_attention",
      "failed",
    ]);

    if (targets.some((target) => !editableStatuses.has(target.status))) {
      throw new Error("This post has already started and cannot be edited.");
    }

    let scheduledFor = post.scheduledFor;

    if (args.scheduledFor) {
      if (
        post.scheduleMode !== "exact_time" ||
        !Number.isFinite(Date.parse(args.scheduledFor)) ||
        Date.parse(args.scheduledFor) <= Date.parse(args.now)
      ) {
        throw new Error("Choose a future time for an exact-time post.");
      }
      scheduledFor = args.scheduledFor;
      assertSocialScheduledForWithinHorizon(scheduledFor, args.now);
      await assertOwnerCanPublishSocial(ctx, ownerId, args.now, scheduledFor);
    }

    await ctx.db.patch(post._id, {
      title: args.title.trim() || "Untitled post",
      caption,
      scheduledFor,
      updatedAt: args.now,
    });

    if (scheduledFor !== post.scheduledFor) {
      for (const target of targets) {
        await ctx.db.patch(target._id, {
          scheduledFor,
          nextAttemptAt: scheduledFor,
          updatedAt: args.now,
        });
      }
    }
  },
});
