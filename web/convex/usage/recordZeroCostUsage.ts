import type { MutationCtx } from "../_generated/server";
import type { PlanKey } from "../../lib/clipstitchr/billing/types/PlanKey";
import type { UsageOperation } from "../../lib/clipstitchr/usage/types/UsageOperation";

export async function recordZeroCostUsage(
  ctx: MutationCtx,
  entry: {
    batchId?: string;
    createdAt: string;
    domainId: string;
    domainKind: string;
    generationSlotId?: string;
    idempotencyKey: string;
    operation: UsageOperation;
    ownerId: string;
    planKeySnapshot: PlanKey;
    source: "user_action" | "worker";
  },
) {
  const existing = await ctx.db
    .query("zeroCostUsageEvents")
    .withIndex("by_idempotency_key", (query) =>
      query.eq("idempotencyKey", entry.idempotencyKey),
    )
    .unique();

  if (existing) {
    return existing._id;
  }

  return await ctx.db.insert("zeroCostUsageEvents", {
    ...entry,
    eventId: entry.idempotencyKey,
  });
}
