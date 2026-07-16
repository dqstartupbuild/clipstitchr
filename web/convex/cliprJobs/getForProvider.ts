import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";

export const getForProvider = query({
  args: {
    id: v.string(),
    ownerId: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, { id, ownerId, secret }) => {
    assertProviderWorkerSecret(secret);

    return await ctx.db
      .query("cliprJobs")
      .withIndex("by_owner_id", (query) =>
        query.eq("ownerId", ownerId).eq("id", id),
      )
      .unique();
  },
});
