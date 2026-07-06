import { v } from "convex/values";
import type { MutationCtx } from "./_generated/server";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { query } from "./_generated/server";

type UpsertPostBridgePostProductMappingOptions = {
  ownerId: string;
  post: {
    postId: string;
  };
  productId?: string;
  sourceId: string;
  sourceType: "stitch" | "swipe";
};

export async function upsertPostBridgePostProductMapping(
  ctx: MutationCtx,
  {
    ownerId,
    post,
    productId,
    sourceId,
    sourceType,
  }: UpsertPostBridgePostProductMappingOptions,
) {
  const normalizedProductId = productId?.trim();

  if (!normalizedProductId) {
    return null;
  }

  const now = new Date().toISOString();
  const existingMapping = await ctx.db
    .query("postBridgePostProductMappings")
    .withIndex("by_owner_post", (q) =>
      q.eq("ownerId", ownerId).eq("postId", post.postId),
    )
    .unique();

  if (existingMapping) {
    await ctx.db.patch(existingMapping._id, {
      productId: normalizedProductId,
      sourceId,
      sourceType,
      updatedAt: now,
    });

    return existingMapping._id;
  }

  return await ctx.db.insert("postBridgePostProductMappings", {
    createdAt: now,
    ownerId,
    postId: post.postId,
    productId: normalizedProductId,
    sourceId,
    sourceType,
    updatedAt: now,
  });
}

export const listPostIdsByProduct = query({
  args: {
    productId: v.string(),
  },
  handler: async (ctx, { productId }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const normalizedProductId = productId.trim();

    if (!normalizedProductId) {
      return [];
    }

    const mappings = await ctx.db
      .query("postBridgePostProductMappings")
      .withIndex("by_owner_product", (q) =>
        q.eq("ownerId", ownerId).eq("productId", normalizedProductId),
      )
      .take(500);

    return mappings.map((mapping) => mapping.postId);
  },
});
