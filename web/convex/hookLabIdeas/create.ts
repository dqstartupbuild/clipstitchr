import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { mutation } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";
import { hookLabIdeaScopeValidator } from "../validators/hookLabIdeaScope";
import { hookLabIdeaSourceTypeValidator } from "../validators/hookLabIdeaSourceType";
import { createHookLabIdeaSearchText } from "./createHookLabIdeaSearchText";
import { createHookLabStitchRecipeFromStitch } from "./createHookLabStitchRecipeFromStitch";
import { getHookLabIdeaDefaultName } from "./getHookLabIdeaDefaultName";
import { getHookLabOriginalTextFromStitch } from "./getHookLabOriginalTextFromStitch";
import { linkHookOptionToIdea } from "./linkHookOptionToIdea";

const sourcePlatformValidator = v.union(
  v.literal("tiktok"),
  v.literal("instagram"),
);

export const create = mutation({
  args: {
    canonicalUrl: v.optional(v.string()),
    createdAt: v.string(),
    id: v.string(),
    originalText: v.optional(v.string()),
    productId: v.optional(v.string()),
    requestKey: v.string(),
    scope: hookLabIdeaScopeValidator,
    sourceHookOptionId: v.optional(v.string()),
    sourcePlatform: v.optional(sourcePlatformValidator),
    sourceStitchId: v.optional(v.string()),
    sourceType: hookLabIdeaSourceTypeValidator,
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const requestKey = args.requestKey.trim().slice(0, 220);
    const existingRequest = await ctx.db
      .query("hookLabIdeas")
      .withIndex("by_owner_request_key", (query) =>
        query.eq("ownerId", ownerId).eq("requestKey", requestKey),
      )
      .unique();

    if (existingRequest) {
      return existingRequest;
    }

    await rateLimiter.limit(ctx, "convexRecordSave", {
      key: ownerId,
      throws: true,
    });

    const requestedProductId = args.productId?.trim() || undefined;
    const product = requestedProductId
      ? await ctx.db
          .query("products")
          .withIndex("by_owner_id", (query) =>
            query.eq("ownerId", ownerId).eq("id", requestedProductId),
          )
          .unique()
      : null;

    if (requestedProductId && !product) {
      throw new Error("Choose one of your products for this idea.");
    }

    const sourceStitchId = args.sourceStitchId?.trim() || undefined;
    const sourceStitch = sourceStitchId
      ? await ctx.db
          .query("stitches")
          .withIndex("by_owner_id", (query) =>
            query.eq("ownerId", ownerId).eq("id", sourceStitchId),
          )
          .unique()
      : null;

    if (args.sourceType === "stitch" && !sourceStitch) {
      throw new Error("Choose one of your saved Stitches.");
    }

    const sourceHookOptionId = args.sourceHookOptionId?.trim() || undefined;
    const sourceHookOption = sourceHookOptionId
      ? await ctx.db
          .query("stitchrHookOptions")
          .withIndex("by_owner_id", (query) =>
            query.eq("ownerId", ownerId).eq("id", sourceHookOptionId),
          )
          .unique()
      : null;

    if (args.sourceType === "generated_hook" && !sourceHookOption) {
      throw new Error("That hook is no longer available.");
    }

    const sourceHookStitch = sourceHookOption?.stitchId
      ? await ctx.db
          .query("stitches")
          .withIndex("by_owner_id", (query) =>
            query
              .eq("ownerId", ownerId)
              .eq("id", sourceHookOption.stitchId!),
          )
          .unique()
      : null;
    const recipeSourceStitch = sourceStitch ?? sourceHookStitch;

    const canonicalUrl = args.canonicalUrl?.trim() || undefined;

    if (args.sourceType === "social_link" && (!canonicalUrl || !args.sourcePlatform)) {
      throw new Error("Paste a public TikTok or Instagram post link.");
    }

    if (canonicalUrl) {
      const existingSocialIdea = await ctx.db
        .query("hookLabIdeas")
        .withIndex("by_owner_canonical_url", (query) =>
          query.eq("ownerId", ownerId).eq("canonicalUrl", canonicalUrl),
        )
        .unique();

      if (existingSocialIdea) {
        return existingSocialIdea;
      }
    }

    if (sourceHookOptionId) {
      const existingHookIdea = await ctx.db
        .query("hookLabIdeas")
        .withIndex("by_owner_source_hook_option", (query) =>
          query.eq("ownerId", ownerId).eq("sourceHookOptionId", sourceHookOptionId),
        )
        .unique();

      if (existingHookIdea) {
        await linkHookOptionToIdea({
          ctx,
          ideaId: existingHookIdea.id,
          optionId: sourceHookOptionId,
          ownerId,
          updatedAt: args.createdAt,
        });
        return existingHookIdea;
      }
    }

    const originalText = (
      args.originalText ??
      sourceHookOption?.hook ??
      (sourceStitch ? getHookLabOriginalTextFromStitch(sourceStitch) : undefined)
    )
      ?.trim()
      .replace(/\s+/g, " ")
      .slice(0, 2000);

    if (args.sourceType === "text" && !originalText) {
      throw new Error("Paste a hook before saving the idea.");
    }

    const productId =
      args.scope === "product"
        ? (product?.id ??
          recipeSourceStitch?.productId ??
          sourceHookOption?.productId)
        : undefined;

    if (args.scope === "product" && !productId) {
      throw new Error("Choose a product before locking this idea.");
    }

    const sourceLabel =
      sourceStitch?.name ?? sourceHookOption?.hook ?? originalText;
    const name = getHookLabIdeaDefaultName({
      sourceLabel,
      sourceType: args.sourceType,
    });
    const idea = {
      ownerId,
      id: args.id.trim(),
      name,
      searchText: createHookLabIdeaSearchText([
        name,
        originalText,
        sourceStitch?.name,
        sourceHookOption?.angle,
        product?.name,
      ]),
      sortKey: `${args.createdAt}:${args.id.trim()}`,
      status: "analyzing" as const,
      sourceType: args.sourceType,
      sourcePlatform: args.sourcePlatform,
      canonicalUrl,
      scope: args.scope,
      productId,
      originalText,
      stitchRecipe: recipeSourceStitch
        ? createHookLabStitchRecipeFromStitch(recipeSourceStitch)
        : undefined,
      sourceStitchId: recipeSourceStitch?.id,
      sourceHookOptionId: sourceHookOption?.id,
      useCount: 0,
      requestKey,
      createdAt: args.createdAt,
      updatedAt: args.createdAt,
    };

    await ctx.db.insert("hookLabIdeas", idea);
    await linkHookOptionToIdea({
      ctx,
      ideaId: idea.id,
      optionId: sourceHookOption?.id,
      ownerId,
      updatedAt: args.createdAt,
    });

    return idea;
  },
});
