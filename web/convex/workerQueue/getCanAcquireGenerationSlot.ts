import type { PlanKey } from "../../lib/clipstitchr/billing/types/PlanKey";
import { getPlanPolicy } from "../../lib/clipstitchr/billing/getPlanPolicy";

export function getCanAcquireGenerationSlot(args: {
  enforceOwnerLimit: boolean;
  globalLimit: number;
  now: string;
  ownerId: string;
  planKey: PlanKey;
  slots: Array<{
    expiresAt: string;
    ownerId: string;
    state: string;
    tool: string;
    worker?: "provider" | "media";
  }>;
  tool: string;
  toolLimit: number | null;
  worker: "provider" | "media";
}) {
  const nowMs = Date.parse(args.now);
  const activeSlots = args.slots.filter(
    (slot) => slot.state === "active" && Date.parse(slot.expiresAt) > nowMs,
  );

  if (
    args.enforceOwnerLimit &&
    activeSlots.filter((slot) => slot.ownerId === args.ownerId).length >=
      getPlanPolicy(args.planKey).activeGenerationLimit
  ) {
    return false;
  }

  const activeWorkerSlots = activeSlots.filter(
    (slot) => slot.worker === args.worker,
  );

  if (activeWorkerSlots.length >= args.globalLimit) {
    return false;
  }

  return (
    args.toolLimit === null ||
    activeWorkerSlots.filter((slot) => slot.tool === args.tool).length <
      args.toolLimit
  );
}
