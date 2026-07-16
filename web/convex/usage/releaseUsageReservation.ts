import { v } from "convex/values";
import type { MutationCtx } from "../_generated/server";
import { internalMutation } from "../_generated/server";
import { appendUsageLedgerEntry } from "./appendUsageLedgerEntry";
import { createUsageError } from "./createUsageError";
import { getCreditGrantAvailableAmount } from "./getCreditGrantAvailableAmount";
import { getCurrentUsagePeriod } from "./getCurrentUsagePeriod";
import { releaseGenerationSlot } from "../workerQueue/releaseGenerationSlot";

export async function releaseUsageReservationForOwner(
  ctx: MutationCtx,
  ownerId: string,
  reservationId: string,
  now: string,
  reason: string,
  nextState: "released" | "expired" = "released",
) {
  const reservation = await ctx.db
    .query("usageReservations")
    .withIndex("by_reservation", (query) =>
      query.eq("reservationId", reservationId),
    )
    .unique();

  if (!reservation || reservation.ownerId !== ownerId) {
    throw new Error("Usage reservation not found.");
  }

  if (reservation.state === "released" || reservation.state === "expired") {
    return reservation;
  }

  if (reservation.state === "committed") {
    return reservation;
  }

  if (!reservation.periodKey) {
    throw createUsageError({
      code: "USAGE_RECONCILIATION_REQUIRED",
      message: "This creation is missing its billing period.",
    });
  }

  const period = await getCurrentUsagePeriod(
    ctx,
    ownerId,
    reservation.periodKey,
  );

  if (!period) {
    throw createUsageError({
      code: "USAGE_RECONCILIATION_REQUIRED",
      message: "This creation is missing its billing period.",
    });
  }

  if (reservation.resource === "creation_credit") {
    const allocations = await ctx.db
      .query("usageReservationAllocations")
      .withIndex("by_reservation", (query) =>
        query.eq("reservationId", reservationId),
      )
      .collect();

    for (const allocation of allocations) {
      if (allocation.state !== "reserved") {
        continue;
      }

      const grant = await ctx.db
        .query("creditGrants")
        .withIndex("by_grant", (query) =>
          query.eq("grantId", allocation.grantId),
        )
        .unique();

      if (!grant || grant.ownerId !== ownerId) {
        throw createUsageError({
          code: "USAGE_RECONCILIATION_REQUIRED",
          message: "This creation has an invalid credit allocation.",
        });
      }

      const nextGrant = {
        ...grant,
        amountReserved: grant.amountReserved - allocation.amount,
      };
      await ctx.db.patch(grant._id, {
        amountReserved: nextGrant.amountReserved,
        status:
          grant.status === "exhausted" &&
          getCreditGrantAvailableAmount(nextGrant) > 0
            ? "available"
            : grant.status,
        updatedAt: now,
      });
      await ctx.db.patch(allocation._id, { state: "released", updatedAt: now });
    }

    await ctx.db.patch(period._id, {
      creationCreditsReserved:
        period.creationCreditsReserved - reservation.amount,
      updatedAt: now,
    });
  } else {
    await ctx.db.patch(period._id, {
      aiVideosReserved: period.aiVideosReserved - reservation.amount,
      updatedAt: now,
    });
  }

  await ctx.db.patch(reservation._id, {
    releaseReason: reason,
    releasedAt: now,
    state: nextState,
    updatedAt: now,
  });
  await appendUsageLedgerEntry(ctx, {
    availableDelta: reservation.amount,
    batchId: reservation.batchId,
    consumedDelta: 0,
    createdAt: now,
    domainId: reservation.domainId,
    domainKind: reservation.domainKind,
    entryType: nextState === "expired" ? "expire" : "release",
    idempotencyKey: `${reservationId}:${nextState}`,
    operation: reservation.operation,
    ownerId,
    periodKey: reservation.periodKey,
    planKeySnapshot: reservation.planKeySnapshot,
    quantity: reservation.amount,
    reason,
    reservationId,
    reservedDelta: -reservation.amount,
    resource: reservation.resource,
    source: nextState === "expired" ? "reconciler" : "worker",
  });
  await releaseGenerationSlot(
    ctx,
    reservation.generationSlotId,
    now,
    reason,
    nextState === "expired" ? "expired" : "released",
  );

  return await ctx.db.get(reservation._id);
}

export const releaseUsageReservation = internalMutation({
  args: {
    nextState: v.optional(v.union(v.literal("released"), v.literal("expired"))),
    now: v.string(),
    ownerId: v.string(),
    reason: v.string(),
    reservationId: v.string(),
  },
  handler: async (ctx, { nextState, now, ownerId, reason, reservationId }) =>
    await releaseUsageReservationForOwner(
      ctx,
      ownerId,
      reservationId,
      now,
      reason,
      nextState,
    ),
});
