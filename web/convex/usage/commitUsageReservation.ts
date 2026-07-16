import { v } from "convex/values";
import type { MutationCtx } from "../_generated/server";
import { internalMutation } from "../_generated/server";
import { appendUsageLedgerEntry } from "./appendUsageLedgerEntry";
import { createUsageError } from "./createUsageError";
import { getCreditGrantAvailableAmount } from "./getCreditGrantAvailableAmount";
import { getCurrentUsagePeriod } from "./getCurrentUsagePeriod";
import { releaseGenerationSlot } from "../workerQueue/releaseGenerationSlot";
import type { UsageReservationCommitBinding } from "../../lib/clipstitchr/usage/types/UsageReservationCommitBinding";
import { usageOperationValidator } from "../validators/usageOperation";
import { usageReservationKindValidator } from "../validators/usageReservationKind";
import { usageResourceValidator } from "../validators/usageResource";
import { assertUsageReservationCommitBinding } from "./assertUsageReservationCommitBinding";

export async function commitUsageReservationForOwner(
  ctx: MutationCtx,
  ownerId: string,
  reservationId: string,
  now: string,
  source: "user_action" | "worker" | "reconciler",
  binding: UsageReservationCommitBinding,
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

  assertUsageReservationCommitBinding(reservation, binding);

  if (reservation.state === "committed") {
    return reservation;
  }

  if (reservation.state !== "reserved") {
    throw createUsageError({
      code: "USAGE_RESERVATION_EXPIRED",
      message: "This creation reservation expired before it finished.",
    });
  }

  if (Date.parse(reservation.expiresAt) <= Date.parse(now)) {
    throw createUsageError({
      code: "USAGE_RESERVATION_EXPIRED",
      message: "This creation reservation expired before it finished.",
    });
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
        amountConsumed: grant.amountConsumed + allocation.amount,
        amountReserved: grant.amountReserved - allocation.amount,
      };
      await ctx.db.patch(grant._id, {
        amountConsumed: nextGrant.amountConsumed,
        amountReserved: nextGrant.amountReserved,
        status:
          getCreditGrantAvailableAmount(nextGrant) <= 0
            ? "exhausted"
            : grant.status,
        updatedAt: now,
      });
      await ctx.db.patch(allocation._id, {
        state: "committed",
        updatedAt: now,
      });
    }

    await ctx.db.patch(period._id, {
      creationCreditsConsumed:
        period.creationCreditsConsumed + reservation.amount,
      creationCreditsReserved:
        period.creationCreditsReserved - reservation.amount,
      updatedAt: now,
    });
  } else {
    await ctx.db.patch(period._id, {
      aiVideosConsumed: period.aiVideosConsumed + reservation.amount,
      aiVideosReserved: period.aiVideosReserved - reservation.amount,
      updatedAt: now,
    });
  }

  await ctx.db.patch(reservation._id, {
    commitDomainId: binding.domainId,
    commitDomainKind: binding.domainKind,
    committedAt: now,
    state: "committed",
    updatedAt: now,
  });
  await appendUsageLedgerEntry(ctx, {
    availableDelta: 0,
    batchId: reservation.batchId,
    consumedDelta: reservation.amount,
    createdAt: now,
    domainId: reservation.domainId,
    domainKind: reservation.domainKind,
    entryType: "commit",
    idempotencyKey: `${reservationId}:commit`,
    operation: reservation.operation,
    ownerId,
    periodKey: reservation.periodKey,
    planKeySnapshot: reservation.planKeySnapshot,
    quantity: reservation.amount,
    reservationId,
    reservedDelta: -reservation.amount,
    resource: reservation.resource,
    source,
  });
  await releaseGenerationSlot(
    ctx,
    reservation.generationSlotId,
    now,
    "Browser creation completed",
  );

  return await ctx.db.get(reservation._id);
}

export const commitUsageReservation = internalMutation({
  args: {
    now: v.string(),
    ownerId: v.string(),
    reservationId: v.string(),
    binding: v.object({
      domainId: v.string(),
      domainKind: v.string(),
      operation: usageOperationValidator,
      reservationKind: usageReservationKindValidator,
      resource: usageResourceValidator,
    }),
    source: v.union(
      v.literal("user_action"),
      v.literal("worker"),
      v.literal("reconciler"),
    ),
  },
  handler: async (ctx, { binding, now, ownerId, reservationId, source }) =>
    await commitUsageReservationForOwner(
      ctx,
      ownerId,
      reservationId,
      now,
      source,
      binding,
    ),
});
