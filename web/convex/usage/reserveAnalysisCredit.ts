import { v } from "convex/values";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { mutation } from "../_generated/server";
import { releaseLegacyDirectAnalysisReservationsForOwner } from "./releaseLegacyDirectAnalysisReservationsForOwner";
import { reserveCreationCreditsForOwner } from "./reserveCreationCredits";

export const reserveAnalysisCredit = mutation({
  args: {
    domainId: v.string(),
    idempotencyKey: v.string(),
    now: v.string(),
    operation: v.union(
      v.literal("ai_analysis"),
      v.literal("hook_lab_analysis"),
      v.literal("hook_lab_script"),
    ),
    secret: v.string(),
  },
  handler: async (ctx, { secret, ...args }) => {
    assertRateLimitApiSecret(secret);
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const isDirectServerOperation =
      args.operation === "ai_analysis" || args.operation === "hook_lab_script";

    if (isDirectServerOperation) {
      await releaseLegacyDirectAnalysisReservationsForOwner(
        ctx,
        ownerId,
        args.now,
      );
    }

    return await reserveCreationCreditsForOwner(ctx, ownerId, {
      ...args,
      domainKind: "analysis",
      reservationKind: isDirectServerOperation ? "server" : "worker",
      source: "user_action",
    });
  },
});
