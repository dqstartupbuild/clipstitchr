import { v } from "convex/values";
import { internalQuery } from "../_generated/server";

export const getEmailProviderOperationKind = internalQuery({
  args: { operationId: v.id("emailProviderOperations") },
  handler: async (ctx, { operationId }) =>
    (await ctx.db.get(operationId))?.kind ?? null,
});
