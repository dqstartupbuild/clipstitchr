import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { releaseUsageReservationForOwner } from "./releaseUsageReservation";

export const cancelUsageReservation = mutation({
  args: {
    now: v.string(),
    reason: v.string(),
    reservationId: v.string(),
  },
  handler: async (ctx, { reason, reservationId }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const now = new Date().toISOString();
    const reservation = await ctx.db
      .query("usageReservations")
      .withIndex("by_reservation", (query) =>
        query.eq("reservationId", reservationId),
      )
      .unique();

    if (!reservation || reservation.ownerId !== ownerId) {
      throw new Error("Usage reservation not found.");
    }

    if (
      reservation.reservationKind === undefined ||
      reservation.workerQueueLinkedAt !== undefined
    ) {
      throw new Error(
        "This creation is already queued and cannot be canceled here.",
      );
    }

    return await releaseUsageReservationForOwner(
      ctx,
      ownerId,
      reservationId,
      now,
      reason,
    );
  },
});
