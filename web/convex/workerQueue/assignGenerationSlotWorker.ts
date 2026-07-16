import type { MutationCtx } from "../_generated/server";
import { getWorkerQueueGlobalLimit } from "./getWorkerQueueGlobalLimit";
import { getWorkerQueueToolLimit } from "./getWorkerQueueToolLimit";
import { getActiveGenerationSlots } from "./getActiveGenerationSlots";
import { getCanAcquireGenerationSlot } from "./getCanAcquireGenerationSlot";
import { generationSlotDurationMs } from "./generationSlotDurationMs";

export async function assignGenerationSlotWorker(
  ctx: MutationCtx,
  args: {
    domainJobId: string;
    now: string;
    ownerId: string;
    slotId: string;
    tool: string;
    worker: "provider" | "media";
  },
) {
  const slot = await ctx.db
    .query("generationSlots")
    .withIndex("by_slot", (query) => query.eq("slotId", args.slotId))
    .unique();
  const nowMs = Date.parse(args.now);

  if (
    !slot ||
    slot.ownerId !== args.ownerId ||
    slot.state !== "active" ||
    Date.parse(slot.expiresAt) <= nowMs
  ) {
    return null;
  }

  if (slot.worker === args.worker) {
    return slot;
  }

  if (slot.worker !== undefined) {
    return null;
  }

  const slots = await getActiveGenerationSlots(ctx);
  const canAssign = getCanAcquireGenerationSlot({
    enforceOwnerLimit: false,
    globalLimit: getWorkerQueueGlobalLimit(args.worker),
    now: args.now,
    ownerId: args.ownerId,
    planKey: slot.planKeySnapshot,
    slots,
    tool: args.tool,
    toolLimit: getWorkerQueueToolLimit(args.tool),
    worker: args.worker,
  });

  if (!canAssign) {
    return null;
  }

  await ctx.db.patch(slot._id, {
    domainJobId: args.domainJobId,
    expiresAt: new Date(nowMs + generationSlotDurationMs).toISOString(),
    heartbeatAt: args.now,
    tool: args.tool,
    updatedAt: args.now,
    worker: args.worker,
  });

  return await ctx.db.get(slot._id);
}
