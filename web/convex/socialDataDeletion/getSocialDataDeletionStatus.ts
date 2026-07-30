import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertRateLimitApiSecret } from "../auth/assertRateLimitApiSecret";

export const getSocialDataDeletionStatus = query({
  args: {
    secret: v.string(),
    confirmationCode: v.string(),
  },
  handler: async (ctx, { secret, confirmationCode }) => {
    assertRateLimitApiSecret(secret);

    const request = await ctx.db
      .query("socialDataDeletionRequests")
      .withIndex("by_confirmation_code", (index) =>
        index.eq("confirmationCode", confirmationCode),
      )
      .unique();

    return request
      ? {
          status: request.status,
          updatedAt: request.updatedAt,
        }
      : null;
  },
});
