import { v } from "convex/values";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { mutation } from "../_generated/server";
import { reserveCreationCreditsForOwner } from "./reserveCreationCredits";

export const reserveAnalysisCredit = mutation({
  args: {
    domainId: v.string(),
    idempotencyKey: v.string(),
    now: v.string(),
    operation: v.union(
      v.literal("ai_analysis"),
      v.literal("hook_lab_analysis"),
    ),
    secret: v.string(),
  },
  handler: async (ctx, { secret, ...args }) => {
    assertRateLimitApiSecret(secret);
    const ownerId = await getAuthenticatedOwnerId(ctx);

    return await reserveCreationCreditsForOwner(ctx, ownerId, {
      ...args,
      domainKind: "analysis",
      reservationKind: "worker",
      source: "user_action",
    });
  },
});
