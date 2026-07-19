import type { Doc } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { stitchCounts, stitchProductCounts } from "./aggregateCounts";
import { rateLimiter } from "./rateLimiter";
import { upsertPostBridgePostProductMapping } from "./postBridgePostProductMappings";
import { upsertStitchCard } from "./upsertStitchCard";

export async function addPostBridgePostToStitch(
  ctx: MutationCtx,
  ownerId: string,
  id: string,
  post: NonNullable<Doc<"stitches">["postBridgePosts"]>[number],
) {
  const postedAt = new Date().toISOString();

  await rateLimiter.limit(ctx, "convexMetadataUpdate", {
    key: ownerId,
    throws: true,
  });

  const stitch = await ctx.db
    .query("stitches")
    .withIndex("by_owner_id", (query) =>
      query.eq("ownerId", ownerId).eq("id", id),
    )
    .unique();

  if (!stitch) {
    throw new Error("Stitch not found.");
  }

  await ctx.db.patch(stitch._id, {
    isPosted: true,
    postBridgePosts: [
      ...(stitch.postBridgePosts ?? []).filter(
        (existingPost) => existingPost.postId !== post.postId,
      ),
      post,
    ],
    postedAt: stitch.postedAt ?? postedAt,
  });
  const updatedStitch = await ctx.db.get(stitch._id);

  if (updatedStitch) {
    await Promise.all([
      stitchCounts.replaceOrInsert(ctx, stitch, updatedStitch),
      stitchProductCounts.replaceOrInsert(ctx, stitch, updatedStitch),
      upsertPostBridgePostProductMapping(ctx, {
        ownerId,
        post,
        productId: updatedStitch.productId,
        sourceId: updatedStitch.id,
        sourceType: "stitch",
      }),
      upsertStitchCard(ctx, updatedStitch),
    ]);
  }
}
