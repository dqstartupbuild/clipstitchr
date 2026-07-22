import type { MutationCtx } from "../_generated/server";
import { reserveAiVideoForOwner } from "./reserveAiVideo";
import { reserveCreationCreditsForOwner } from "./reserveCreationCredits";
import { releaseUsageReservationForOwner } from "./releaseUsageReservation";
import type { UsageReservationCommitBinding } from "../../lib/clipstitchr/usage/types/UsageReservationCommitBinding";
import { assertUsageReservationCommitBinding } from "./assertUsageReservationCommitBinding";

export async function reacquireUsageReservation(
  ctx: MutationCtx,
  ownerId: string,
  reservationId: string,
  now: string,
  binding: UsageReservationCommitBinding,
) {
  let currentReservationId = reservationId;

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const reservation = await ctx.db
      .query("usageReservations")
      .withIndex("by_reservation", (query) =>
        query.eq("reservationId", currentReservationId),
      )
      .unique();

    if (!reservation || reservation.ownerId !== ownerId) {
      throw new Error("Usage reservation not found.");
    }

    assertUsageReservationCommitBinding(reservation, binding);

    if (reservation.state === "committed") {
      return reservation.reservationId;
    }

    if (
      reservation.state === "reserved" &&
      Date.parse(reservation.expiresAt) > Date.parse(now)
    ) {
      return reservation.reservationId;
    }

    if (reservation.state === "reserved") {
      await releaseUsageReservationForOwner(
        ctx,
        ownerId,
        reservation.reservationId,
        now,
        "Reservation expired before final save",
        "expired",
      );
    }

    const commonArgs = {
      batchId: reservation.batchId,
      domainId: reservation.domainId,
      domainKind: reservation.domainKind,
      idempotencyKey: `${reservation.idempotencyKey}:reacquire`,
      now,
      operation: reservation.operation,
      source:
        binding.reservationKind === "browser" ||
        binding.reservationKind === "server"
          ? ("user_action" as const)
          : ("worker" as const),
    };
    const reacquired =
      reservation.resource === "ai_video"
        ? await reserveAiVideoForOwner(ctx, ownerId, commonArgs)
        : await reserveCreationCreditsForOwner(ctx, ownerId, {
            ...commonArgs,
            reservationKind: binding.reservationKind,
          });

    if (!reacquired.reservationId) {
      throw new Error("Unable to reacquire usage for this output.");
    }

    const replacementReservationId = reacquired.reservationId;

    const replacement = await ctx.db
      .query("usageReservations")
      .withIndex("by_reservation", (query) =>
        query.eq("reservationId", replacementReservationId),
      )
      .unique();

    if (
      replacement &&
      reservation.workerQueueEntryId &&
      replacement.workerQueueEntryId === undefined
    ) {
      await ctx.db.patch(replacement._id, {
        updatedAt: now,
        workerQueueEntryId: reservation.workerQueueEntryId,
        workerQueueLinkedAt: reservation.workerQueueLinkedAt ?? now,
      });
    }

    currentReservationId = replacementReservationId;
  }

  throw new Error("Unable to reacquire usage for this output.");
}
