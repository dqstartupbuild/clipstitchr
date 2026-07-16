import type { MutationCtx } from "../_generated/server";
import type { PlanKey } from "../../lib/clipstitchr/billing/types/PlanKey";
import { getActiveGenerationSlots } from "./getActiveGenerationSlots";
import { getCanAcquireGenerationSlot } from "./getCanAcquireGenerationSlot";
import { getWorkerQueueGlobalLimit } from "./getWorkerQueueGlobalLimit";
import { getWorkerQueueToolLimit } from "./getWorkerQueueToolLimit";

export async function canAcquireGenerationSlot(
  ctx: MutationCtx,
  args: {
    now: string;
    ownerId: string;
    planKey: PlanKey;
    tool: string;
    worker: "provider" | "media";
  },
) {
  const slots = await getActiveGenerationSlots(ctx);

  return getCanAcquireGenerationSlot({
    enforceOwnerLimit: true,
    globalLimit: getWorkerQueueGlobalLimit(args.worker),
    now: args.now,
    ownerId: args.ownerId,
    planKey: args.planKey,
    slots,
    tool: args.tool,
    toolLimit: getWorkerQueueToolLimit(args.tool),
    worker: args.worker,
  });
}
