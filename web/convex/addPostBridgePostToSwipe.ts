import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { rateLimiter } from "./rateLimiter";
import { upsertPostBridgePostProductMapping } from "./postBridgePostProductMappings";
import { upsertSwipeCard } from "./upsertSwipeCard";

export async function addPostBridgePostToSwipe(
  ctx: MutationCtx,
  ownerId: string,
  id: string,
  post: NonNullable<Doc<"swipes">["postBridgePosts"]>[number],
) {
  const now = new Date().toISOString();

  await rateLimiter.limit(ctx, "convexMetadataUpdate", {
    key: ownerId,
    throws: true,
  });

  const swipe = await ctx.db
    .query("swipes")
    .withIndex("by_owner_id", (query) =>
      query.eq("ownerId", ownerId).eq("id", id),
    )
    .unique();

  if (!swipe) {
    throw new Error("Swipe not found.");
  }

  await ctx.db.patch(swipe._id, {
    isPosted: true,
    postBridgePosts: [
      ...(swipe.postBridgePosts ?? []).filter(
        (existingPost) => existingPost.postId !== post.postId,
      ),
      post,
    ],
    postedAt: swipe.postedAt ?? now,
    updatedAt: now,
  });
  const updatedSwipe = await ctx.db.get(swipe._id);

  if (updatedSwipe) {
    await Promise.all([
      upsertPostBridgePostProductMapping(ctx, {
        ownerId,
        post,
        productId: updatedSwipe.productSourceId,
        sourceId: updatedSwipe.id,
        sourceType: "swipe",
      }),
      upsertSwipeCard(ctx, updatedSwipe),
    ]);
  }
}
