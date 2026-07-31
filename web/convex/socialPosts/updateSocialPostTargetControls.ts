import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { rateLimiter } from "../rateLimiter";
import { socialPublishModeValidator } from "../validators/socialPublishMode";
import { validateInstagramTargetControls } from "./validateInstagramTargetControls";
import { validateTikTokTargetControls } from "./validateTikTokTargetControls";

export const updateSocialPostTargetControls = mutation({
  args: {
    id: v.string(),
    publishMode: socialPublishModeValidator,
    controlsJson: v.string(),
    now: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });
    const target = await ctx.db
      .query("socialPostTargets")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", ownerId).eq("id", args.id),
      )
      .unique();

    if (!target) {
      throw new Error("Social post destination not found.");
    }

    if (
      target.status !== "scheduled" &&
      target.status !== "held" &&
      target.status !== "needs_attention" &&
      target.status !== "failed"
    ) {
      throw new Error("This destination has already started.");
    }

    if (target.platform === "tiktok") {
      validateTikTokTargetControls(args.controlsJson, args.publishMode);
    } else {
      validateInstagramTargetControls(args.controlsJson);
    }

    await ctx.db.patch(target._id, {
      publishMode: args.publishMode,
      controlsJson: args.controlsJson,
      needsAttentionReason: undefined,
      lastErrorCode: undefined,
      lastErrorMessage: undefined,
      updatedAt: args.now,
    });
  },
});
