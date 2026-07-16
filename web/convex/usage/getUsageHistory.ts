import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { query } from "../_generated/server";

export const getUsageHistory = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const safeLimit = Math.min(Math.max(Math.floor(limit ?? 25), 1), 100);
    const entries = await ctx.db
      .query("usageLedgerEntries")
      .withIndex("by_owner_created", (query) => query.eq("ownerId", ownerId))
      .order("desc")
      .take(safeLimit);

    return entries.map((entry) => ({
      availableDelta: entry.availableDelta,
      consumedDelta: entry.consumedDelta,
      createdAt: entry.createdAt,
      entryType: entry.entryType,
      operation: entry.operation,
      quantity: entry.quantity,
      reservedDelta: entry.reservedDelta,
      resource: entry.resource,
    }));
  },
});
