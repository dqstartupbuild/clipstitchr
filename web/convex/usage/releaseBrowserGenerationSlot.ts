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
  handler: async (ctx, { reason, slotId }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const now = new Date().toISOString();
    const slot = await ctx.db
      .query("generationSlots")
      .withIndex("by_slot", (query) => query.eq("slotId", slotId))
      .unique();

    if (!slot || slot.ownerId !== ownerId) {
      throw new Error("Generation slot not found.");
    }

    const hasBrowserIdempotencyProvenance =
      slot.idempotencyKey.startsWith("browser:") &&
      slot.slotId === `generation:${slot.idempotencyKey}`;

    if (
      slot.provenance === "worker_queue" ||
      !hasBrowserIdempotencyProvenance
    ) {
      throw new Error("Browser generation slot not found.");
    }

    return await releaseGenerationSlot(ctx, slotId, now, reason);
  },
});
