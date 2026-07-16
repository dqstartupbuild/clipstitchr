import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

export const recordAccountEmailOperationAccepted = internalMutation({
  args: {
    acceptedAt: v.number(),
    operationId: v.id("accountEmailOperations"),
    workerId: v.string(),
  },
  handler: async (ctx, args) => {
    const operation = await ctx.db.get(args.operationId);

    if (
      !operation ||
      !Number.isFinite(args.acceptedAt) ||
      operation.status !== "claimed" ||
      operation.leaseOwner !== args.workerId
    ) {
      return { recorded: false as const };
    }

    await ctx.db.patch(operation._id, {
      acceptanceStatus: "accepted",
      acceptedAt: args.acceptedAt,
      attemptLeaseOwner: undefined,
      leaseExpiresAt: undefined,
      leaseOwner: undefined,
      status: "accepted",
      terminalAt: args.acceptedAt,
      updatedAt: args.acceptedAt,
    });

    return { recorded: true as const };
  },
});
