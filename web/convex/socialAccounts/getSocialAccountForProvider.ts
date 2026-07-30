import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";

export const getSocialAccountForProvider = query({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    id: v.string(),
  },
  handler: async (ctx, { secret, ownerId, id }) => {
    assertProviderWorkerSecret(secret);

    return await ctx.db
      .query("socialAccounts")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", ownerId).eq("id", id),
      )
      .unique();
  },
});
