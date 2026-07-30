import { v } from "convex/values";
import { query } from "../_generated/server";
import { assertProviderWorkerSecret } from "../auth/assertProviderWorkerSecret";

export const getSocialPublishJobForProvider = query({
  args: {
    secret: v.string(),
    ownerId: v.string(),
    postId: v.string(),
    targetId: v.string(),
  },
  handler: async (ctx, args) => {
    assertProviderWorkerSecret(args.secret);

    const [post, target] = await Promise.all([
      ctx.db
        .query("socialPosts")
        .withIndex("by_owner_id", (index) =>
          index.eq("ownerId", args.ownerId).eq("id", args.postId),
        )
        .unique(),
      ctx.db
        .query("socialPostTargets")
        .withIndex("by_owner_id", (index) =>
          index.eq("ownerId", args.ownerId).eq("id", args.targetId),
        )
        .unique(),
    ]);

    if (!post || !target || target.postId !== post.id) {
      throw new Error("Social publishing target not found.");
    }

    const [account, assets, attempts, publications] = await Promise.all([
      ctx.db
        .query("socialAccounts")
        .withIndex("by_owner_id", (index) =>
          index.eq("ownerId", args.ownerId).eq("id", target.socialAccountId),
        )
        .unique(),
      ctx.db
        .query("socialPostAssets")
        .withIndex("by_owner_post", (index) =>
          index.eq("ownerId", args.ownerId).eq("postId", post.id),
        )
        .collect(),
      ctx.db
        .query("socialPublishAttempts")
        .withIndex("by_owner_target", (index) =>
          index.eq("ownerId", args.ownerId).eq("targetId", target.id),
        )
        .collect(),
      ctx.db
        .query("socialExternalPublications")
        .withIndex("by_target", (index) => index.eq("targetId", target.id))
        .collect(),
    ]);

    if (!account || account.status !== "connected") {
      throw new Error("Reconnect this account before publishing.");
    }

    return {
      account,
      assets: assets.sort((left, right) => left.order - right.order),
      attempts: attempts.sort(
        (left, right) => left.attemptNumber - right.attemptNumber,
      ),
      post,
      publications,
      target,
    };
  },
});
