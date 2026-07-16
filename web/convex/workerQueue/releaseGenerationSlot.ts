import type { MutationCtx } from "../_generated/server";

export async function releaseGenerationSlot(
  ctx: MutationCtx,
  slotId: string | undefined,
  now: string,
  reason: string,
  state: "released" | "expired" = "released",
) {
  if (!slotId) {
    return null;
  }

  const slot = await ctx.db
    .query("generationSlots")
    .withIndex("by_slot", (query) => query.eq("slotId", slotId))
    .unique();

  if (!slot || slot.state === "released" || slot.state === "expired") {
    return slot?._id ?? null;
  }

  await ctx.db.patch(slot._id, {
    releaseReason: reason,
    releasedAt: now,
    state,
    updatedAt: now,
  });

  return slot._id;
}
