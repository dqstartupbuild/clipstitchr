import type { MutationCtx } from "../_generated/server";
import { getActiveGenerationSlots } from "./getActiveGenerationSlots";
import { getCanAcquireGenerationSlot } from "./getCanAcquireGenerationSlot";
import { getWorkerQueueGlobalLimit } from "./getWorkerQueueGlobalLimit";
import { getWorkerQueueToolLimit } from "./getWorkerQueueToolLimit";

export async function canAssignGenerationSlotWorker(
  ctx: MutationCtx,
  args: {
    now: string;
    slotId: string;
    tool: string;
    worker: "provider" | "media";
  },
) {
  const slot = await ctx.db
    .query("generationSlots")
    .withIndex("by_slot", (query) => query.eq("slotId", args.slotId))
    .unique();

  if (
    !slot ||
    slot.state !== "active" ||
    slot.worker !== undefined ||
    Date.parse(slot.expiresAt) <= Date.parse(args.now)
  ) {
    return false;
  }

  const slots = await getActiveGenerationSlots(ctx);

  return getCanAcquireGenerationSlot({
    enforceOwnerLimit: false,
    globalLimit: getWorkerQueueGlobalLimit(args.worker),
    now: args.now,
    ownerId: slot.ownerId,
    planKey: slot.planKeySnapshot,
    slots,
    tool: args.tool,
    toolLimit: getWorkerQueueToolLimit(args.tool),
    worker: args.worker,
  });
}
