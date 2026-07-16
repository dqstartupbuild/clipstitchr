import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { usageOperationValidator } from "../validators/usageOperation";
import { getIsUsageLimitError } from "./getIsUsageLimitError";
import { reserveCreationCreditsForOwner } from "./reserveCreationCredits";

export const reserveCreationCreditBatch = mutation({
  args: {
    batchId: v.string(),
    count: v.number(),
    domainIdPrefix: v.string(),
    domainKind: v.string(),
    idempotencyPrefix: v.string(),
    now: v.string(),
    operation: usageOperationValidator,
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const count = Math.trunc(args.count);

    if (count < 1 || count > 20) {
      throw new Error("Creation batch count must be between 1 and 20.");
    }

    const reservations = [];

    for (let index = 0; index < count; index += 1) {
      try {
        const reservation = await reserveCreationCreditsForOwner(
          ctx,
          ownerId,
          {
            batchId: args.batchId,
            domainId: `${args.domainIdPrefix}:${index}`,
            domainKind: args.domainKind,
            idempotencyKey: `${args.idempotencyPrefix}:${index}`,
            now: args.now,
            operation: args.operation,
            reservationKind: "worker",
            source: "user_action",
          },
        );
        reservations.push(reservation);
      } catch (error) {
        if (getIsUsageLimitError(error)) {
          break;
        }

        throw error;
      }
    }

    return reservations;
  },
});
