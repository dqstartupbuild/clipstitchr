import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { releaseGenerationSlot } from "../workerQueue/releaseGenerationSlot";

export const releaseBrowserGenerationSlot = mutation({
  args: {
    now: v.string(),
    reason: v.string(),
    slotId: v.string(),
  },
  handler: async (ctx, { now, reason, slotId }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const slot = await ctx.db
      .query("generationSlots")
      .withIndex("by_slot", (query) => query.eq("slotId", slotId))
      .unique();

    if (!slot || slot.ownerId !== ownerId) {
      throw new Error("Generation slot not found.");
    }

    return await releaseGenerationSlot(ctx, slotId, now, reason);
  },
});
