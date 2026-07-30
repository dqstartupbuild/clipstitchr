import { internal } from "../_generated/api";
import { internalMutation } from "../_generated/server";

export const planSocialStatusChecks = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = new Date().toISOString();
    const dueTargets = await ctx.db
      .query("socialPostTargets")
      .withIndex("by_status_next_check", (index) =>
        index.eq("status", "status_check").lte("nextStatusCheckAt", now),
      )
      .order("asc")
      .take(200);

    for (const target of dueTargets) {
      await ctx.scheduler.runAfter(
        0,
        internal.socialPublishing.claimSocialStatusCheck
          .claimSocialStatusCheck,
        {
          targetId: target.id,
          now,
        },
      );
    }

    return dueTargets.length;
  },
});
