import { v } from "convex/values";
import { query } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertProductBelongsToOwner } from "../assertProductBelongsToOwner";
import { listSocialQueueSlotCandidates } from "../../lib/clipstitchr/social/listSocialQueueSlotCandidates";

export const getNextProductSocialQueueSlot = query({
  args: {
    productId: v.string(),
    after: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await assertProductBelongsToOwner(ctx, ownerId, args.productId);

    const queue = await ctx.db
      .query("productSocialQueues")
      .withIndex("by_owner_product", (index) =>
        index.eq("ownerId", ownerId).eq("productId", args.productId),
      )
      .unique();

    if (!queue || queue.paused || queue.weeklySlots.length === 0) {
      return null;
    }

    const candidates = listSocialQueueSlotCandidates({
      after: args.after,
      horizonDays: queue.schedulingHorizonDays,
      slots: queue.weeklySlots,
      timezone: queue.timezone,
    });

    for (const scheduledFor of candidates) {
      const queueSlotKey = `${args.productId}:${scheduledFor}`;
      const existing = await ctx.db
        .query("socialPosts")
        .withIndex("by_product_queue_slot", (index) =>
          index
            .eq("productId", args.productId)
            .eq("queueSlotKey", queueSlotKey),
        )
        .first();

      if (!existing || existing.status === "canceled") {
        return { queueSlotKey, scheduledFor };
      }
    }

    return null;
  },
});
