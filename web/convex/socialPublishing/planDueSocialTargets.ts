import { internal } from "../_generated/api";
import { internalMutation } from "../_generated/server";

export const planDueSocialTargets = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = new Date().toISOString();
    const dueTargets = await ctx.db
      .query("socialPostTargets")
      .withIndex("by_status_scheduled", (index) =>
        index.eq("status", "scheduled").lte("scheduledFor", now),
      )
      .order("asc")
      .take(200);

    for (const target of dueTargets) {
      await ctx.scheduler.runAfter(
        0,
        internal.socialPublishing.claimDueSocialTarget.claimDueSocialTarget,
        {
          targetId: target.id,
          now,
        },
      );
    }

    return dueTargets.length;
  },
});
