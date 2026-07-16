import type { MutationCtx } from "../_generated/server";

export async function heartbeatGenerationSlot(
  ctx: MutationCtx,
  slotId: string | undefined,
  now: string,
) {
  if (!slotId) {
    return null;
  }

  const slot = await ctx.db
    .query("generationSlots")
    .withIndex("by_slot", (query) => query.eq("slotId", slotId))
    .unique();

  if (!slot || slot.state !== "active") {
    return null;
  }

  await ctx.db.patch(slot._id, {
    expiresAt: new Date(Date.parse(now) + 45 * 60_000).toISOString(),
    heartbeatAt: now,
    updatedAt: now,
  });

  return slot._id;
}
