import type { MutationCtx } from "../_generated/server";
import { getPlanPolicy } from "../../lib/clipstitchr/billing/getPlanPolicy";
import type { PlanKey } from "../../lib/clipstitchr/billing/types/PlanKey";
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
  const nowMs = Date.parse(args.now);
  const ownerSlots = await ctx.db
    .query("generationSlots")
    .withIndex("by_owner_state", (query) =>
      query.eq("ownerId", args.ownerId).eq("state", "active"),
    )
    .collect();

  if (
    ownerSlots.filter((slot) => Date.parse(slot.expiresAt) > nowMs).length >=
    getPlanPolicy(args.planKey).activeGenerationLimit
  ) {
    return false;
  }

  const globalSlots = await ctx.db
    .query("generationSlots")
    .withIndex("by_state_expiry", (query) => query.eq("state", "active"))
    .collect();
  const activeGlobalSlots = globalSlots.filter(
    (slot) => Date.parse(slot.expiresAt) > nowMs,
  );

  if (activeGlobalSlots.length >= getWorkerQueueGlobalLimit(args.worker)) {
    return false;
  }

  const toolLimit = getWorkerQueueToolLimit(args.tool);

  return (
    toolLimit === null ||
    activeGlobalSlots.filter((slot) => slot.tool === args.tool).length < toolLimit
  );
}
