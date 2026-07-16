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
  handler: async (ctx, { now, reason, reservationId }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    return await releaseUsageReservationForOwner(
      ctx,
      ownerId,
      reservationId,
      now,
      reason,
    );
  },
});
