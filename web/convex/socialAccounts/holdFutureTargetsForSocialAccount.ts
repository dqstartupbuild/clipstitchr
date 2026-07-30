import type { MutationCtx } from "../_generated/server";
import { refreshSocialPostStatus } from "../socialPosts/refreshSocialPostStatus";

export async function holdFutureTargetsForSocialAccount(
  ctx: MutationCtx,
  args: {
    accountId: string;
    now: string;
    ownerId: string;
    reason: string;
  },
) {
  const futureTargets = (
    await Promise.all(
      (["scheduled", "queued"] as const).map((status) =>
        ctx.db
          .query("socialPostTargets")
          .withIndex("by_account_status", (index) =>
            index.eq("socialAccountId", args.accountId).eq("status", status),
          )
          .collect(),
      ),
    )
  )
    .flat()
    .filter(
      (target) =>
        target.ownerId === args.ownerId &&
        Date.parse(target.scheduledFor) >= Date.parse(args.now),
    );
  const postIds = new Set<string>();

  for (const target of futureTargets) {
    await ctx.db.patch(target._id, {
      status: "held",
      nextAttemptAt: undefined,
      needsAttentionReason: args.reason,
      updatedAt: args.now,
    });
    postIds.add(target.postId);
  }

  for (const postId of postIds) {
    await refreshSocialPostStatus(ctx, args.ownerId, postId, args.now);
  }

  return futureTargets.length;
}
