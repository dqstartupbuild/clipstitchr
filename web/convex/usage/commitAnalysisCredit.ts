import { v } from "convex/values";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { mutation } from "../_generated/server";
import { commitUsageReservationForOwner } from "./commitUsageReservation";

export const commitAnalysisCredit = mutation({
  args: {
    domainId: v.string(),
    now: v.string(),
    operation: v.union(
      v.literal("ai_analysis"),
      v.literal("hook_lab_analysis"),
      v.literal("hook_lab_script"),
    ),
    reservationId: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, { domainId, now, operation, reservationId, secret }) => {
    assertRateLimitApiSecret(secret);
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const isDirectServerOperation =
      operation === "ai_analysis" || operation === "hook_lab_script";

    return await commitUsageReservationForOwner(
      ctx,
      ownerId,
      reservationId,
      now,
      "user_action",
      {
        domainId,
        domainKind: "analysis",
        operation,
        reservationKind: isDirectServerOperation ? "server" : "worker",
        resource: "creation_credit",
      },
    );
  },
});
