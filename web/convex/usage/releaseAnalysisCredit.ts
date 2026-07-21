import { v } from "convex/values";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { mutation } from "../_generated/server";
import { releaseUsageReservationForOwner } from "./releaseUsageReservation";

export const releaseAnalysisCredit = mutation({
  args: {
    now: v.string(),
    reason: v.string(),
    reservationId: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, { now, reason, reservationId, secret }) => {
    assertRateLimitApiSecret(secret);
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
