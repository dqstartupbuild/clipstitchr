import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { getProductForOwner } from "../getProductForOwner";
import { mutation } from "../_generated/server";
import { hookLabCreativeBriefContentValidator } from "../validators/hookLabCreativeBriefContent";
import { hookLabDestinationToolValidator } from "../validators/hookLabDestinationTool";
import { normalizeHookLabCreativeBriefContent } from "./normalizeHookLabCreativeBriefContent";
import { rateLimiter } from "../rateLimiter";
import { assertProductIsUnlockedForOwner } from "../products/assertProductIsUnlockedForOwner";

export const create = mutation({
  args: {
    brief: hookLabCreativeBriefContentValidator,
    destinationTool: hookLabDestinationToolValidator,
    formatDnaVersion: v.string(),
    hookTemplateId: v.optional(v.string()),
    id: v.string(),
    productId: v.string(),
    sourcePostIds: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const id = args.id.trim().slice(0, 120);
    const productId = args.productId.trim();
    const sourcePostIds = Array.from(
      new Set(args.sourcePostIds.map((postId) => postId.trim()).filter(Boolean)),
    ).slice(0, 30);

    if (!id || !sourcePostIds.length) {
      throw new Error("Choose at least one completed Hook Lab report.");
    }

    const [existing, product, sourcePosts] = await Promise.all([
      ctx.db
        .query("hookLabCreativeBriefs")
        .withIndex("by_owner_id", (query) =>
          query.eq("ownerId", ownerId).eq("id", id),
        )
        .unique(),
      getProductForOwner(ctx, ownerId, productId),
      Promise.all(
        sourcePostIds.map((postId) =>
          ctx.db
            .query("hookLabPosts")
            .withIndex("by_owner_id", (query) =>
              query.eq("ownerId", ownerId).eq("id", postId),
            )
            .unique(),
        ),
      ),
    ]);

    if (existing) {
      return existing;
    }

    if (!product || product.archivedAt) {
      throw new Error("Saved product not found.");
    }

    const now = new Date().toISOString();

    await assertProductIsUnlockedForOwner(ctx, ownerId, productId, now);

    if (
      sourcePosts.some(
        (post) => post?.status !== "ready" || !post.analysis?.formatDna,
      )
    ) {
      throw new Error("A completed format analysis is required.");
    }

    await rateLimiter.limit(ctx, "convexRecordSave", {
      key: ownerId,
      throws: true,
    });

    const fields = {
      ownerId,
      id,
      productId,
      sourcePostIds,
      hookTemplateId: args.hookTemplateId?.trim().slice(0, 120) || undefined,
      formatDnaVersion: args.formatDnaVersion.trim().slice(0, 80),
      destinationTool: args.destinationTool,
      brief: normalizeHookLabCreativeBriefContent(args.brief),
      status: "draft" as const,
      createdAt: now,
      updatedAt: now,
    };

    await ctx.db.insert("hookLabCreativeBriefs", fields);

    return fields;
  },
});
