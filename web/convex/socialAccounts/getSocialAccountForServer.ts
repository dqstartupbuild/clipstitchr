import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";

export const getSocialAccountForServer = query({
  args: {
    secret: v.string(),
    id: v.string(),
  },
  handler: async (ctx, { secret, id }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);

    return await ctx.db
      .query("socialAccounts")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", ownerId).eq("id", id),
      )
      .unique();
  },
});
