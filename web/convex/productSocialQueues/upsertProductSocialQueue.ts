import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertProductBelongsToOwner } from "../assertProductBelongsToOwner";
import { socialWeeklySlotValidator } from "../validators/socialWeeklySlot";
import { isValidIanaTimeZone } from "../../lib/clipstitchr/social/isValidIanaTimeZone";
import { validateSocialWeeklySlots } from "../../lib/clipstitchr/social/validateSocialWeeklySlots";
import { getSocialSchedulingHorizonDays } from "../../lib/clipstitchr/social/getSocialSchedulingHorizonDays";
import { rateLimiter } from "../rateLimiter";
import { reflowFutureProductQueuePosts } from "./reflowFutureProductQueuePosts";

export const upsertProductSocialQueue = mutation({
  args: {
    productId: v.string(),
    timezone: v.string(),
    weeklySlots: v.array(socialWeeklySlotValidator),
    paused: v.boolean(),
    reflowFuturePosts: v.boolean(),
    defaultCaption: v.optional(v.string()),
    defaultTargetSnapshotJson: v.optional(v.string()),
    now: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const timezone = args.timezone.trim();

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });
    await assertProductBelongsToOwner(ctx, ownerId, args.productId);

    if (!isValidIanaTimeZone(timezone)) {
      throw new Error("Choose a valid city-based time zone.");
    }

    if (!args.paused || args.weeklySlots.length > 0) {
      validateSocialWeeklySlots(args.weeklySlots);
    }

    const existing = await ctx.db
      .query("productSocialQueues")
      .withIndex("by_owner_product", (index) =>
        index.eq("ownerId", ownerId).eq("productId", args.productId),
      )
      .unique();
    const revision = (existing?.revision ?? 0) + 1;
    const values = {
      ownerId,
      productId: args.productId,
      timezone,
      weeklySlots: args.weeklySlots,
      paused: args.paused,
      defaultCaption: args.defaultCaption?.trim() || undefined,
      defaultTargetSnapshotJson: args.defaultTargetSnapshotJson,
      schedulingHorizonDays: getSocialSchedulingHorizonDays(),
      revision,
      updatedAt: args.now,
    };
    let queueId;

    if (existing) {
      await ctx.db.patch(existing._id, values);
      queueId = existing._id;
    } else {
      queueId = await ctx.db.insert("productSocialQueues", {
        ...values,
        createdAt: args.now,
      });
    }

    const queue = await ctx.db.get(queueId);

    if (!queue) {
      throw new Error("Unable to save this product's posting queue.");
    }

    const reflowedPostCount = args.reflowFuturePosts
      ? await reflowFutureProductQueuePosts(ctx, {
          now: args.now,
          ownerId,
          productId: args.productId,
          queue,
        })
      : 0;

    return { queue, reflowedPostCount };
  },
});
