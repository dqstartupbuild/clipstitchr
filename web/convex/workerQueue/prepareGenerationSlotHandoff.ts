import type { MutationCtx } from "../_generated/server";
import { generationSlotDurationMs } from "./generationSlotDurationMs";

export async function prepareGenerationSlotHandoff(
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
  const nowMs = Date.parse(now);

  if (
    !slot ||
    slot.state !== "active" ||
    slot.worker !== "provider" ||
    !Number.isFinite(nowMs) ||
    Date.parse(slot.expiresAt) <= nowMs
  ) {
    return null;
  }

  await ctx.db.patch(slot._id, {
    expiresAt: new Date(nowMs + generationSlotDurationMs).toISOString(),
    heartbeatAt: now,
    updatedAt: now,
    worker: undefined,
  });

  return await ctx.db.get(slot._id);
}
