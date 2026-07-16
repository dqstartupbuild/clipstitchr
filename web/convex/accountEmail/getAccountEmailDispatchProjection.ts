import { v } from "convex/values";
import { internalQuery } from "../_generated/server";

export const getAccountEmailDispatchProjection = internalQuery({
  args: {
    now: v.number(),
    operationId: v.id("accountEmailOperations"),
    workerId: v.string(),
  },
  handler: async (ctx, args) => {
    const operation = await ctx.db.get(args.operationId);

    if (
      !operation ||
      operation.status !== "claimed" ||
      operation.leaseOwner !== args.workerId ||
      operation.leaseExpiresAt === undefined ||
      operation.leaseExpiresAt <= args.now
    ) {
      return null;
    }

    const contact = await ctx.db
      .query("accountContacts")
      .withIndex("by_owner", (query) =>
        query.eq("ownerId", operation.ownerId),
      )
      .unique();

    if (
      !contact ||
      !contact.emailVerified ||
      contact.emailSuppressedAt !== undefined ||
      contact.deletedAt !== undefined ||
      !contact.normalizedEmail
    ) {
      return null;
    }

    return {
      contact: {
        firstName: contact.firstName,
        normalizedEmail: contact.normalizedEmail,
      },
      operation: {
        dataVariables: operation.dataVariables,
        operationId: operation._id,
        ownerId: operation.ownerId,
        templateKey: operation.templateKey,
      },
    };
  },
});
