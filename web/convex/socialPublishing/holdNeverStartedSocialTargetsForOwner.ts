import type { MutationCtx } from "../_generated/server";
import { refreshSocialPostStatus } from "../socialPosts/refreshSocialPostStatus";

export async function holdNeverStartedSocialTargetsForOwner(
  ctx: MutationCtx,
  args: {
    now: string;
    ownerId: string;
    reason: string;
  },
) {
  const targets = (
    await Promise.all(
      (["scheduled", "queued"] as const).map((status) =>
        ctx.db
          .query("socialPostTargets")
          .withIndex("by_owner_status_scheduled", (index) =>
            index.eq("ownerId", args.ownerId).eq("status", status),
          )
          .collect(),
      ),
    )
  ).flat();
  const postIds = new Set<string>();
  let heldTargetCount = 0;

  for (const target of targets) {
    if (target.claimedAt) {
      continue;
    }

    await ctx.db.patch(target._id, {
      status: "held",
      nextAttemptAt: undefined,
      needsAttentionReason: args.reason,
      updatedAt: args.now,
    });
    heldTargetCount += 1;
    postIds.add(target.postId);
  }

  for (const postId of postIds) {
    await refreshSocialPostStatus(ctx, args.ownerId, postId, args.now);
  }

  return heldTargetCount;
}
