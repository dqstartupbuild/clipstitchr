import type { MutationCtx } from "../_generated/server";
import { getPlanPolicy } from "../../lib/clipstitchr/billing/getPlanPolicy";
import type { PlanKey } from "../../lib/clipstitchr/billing/types/PlanKey";
import { getWorkerQueueGlobalLimit } from "./getWorkerQueueGlobalLimit";
import { getWorkerQueueToolLimit } from "./getWorkerQueueToolLimit";

export async function acquireGenerationSlot(
  ctx: MutationCtx,
  args: {
    domainJobId: string;
    idempotencyKey: string;
    now: string;
    ownerId: string;
    planKey: PlanKey;
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

  if (existing?.state === "active") {
    return existing;
  }

  const nowMs = Date.parse(args.now);
  const ownerSlots = await ctx.db
    .query("generationSlots")
    .withIndex("by_owner_state", (query) =>
      query.eq("ownerId", args.ownerId).eq("state", "active"),
    )
    .collect();
  const activeOwnerSlots = ownerSlots.filter(
    (slot) => Date.parse(slot.expiresAt) > nowMs,
  );

  if (activeOwnerSlots.length >= getPlanPolicy(args.planKey).activeGenerationLimit) {
    return null;
  }

  const globalSlots = await ctx.db
    .query("generationSlots")
    .withIndex("by_state_expiry", (query) => query.eq("state", "active"))
    .collect();
  const activeGlobalSlots = globalSlots.filter(
    (slot) => Date.parse(slot.expiresAt) > nowMs,
  );

  if (
    activeGlobalSlots.length >= getWorkerQueueGlobalLimit(args.worker)
  ) {
    return null;
  }

  const toolLimit = getWorkerQueueToolLimit(args.tool);

  if (
    toolLimit !== null &&
    activeGlobalSlots.filter((slot) => slot.tool === args.tool).length >= toolLimit
  ) {
    return null;
  }

  const slotId = `generation:${args.idempotencyKey}`;
  const expiresAt = new Date(nowMs + 45 * 60_000).toISOString();

  if (existing) {
    await ctx.db.patch(existing._id, {
      acquiredAt: args.now,
      expiresAt,
      heartbeatAt: args.now,
      planKeySnapshot: args.planKey,
      releaseReason: undefined,
      releasedAt: undefined,
      state: "active",
      updatedAt: args.now,
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
    slotId,
    state: "active",
    tool: args.tool,
    updatedAt: args.now,
  });

  return await ctx.db.get(id);
}
