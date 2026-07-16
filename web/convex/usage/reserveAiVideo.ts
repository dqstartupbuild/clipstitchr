import { v } from "convex/values";
import type { MutationCtx } from "../_generated/server";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertOwnerCanGenerate } from "../billing/assertOwnerCanGenerate";
import { getUsageReservationExpiry } from "../../lib/clipstitchr/usage/getUsageReservationExpiry";
import { usageOperationValidator } from "../validators/usageOperation";
import type { UsageOperation } from "../../lib/clipstitchr/usage/types/UsageOperation";
import { appendUsageLedgerEntry } from "./appendUsageLedgerEntry";
import { createUsageError } from "./createUsageError";
import { createUsagePeriodKey } from "./createUsagePeriodKey";
import { getCurrentUsagePeriod } from "./getCurrentUsagePeriod";

type ReserveAiVideoArgs = {
  batchId?: string;
  domainId: string;
  domainKind: string;
  idempotencyKey: string;
  now: string;
  operation: UsageOperation;
  source: "user_action" | "worker";
};

export async function reserveAiVideoForOwner(
  ctx: MutationCtx,
  ownerId: string,
  args: ReserveAiVideoArgs,
) {
  if (args.operation !== "clipr_video" && args.operation !== "swapr_video") {
    throw new Error("AI-video reservations require Clipr or Swapr.");
  }

  const existing = await ctx.db
    .query("usageReservations")
    .withIndex("by_idempotency_key", (query) =>
      query.eq("idempotencyKey", args.idempotencyKey),
    )
    .unique();

  if (existing) {
    if (
      existing.ownerId !== ownerId ||
      existing.operation !== args.operation ||
      existing.domainId !== args.domainId ||
      existing.resource !== "ai_video"
    ) {
      throw createUsageError({
        code: "USAGE_RESERVATION_CONFLICT",
        message: "This video request conflicts with an earlier request.",
      });
    }

    return {
      amount: existing.amount,
      planKey: existing.planKeySnapshot,
      reservationId: existing.reservationId,
      state: existing.state,
    };
  }

  const entitlement = await assertOwnerCanGenerate(ctx, ownerId, args.now);
  const periodKey = createUsagePeriodKey(
    entitlement.stripeSubscriptionId,
    entitlement.currentPeriodStart,
  );
  const period = await getCurrentUsagePeriod(ctx, ownerId, periodKey);

  if (!period) {
    throw createUsageError({
      code: "USAGE_RECONCILIATION_REQUIRED",
      message: "Your current video allowance is still syncing. Try again shortly.",
    });
  }

  const available =
    period.aiVideosGranted +
    period.aiVideosAdjusted -
    period.aiVideosReserved -
    period.aiVideosConsumed;

  if (available < 1) {
    throw createUsageError({
      available: Math.max(0, available),
      code: "AI_VIDEO_ALLOWANCE_REACHED",
      message: `Your current plan includes ${period.aiVideosGranted + period.aiVideosAdjusted} Clipr or Swapr videos this month.`,
      required: 1,
      resetsAt: period.periodEnd,
    });
  }

  const reservationId = `video:${args.idempotencyKey}`;

  await ctx.db.patch(period._id, {
    aiVideosReserved: period.aiVideosReserved + 1,
    updatedAt: args.now,
  });
  await ctx.db.insert("usageReservations", {
    amount: 1,
    batchId: args.batchId,
    createdAt: args.now,
    domainId: args.domainId,
    domainKind: args.domainKind,
    expiresAt: getUsageReservationExpiry(args.now, "worker"),
    idempotencyKey: args.idempotencyKey,
    operation: args.operation,
    ownerId,
    periodKey,
    planKeySnapshot: entitlement.planKey,
    reservationId,
    resource: "ai_video",
    state: "reserved",
    updatedAt: args.now,
  });
  await appendUsageLedgerEntry(ctx, {
    availableDelta: -1,
    batchId: args.batchId,
    consumedDelta: 0,
    createdAt: args.now,
    domainId: args.domainId,
    domainKind: args.domainKind,
    entryType: "reserve",
    idempotencyKey: `${reservationId}:reserve`,
    operation: args.operation,
    ownerId,
    periodKey,
    planKeySnapshot: entitlement.planKey,
    quantity: 1,
    reservationId,
    reservedDelta: 1,
    resource: "ai_video",
    source: args.source,
  });

  return {
    amount: 1,
    planKey: entitlement.planKey,
    reservationId,
    state: "reserved" as const,
  };
}

export const reserveAiVideo = mutation({
  args: {
    batchId: v.optional(v.string()),
    domainId: v.string(),
    domainKind: v.string(),
    idempotencyKey: v.string(),
    now: v.string(),
    operation: usageOperationValidator,
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    return await reserveAiVideoForOwner(ctx, ownerId, {
      ...args,
      source: "user_action",
    });
  },
});
