import { v } from "convex/values";
import type { MutationCtx } from "../_generated/server";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { assertOwnerCanGenerate } from "../billing/assertOwnerCanGenerate";
import { getEffectiveEntitlementState } from "../../lib/clipstitchr/billing/getEffectiveEntitlementState";
import { getCreationCreditCost } from "../../lib/clipstitchr/usage/getCreationCreditCost";
import { getUsageReservationExpiry } from "../../lib/clipstitchr/usage/getUsageReservationExpiry";
import type { UsageOperation } from "../../lib/clipstitchr/usage/types/UsageOperation";
import type { UsageReservationKind } from "../../lib/clipstitchr/usage/types/UsageReservationKind";
import { usageOperationValidator } from "../validators/usageOperation";
import { appendUsageLedgerEntry } from "./appendUsageLedgerEntry";
import { createUsageError } from "./createUsageError";
import { createUsagePeriodKey } from "./createUsagePeriodKey";
import { getCreditGrantAvailableAmount } from "./getCreditGrantAvailableAmount";
import { getCurrentUsagePeriod } from "./getCurrentUsagePeriod";
import { getEligibleCreditGrants } from "./getEligibleCreditGrants";
import { recordZeroCostUsage } from "./recordZeroCostUsage";
import { acquireGenerationSlot } from "../workerQueue/acquireGenerationSlot";

type ReserveCreationCreditsArgs = {
  batchId?: string;
  domainId: string;
  domainKind: string;
  idempotencyKey: string;
  now: string;
  operation: UsageOperation;
  reservationKind: UsageReservationKind;
  source: "user_action" | "worker";
};

export async function reserveCreationCreditsForOwner(
  ctx: MutationCtx,
  ownerId: string,
  args: ReserveCreationCreditsArgs,
) {
  if (
    args.reservationKind === "browser" &&
    (args.operation !== "stitch" || args.domainKind !== "stitch")
  ) {
    throw new Error("Browser reservations are only available for Stitchr.");
  }

  if (
    args.reservationKind === "server" &&
    (args.domainKind !== "analysis" ||
      (args.operation !== "ai_analysis" &&
        args.operation !== "hook_lab_script"))
  ) {
    throw new Error(
      "Server reservations are only available for direct analysis work.",
    );
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
      existing.resource !== "creation_credit" ||
      (existing.reservationKind !== undefined &&
        existing.reservationKind !== args.reservationKind)
    ) {
      throw createUsageError({
        code: "USAGE_RESERVATION_CONFLICT",
        message: "This creation request conflicts with an earlier request.",
      });
    }

    return {
      amount: existing.amount,
      planKey: existing.planKeySnapshot,
      generationSlotId: existing.generationSlotId ?? null,
      reservationId: existing.reservationId,
      state: existing.state,
    };
  }

  const entitlement = await assertOwnerCanGenerate(ctx, ownerId, args.now);
  const amount = getCreationCreditCost(entitlement.planKey, args.operation);
  const generationSlot =
    args.reservationKind === "browser"
      ? await acquireGenerationSlot(ctx, {
          domainJobId: args.domainId,
          idempotencyKey: `browser:${args.idempotencyKey}`,
          now: args.now,
          ownerId,
          planKey: entitlement.planKey,
          provenance: "browser",
          tool: args.operation === "stitch" ? "stitchr" : args.operation,
          worker: "media",
        })
      : null;

  if (args.reservationKind === "browser" && !generationSlot) {
    throw createUsageError({
      code: "GENERATION_CONCURRENCY_REACHED",
      message: `Your ${entitlement.planKey} plan already has its maximum number of creations running. Let one finish, then try again.`,
    });
  }

  if (amount === 0) {
    await recordZeroCostUsage(ctx, {
      batchId: args.batchId,
      createdAt: args.now,
      domainId: args.domainId,
      domainKind: args.domainKind,
      generationSlotId: generationSlot?.slotId,
      idempotencyKey: args.idempotencyKey,
      operation: args.operation,
      ownerId,
      planKeySnapshot: entitlement.planKey,
      source: args.source,
    });

    return {
      amount: 0,
      planKey: entitlement.planKey,
      generationSlotId: generationSlot?.slotId ?? null,
      reservationId: null,
      state: "committed" as const,
    };
  }

  const periodKey = createUsagePeriodKey(
    entitlement.stripeSubscriptionId,
    entitlement.currentPeriodStart,
  );
  const period = await getCurrentUsagePeriod(ctx, ownerId, periodKey);

  if (!period) {
    throw createUsageError({
      code: "USAGE_RECONCILIATION_REQUIRED",
      message: "Your current usage period is still syncing. Try again shortly.",
    });
  }

  const effectiveEntitlementState = getEffectiveEntitlementState(
    entitlement,
    args.now,
  );
  const grants = await getEligibleCreditGrants(
    ctx,
    ownerId,
    args.now,
    effectiveEntitlementState === "active" ||
      effectiveEntitlementState === "grace",
    entitlement.stripeSubscriptionId,
  );
  const available = grants.reduce(
    (total, grant) => total + getCreditGrantAvailableAmount(grant),
    0,
  );

  if (available < amount) {
    throw createUsageError({
      available,
      code: "INSUFFICIENT_CREATION_CREDITS",
      message: `You need ${amount} credits for this creation. You have ${available} available.`,
      required: amount,
      resetsAt: entitlement.currentPeriodEnd,
    });
  }

  const reservationId = `creation:${args.idempotencyKey}`;
  let amountRemaining = amount;

  for (const grant of grants) {
    if (amountRemaining <= 0) {
      break;
    }

    const allocationAmount = Math.min(
      amountRemaining,
      getCreditGrantAvailableAmount(grant),
    );

    if (allocationAmount <= 0) {
      continue;
    }

    await ctx.db.patch(grant._id, {
      amountReserved: grant.amountReserved + allocationAmount,
      updatedAt: args.now,
    });
    await ctx.db.insert("usageReservationAllocations", {
      amount: allocationAmount,
      createdAt: args.now,
      grantId: grant.grantId,
      ownerId,
      reservationId,
      state: "reserved",
      updatedAt: args.now,
    });
    amountRemaining -= allocationAmount;
  }

  await ctx.db.patch(period._id, {
    creationCreditsReserved: period.creationCreditsReserved + amount,
    updatedAt: args.now,
  });
  await ctx.db.insert("usageReservations", {
    amount,
    batchId: args.batchId,
    createdAt: args.now,
    domainId: args.domainId,
    domainKind: args.domainKind,
    expiresAt: getUsageReservationExpiry(args.now, args.reservationKind),
    generationSlotId: generationSlot?.slotId,
    idempotencyKey: args.idempotencyKey,
    operation: args.operation,
    ownerId,
    periodKey,
    planKeySnapshot: entitlement.planKey,
    reservationKind: args.reservationKind,
    reservationId,
    resource: "creation_credit",
    state: "reserved",
    updatedAt: args.now,
  });
  await appendUsageLedgerEntry(ctx, {
    availableDelta: -amount,
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
    quantity: amount,
    reservationId,
    reservedDelta: amount,
    resource: "creation_credit",
    source: args.source,
  });

  return {
    amount,
    generationSlotId: generationSlot?.slotId ?? null,
    planKey: entitlement.planKey,
    reservationId,
    state: "reserved" as const,
  };
}

export const reserveCreationCredits = mutation({
  args: {
    batchId: v.optional(v.string()),
    domainId: v.string(),
    domainKind: v.string(),
    idempotencyKey: v.string(),
    now: v.string(),
    operation: usageOperationValidator,
    reservationKind: v.union(v.literal("browser"), v.literal("worker")),
  },
  handler: async (ctx, args) => {
    const expectedReservationKind =
      args.operation === "stitch" && args.domainKind === "stitch"
        ? "browser"
        : "worker";

    if (args.reservationKind !== expectedReservationKind) {
      throw new Error("Creation reservation provenance is invalid.");
    }

    const ownerId = await getAuthenticatedOwnerId(ctx);
    const now = new Date().toISOString();

    return await reserveCreationCreditsForOwner(ctx, ownerId, {
      ...args,
      now,
      source: "user_action",
    });
  },
});
