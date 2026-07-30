import { internalMutation } from "../_generated/server";

export const expireSocialOAuthStates = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = new Date().toISOString();
    const expired = await ctx.db
      .query("socialOAuthStates")
      .withIndex("by_status_expires", (index) =>
        index.eq("status", "pending").lt("expiresAt", now),
      )
      .take(200);

    for (const state of expired) {
      await ctx.db.patch(state._id, {
        status: "expired",
        updatedAt: now,
      });
    }

    return expired.length;
  },
});
