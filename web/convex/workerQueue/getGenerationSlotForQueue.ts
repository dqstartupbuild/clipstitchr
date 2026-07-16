import type { MutationCtx } from "../_generated/server";

export async function getGenerationSlotForQueue(
  ctx: MutationCtx,
  args: {
    generationSlotId: string;
    now: string;
    ownerId: string;
    sourceKind: "provider_job" | "media_job" | "automation_task";
    worker: "provider" | "media";
  },
) {
  const slot = await ctx.db
    .query("generationSlots")
    .withIndex("by_slot", (query) => query.eq("slotId", args.generationSlotId))
    .unique();
  const nowMs = Date.parse(args.now);
  const isProviderToMediaHandoff =
    args.sourceKind === "media_job" &&
    args.worker === "media" &&
    slot?.worker === "provider";
  const hasCompatibleWorker =
    slot?.worker === undefined ||
    slot?.worker === args.worker ||
    isProviderToMediaHandoff;

  if (
    !slot ||
    slot.ownerId !== args.ownerId ||
    slot.provenance === "browser" ||
    slot.idempotencyKey.startsWith("browser:") ||
    slot.state !== "active" ||
    !Number.isFinite(nowMs) ||
    Date.parse(slot.expiresAt) <= nowMs ||
    !hasCompatibleWorker
  ) {
    throw new Error("Generation slot is not active for this queue entry.");
  }

  return slot;
}
