import type { MutationCtx } from "../_generated/server";
import type { PlanKey } from "../../lib/clipstitchr/billing/types/PlanKey";
import type { GenerationSlotProvenance } from "../../lib/clipstitchr/usage/types/GenerationSlotProvenance";
import { getWorkerQueueGlobalLimit } from "./getWorkerQueueGlobalLimit";
import { getWorkerQueueToolLimit } from "./getWorkerQueueToolLimit";
import { getActiveGenerationSlots } from "./getActiveGenerationSlots";
import { getCanAcquireGenerationSlot } from "./getCanAcquireGenerationSlot";
import { generationSlotDurationMs } from "./generationSlotDurationMs";

export async function acquireGenerationSlot(
  ctx: MutationCtx,
  args: {
    domainJobId: string;
    idempotencyKey: string;
    now: string;
    ownerId: string;
    planKey: PlanKey;
    provenance: GenerationSlotProvenance;
    tool: string;
    worker: "provider" | "media";
  },
) {
  const existing = await ctx.db
    .query("generationSlots")
    .withIndex("by_idempotency_key", (query) =>
      query.eq("idempotencyKey", args.idempotencyKey),
    )
    .unique();

  if (existing && existing.ownerId !== args.ownerId) {
    return null;
  }

  if (
    existing?.provenance !== undefined &&
    existing.provenance !== args.provenance
  ) {
    return null;
  }

  const nowMs = Date.parse(args.now);

  if (existing?.state === "active" && Date.parse(existing.expiresAt) > nowMs) {
    if (existing.worker === args.worker) {
      if (existing.provenance === undefined) {
        await ctx.db.patch(existing._id, {
          provenance: args.provenance,
          updatedAt: args.now,
        });

        return await ctx.db.get(existing._id);
      }

      return existing;
    }

    if (existing.worker !== undefined) {
      return null;
    }

    const activeSlots = await getActiveGenerationSlots(ctx);
    const canAssignExisting = getCanAcquireGenerationSlot({
      enforceOwnerLimit: false,
      globalLimit: getWorkerQueueGlobalLimit(args.worker),
      now: args.now,
      ownerId: args.ownerId,
      planKey: args.planKey,
      slots: activeSlots,
      tool: args.tool,
      toolLimit: getWorkerQueueToolLimit(args.tool),
      worker: args.worker,
    });

    if (!canAssignExisting) {
      return null;
    }

    await ctx.db.patch(existing._id, {
      expiresAt: new Date(nowMs + generationSlotDurationMs).toISOString(),
      heartbeatAt: args.now,
      tool: args.tool,
      updatedAt: args.now,
      worker: args.worker,
    });

    return await ctx.db.get(existing._id);
  }

  const slots = await getActiveGenerationSlots(ctx);
  const canAcquire = getCanAcquireGenerationSlot({
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

  if (!canAcquire) {
    return null;
  }

  const slotId = `generation:${args.idempotencyKey}`;
  const expiresAt = new Date(nowMs + generationSlotDurationMs).toISOString();

  if (existing) {
    await ctx.db.patch(existing._id, {
      acquiredAt: args.now,
      expiresAt,
      heartbeatAt: args.now,
      planKeySnapshot: args.planKey,
      provenance: args.provenance,
      releaseReason: undefined,
      releasedAt: undefined,
      state: "active",
      tool: args.tool,
      updatedAt: args.now,
      worker: args.worker,
    });

    return await ctx.db.get(existing._id);
  }

  const id = await ctx.db.insert("generationSlots", {
    acquiredAt: args.now,
    createdAt: args.now,
    domainJobId: args.domainJobId,
    expiresAt,
    heartbeatAt: args.now,
    idempotencyKey: args.idempotencyKey,
    ownerId: args.ownerId,
    planKeySnapshot: args.planKey,
    provenance: args.provenance,
    slotId,
    state: "active",
    tool: args.tool,
    updatedAt: args.now,
    worker: args.worker,
  });

  return await ctx.db.get(id);
}
