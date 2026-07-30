import type { MutationCtx } from "../_generated/server";
import { getSocialPostStatusFromTargets } from "./getSocialPostStatusFromTargets";

export async function refreshSocialPostStatus(
  ctx: MutationCtx,
  ownerId: string,
  postId: string,
  now: string,
) {
  const [post, targets] = await Promise.all([
    ctx.db
      .query("socialPosts")
      .withIndex("by_owner_id", (index) =>
        index.eq("ownerId", ownerId).eq("id", postId),
      )
      .unique(),
    ctx.db
      .query("socialPostTargets")
      .withIndex("by_owner_post", (index) =>
        index.eq("ownerId", ownerId).eq("postId", postId),
      )
      .collect(),
  ]);

  if (!post) {
    return null;
  }

  const status = getSocialPostStatusFromTargets(targets);

  await ctx.db.patch(post._id, {
    status,
    publishedAt:
      status === "published" || status === "partially_published"
        ? targets
            .map((target) => target.publishedAt)
            .filter((value): value is string => Boolean(value))
            .sort()[0]
        : post.publishedAt,
    updatedAt: now,
  });

  return status;
}
