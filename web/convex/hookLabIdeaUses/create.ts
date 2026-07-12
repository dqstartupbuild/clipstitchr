import { v } from "convex/values";
import { getAuthenticatedOwnerId } from "../auth/getAuthenticatedOwnerId";
import { mutation } from "../_generated/server";
import { rateLimiter } from "../rateLimiter";
import { getHookLabVariationCount } from "./getHookLabVariationCount";

const OPENING_DURATION_SECONDS = 8;

export const create = mutation({
  args: {
    createdAt: v.string(),
    defaultAvatarId: v.optional(v.string()),
    defaultDemoClipId: v.optional(v.string()),
    id: v.string(),
    ideaId: v.string(),
    idempotencyKey: v.string(),
    productId: v.string(),
    variationCount: v.number(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const idempotencyKey = args.idempotencyKey.trim().slice(0, 240);
    const existing = await ctx.db
      .query("hookLabIdeaUses")
      .withIndex("by_owner_idempotency", (index) =>
        index.eq("ownerId", ownerId).eq("idempotencyKey", idempotencyKey),
      )
      .unique();

    if (existing) {
      const variants = await ctx.db
        .query("hookLabIdeaVariants")
        .withIndex("by_owner_use_variant", (index) =>
          index.eq("ownerId", ownerId).eq("useId", existing.id),
        )
        .order("asc")
        .take(5);

      return {
        existing: true,
        useId: existing.id,
        variantIds: variants.map((variant) => variant.id),
      };
    }

    const variationCount = getHookLabVariationCount(args.variationCount);
    const [idea, product] = await Promise.all([
      ctx.db
        .query("hookLabIdeas")
        .withIndex("by_owner_id", (index) =>
          index.eq("ownerId", ownerId).eq("id", args.ideaId.trim()),
        )
        .unique(),
      ctx.db
        .query("products")
        .withIndex("by_owner_id", (index) =>
          index.eq("ownerId", ownerId).eq("id", args.productId.trim()),
        )
        .unique(),
    ]);

    if (!idea || idea.status !== "ready") {
      throw new Error("This idea is not ready to use yet.");
    }

    if (!product) {
      throw new Error("Product not found.");
    }

    if (idea.scope === "product" && idea.productId !== product.id) {
      throw new Error("Switch to the product this idea belongs to before using it.");
    }

    const [productAvatarPreference, ownerAvatarPreference] = await Promise.all([
      ctx.db
        .query("avatarPreferences")
        .withIndex("by_owner_product", (index) =>
          index.eq("ownerId", ownerId).eq("productId", product.id),
        )
        .unique(),
      ctx.db
        .query("avatarPreferences")
        .withIndex("by_owner_product", (index) =>
          index.eq("ownerId", ownerId).eq("productId", undefined),
        )
        .unique(),
    ]);
    const defaultAvatarId =
      args.defaultAvatarId?.trim() ||
      product.defaultAvatarId ||
      productAvatarPreference?.defaultAvatarId ||
      ownerAvatarPreference?.defaultAvatarId;
    const defaultDemoClipId =
      args.defaultDemoClipId?.trim() || product.defaultDemoClipId;

    if (!defaultAvatarId || !defaultDemoClipId) {
      throw new Error("Choose a default avatar and Demo clip before using this idea.");
    }

    const [avatar, demoClip] = await Promise.all([
      ctx.db
        .query("avatars")
        .withIndex("by_owner_id", (index) =>
          index.eq("ownerId", ownerId).eq("id", defaultAvatarId),
        )
        .unique(),
      ctx.db
        .query("videoClips")
        .withIndex("by_owner_id", (index) =>
          index.eq("ownerId", ownerId).eq("id", defaultDemoClipId),
        )
        .unique(),
    ]);

    if (!avatar || (avatar.productId && avatar.productId !== product.id)) {
      throw new Error("Your default avatar is no longer available.");
    }

    if (
      !demoClip ||
      demoClip.clipType !== "demo" ||
      (demoClip.productId && demoClip.productId !== product.id)
    ) {
      throw new Error("Your default Demo clip is no longer available.");
    }

    const avatarPhotos = await ctx.db
      .query("photoAssets")
      .withIndex("by_owner_avatar_created", (index) =>
        index.eq("ownerId", ownerId).eq("avatarId", avatar.id),
      )
      .order("desc")
      .take(20);

    if (!avatarPhotos.some((photo) => !photo.productId || photo.productId === product.id)) {
      throw new Error("Add a photo to your default avatar before using this idea.");
    }

    await rateLimiter.limit(ctx, "hookLabIdeaUse", {
      count: variationCount,
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "cliprHookScriptGenerate", {
      count: variationCount,
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "cliprAvatarStillGenerate", {
      count: variationCount,
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "cliprVideoGenerate", {
      count: OPENING_DURATION_SECONDS * variationCount,
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "cliprProviderSpendGlobal", {
      count: 10 * variationCount,
      throws: true,
    });
    await rateLimiter.limit(ctx, "hookLabIdeaAssetSave", {
      count: variationCount * 2,
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "hookLabIdeaAssetSaveGlobal", {
      count: variationCount * 2,
      throws: true,
    });
    await rateLimiter.limit(ctx, "convexRecordSave", {
      count: variationCount + 1,
      key: ownerId,
      throws: true,
    });

    const useId = args.id.trim();

    await ctx.db.insert("hookLabIdeaUses", {
      ownerId,
      id: useId,
      ideaId: idea.id,
      productId: product.id,
      variationCount,
      defaultAvatarId: avatar.id,
      defaultDemoClipId: demoClip.id,
      status: "queued",
      progress: 0,
      completedVariantCount: 0,
      failedVariantCount: 0,
      idempotencyKey,
      createdAt: args.createdAt,
      updatedAt: args.createdAt,
    });
    const variantIds: string[] = [];

    for (let variantIndex = 0; variantIndex < variationCount; variantIndex += 1) {
      const id = `${useId}:variant:${variantIndex}`;

      await ctx.db.insert("hookLabIdeaVariants", {
        ownerId,
        id,
        ideaId: idea.id,
        useId,
        productId: product.id,
        variantIndex,
        status: "queued",
        providerPredictionIds: [],
        createdAt: args.createdAt,
        updatedAt: args.createdAt,
      });
      variantIds.push(id);
    }

    return {
      existing: false,
      useId,
      variantIds,
    };
  },
});
