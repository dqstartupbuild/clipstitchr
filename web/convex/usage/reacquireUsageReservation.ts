import type { MutationCtx } from "../_generated/server";
import { reserveAiVideoForOwner } from "./reserveAiVideo";
import { reserveCreationCreditsForOwner } from "./reserveCreationCredits";
import { releaseUsageReservationForOwner } from "./releaseUsageReservation";

export async function reacquireUsageReservation(
  ctx: MutationCtx,
  ownerId: string,
  reservationId: string,
  now: string,
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

  const idempotencyKey = `${reservation.idempotencyKey}:reacquire:${now}`;
  const commonArgs = {
    batchId: reservation.batchId,
    domainId: reservation.domainId,
    domainKind: reservation.domainKind,
    idempotencyKey,
    now,
    operation: reservation.operation,
    source: "worker" as const,
  };
  const reacquired =
    reservation.resource === "ai_video"
      ? await reserveAiVideoForOwner(ctx, ownerId, commonArgs)
      : await reserveCreationCreditsForOwner(ctx, ownerId, {
          ...commonArgs,
          reservationKind: "worker",
        });

  if (!reacquired.reservationId) {
    throw new Error("Unable to reacquire usage for this output.");
  }

  return reacquired.reservationId;
}
