import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

export const holdEmailProviderOperation = internalMutation({
  args: {
    heldAt: v.number(),
    operationId: v.id("emailProviderOperations"),
  },
  handler: async (ctx, { heldAt, operationId }) => {
    const operation = await ctx.db.get(operationId);

    const isExpiredClaim = Boolean(
      operation?.status === "claimed" &&
        operation.leaseExpiresAt !== undefined &&
        operation.leaseExpiresAt <= heldAt,
    );

    if (
      !operation ||
      (operation.status !== "pending" && !isExpiredClaim) ||
      !Number.isFinite(heldAt)
    ) {
      return { held: false as const };
    }

    await ctx.db.patch(operationId, {
      status: "held",
      ...(isExpiredClaim && operation.attemptLeaseOwner
        ? {
            acceptanceStatus: "unknown" as const,
            ambiguousAt: operation.ambiguousAt ?? heldAt,
          }
        : {}),
      attemptLeaseOwner: undefined,
      failureCategory: "configuration",
      leaseOwner: undefined,
      leaseExpiresAt: undefined,
      nextAttemptAt: heldAt,
      updatedAt: heldAt,
    });

    return { held: true as const };
  },
});
