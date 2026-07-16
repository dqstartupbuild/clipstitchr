import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";
import { releaseUsageReservationForOwner } from "./releaseUsageReservation";

export const releaseUsageReservationsFromProvider = mutation({
  args: {
    now: v.string(),
    ownerId: v.string(),
    reason: v.string(),
    reservationIds: v.array(v.string()),
    secret: v.string(),
  },
  handler: async (ctx, { now, ownerId, reason, reservationIds, secret }) => {
    assertProviderWorkerSecret(secret);

    for (const reservationId of Array.from(new Set(reservationIds))) {
      await releaseUsageReservationForOwner(
        ctx,
        ownerId,
        reservationId,
        now,
        reason,
      );
    }

    return { releasedCount: reservationIds.length };
  },
});
