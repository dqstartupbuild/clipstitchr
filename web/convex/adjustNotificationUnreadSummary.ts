import type { MutationCtx } from "./_generated/server";

type AdjustNotificationUnreadSummaryArgs = {
  ownerId: string;
  delta: number;
  updatedAt: string;
};

export async function adjustNotificationUnreadSummary(
  ctx: MutationCtx,
  { delta, ownerId, updatedAt }: AdjustNotificationUnreadSummaryArgs,
) {
  const existing = await ctx.db
    .query("notificationSummaries")
    .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
    .unique();
  const unreadCount = Math.max(0, (existing?.unreadCount ?? 0) + delta);

  if (existing) {
    await ctx.db.patch(existing._id, {
      unreadCount,
      updatedAt,
    });

    return existing._id;
  }

  return await ctx.db.insert("notificationSummaries", {
    ownerId,
    unreadCount,
    updatedAt,
  });
}
