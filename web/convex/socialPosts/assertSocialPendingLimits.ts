import type { MutationCtx } from "../_generated/server";
import { getMaxPendingSocialDeliveriesPerOwner } from "../../lib/clipstitchr/social/getMaxPendingSocialDeliveriesPerOwner";
import { getMaxScheduledSocialPostsPerOwner } from "../../lib/clipstitchr/social/getMaxScheduledSocialPostsPerOwner";

export async function assertSocialPendingLimits(
  ctx: MutationCtx,
  ownerId: string,
  requestedTargetCount: number,
) {
  const postLimit = getMaxScheduledSocialPostsPerOwner();
  const targetLimit = getMaxPendingSocialDeliveriesPerOwner();
  const pendingPostStatuses = [
    "scheduled",
    "publishing",
    "partially_published",
    "needs_attention",
    "held",
    "outcome_unknown",
  ] as const;
  const pendingTargetStatuses = [
    "scheduled",
    "queued",
    "publishing",
    "status_check",
    "needs_attention",
    "held",
    "outcome_unknown",
  ] as const;
  const pendingPosts = (
    await Promise.all(
      pendingPostStatuses.map((status) =>
        ctx.db
          .query("socialPosts")
          .withIndex("by_owner_status_scheduled", (index) =>
            index.eq("ownerId", ownerId).eq("status", status),
          )
          .take(postLimit),
      ),
    )
  ).reduce((count, rows) => count + rows.length, 0);

  if (pendingPosts >= postLimit) {
    throw new Error(
      `You already have ${postLimit} social posts waiting. Finish or cancel one before adding another.`,
    );
  }

  const pendingTargets = (
    await Promise.all(
      pendingTargetStatuses.map((status) =>
        ctx.db
          .query("socialPostTargets")
          .withIndex("by_owner_status_scheduled", (index) =>
            index.eq("ownerId", ownerId).eq("status", status),
          )
          .take(targetLimit),
      ),
    )
  ).reduce((count, rows) => count + rows.length, 0);

  if (pendingTargets + requestedTargetCount > targetLimit) {
    throw new Error(
      `You can have up to ${targetLimit} social deliveries waiting at once.`,
    );
  }
}
