import { v } from "convex/values";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";
import { query } from "../_generated/server";

const cliProductListLimit = 100;

export const listCliProducts = query({
  args: {
    ownerId: v.string(),
    secret: v.string(),
  },
  handler: async (ctx, { ownerId, secret }) => {
    assertRateLimitApiSecret(secret);

    return await ctx.db
      .query("productCards")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .take(cliProductListLimit);
  },
});
