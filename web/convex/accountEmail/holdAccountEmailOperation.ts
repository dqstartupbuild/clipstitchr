import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

export const holdAccountEmailOperation = internalMutation({
  args: {
    failureCategory: v.union(
      v.literal("configuration"),
      v.literal("ineligible"),
    ),
    heldAt: v.number(),
    operationId: v.id("accountEmailOperations"),
  },
  handler: async (ctx, args) => {
    const operation = await ctx.db.get(args.operationId);
    const expiredClaim = Boolean(
      operation?.status === "claimed" &&
        operation.leaseExpiresAt !== undefined &&
        operation.leaseExpiresAt <= args.heldAt,
    );

    if (
      !operation ||
      !Number.isFinite(args.heldAt) ||
      (operation.status !== "pending" && !expiredClaim)
    ) {
      return { held: false as const };
    }

    await ctx.db.patch(operation._id, {
      acceptanceStatus:
        expiredClaim && operation.attemptLeaseOwner
          ? "unknown"
          : operation.acceptanceStatus,
      ambiguousAt:
        expiredClaim && operation.attemptLeaseOwner
          ? (operation.ambiguousAt ?? args.heldAt)
          : operation.ambiguousAt,
      attemptLeaseOwner: undefined,
      failureCategory: args.failureCategory,
      leaseExpiresAt: undefined,
      leaseOwner: undefined,
      nextAttemptAt: args.heldAt,
      status: "held",
      updatedAt: args.heldAt,
    });

    return { held: true as const };
  },
});
