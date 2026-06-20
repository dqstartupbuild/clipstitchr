import { v } from "convex/values";
import { assertProductBelongsToOwner } from "./assertProductBelongsToOwner";
import { assertAutomationWorkerSecret } from "./auth/assertAutomationWorkerSecret";
import { assertProviderWorkerSecret } from "./auth/assertProviderWorkerSecret";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { createNotification } from "./createNotification";
import { getPhotoNotificationCopy } from "./getPhotoNotificationCopy";
import { rateLimiter } from "./rateLimiter";
import { assetTagsValidator } from "./validators/assetTags";
import { automationProvenanceValidator } from "./validators/automationProvenance";
import { r2ObjectValidator } from "./validators/r2Object";

const preparationValidator = v.union(
  v.literal("ai-outpaint"),
  v.literal("original-portrait"),
  v.literal("auto-crop"),
);
const PHOTO_LIST_LIMIT = 120;

const saveArgs = {
  id: v.string(),
  productId: v.optional(v.string()),
  avatarId: v.optional(v.string()),
  name: v.string(),
  tags: assetTagsValidator,
  avatarDescription: v.optional(v.string()),
  outfitDescription: v.optional(v.string()),
  locationDescription: v.optional(v.string()),
  poseDescription: v.optional(v.string()),
  originalName: v.string(),
  photoObject: r2ObjectValidator,
  originalObject: v.optional(r2ObjectValidator),
  thumbnailObject: v.optional(r2ObjectValidator),
  mimeType: v.string(),
  originalMimeType: v.optional(v.string()),
  size: v.number(),
  originalSize: v.optional(v.number()),
  width: v.number(),
  height: v.number(),
  originalWidth: v.optional(v.number()),
  originalHeight: v.optional(v.number()),
  preparation: v.optional(preparationValidator),
  consentAcknowledgedAt: v.optional(v.string()),
  createdAt: v.string(),
  updatedAt: v.string(),
};

const saveFromAutomationArgs = {
  secret: v.string(),
  ownerId: v.string(),
  automation: automationProvenanceValidator,
  ...saveArgs,
};

const saveFromProviderArgs = {
  secret: v.string(),
  ownerId: v.string(),
  automation: v.optional(automationProvenanceValidator),
  ...saveArgs,
};

export const list = query({
  args: {
    productId: v.optional(v.string()),
  },
  handler: async (ctx, { productId }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    if (productId) {
      return await ctx.db
        .query("photoAssets")
        .withIndex("by_owner_product_created", (q) =>
          q.eq("ownerId", ownerId).eq("productId", productId),
        )
        .order("desc")
        .take(PHOTO_LIST_LIMIT);
    }

    return await ctx.db
      .query("photoAssets")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .take(PHOTO_LIST_LIMIT);
  },
});

export const get = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    return await ctx.db
      .query("photoAssets")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();
  },
});

export const getMostRecentForAvatar = query({
  args: {
    avatarId: v.string(),
    productId: v.optional(v.string()),
  },
  handler: async (ctx, { avatarId, productId }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    if (productId) {
      return await ctx.db
        .query("photoAssets")
        .withIndex("by_owner_avatar_product_created", (q) =>
          q
            .eq("ownerId", ownerId)
            .eq("avatarId", avatarId)
            .eq("productId", productId),
        )
        .order("desc")
        .first();
    }

    return await ctx.db
      .query("photoAssets")
      .withIndex("by_owner_avatar_created", (q) =>
        q.eq("ownerId", ownerId).eq("avatarId", avatarId),
      )
      .order("desc")
      .first();
  },
});

export const getFirstForAvatar = query({
  args: {
    avatarId: v.string(),
    productId: v.optional(v.string()),
  },
  handler: async (ctx, { avatarId, productId }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    if (productId) {
      return await ctx.db
        .query("photoAssets")
        .withIndex("by_owner_avatar_product_created", (q) =>
          q
            .eq("ownerId", ownerId)
            .eq("avatarId", avatarId)
            .eq("productId", productId),
        )
        .order("asc")
        .first();
    }

    return await ctx.db
      .query("photoAssets")
      .withIndex("by_owner_avatar_created", (q) =>
        q.eq("ownerId", ownerId).eq("avatarId", avatarId),
      )
      .order("asc")
      .first();
  },
});

export const save = mutation({
  args: saveArgs,
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexRecordSave", {
      key: ownerId,
      throws: true,
    });
    await assertProductBelongsToOwner(ctx, ownerId, args.productId);

    if (args.avatarId) {
      const avatar = await ctx.db
        .query("avatars")
        .withIndex("by_owner_id", (q) =>
          q.eq("ownerId", ownerId).eq("id", args.avatarId ?? ""),
        )
        .unique();

      if (!avatar || (args.productId && avatar.productId !== args.productId)) {
        throw new Error("Avatar not found for this product.");
      }
    }

    const existingPhoto = await ctx.db
      .query("photoAssets")
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", args.id),
      )
      .unique();
    const photo = {
      ownerId,
      ...args,
    };

    if (existingPhoto) {
      await ctx.db.patch(existingPhoto._id, photo);
      return existingPhoto._id;
    }

    const photoDocumentId = await ctx.db.insert("photoAssets", photo);
    const notificationCopy = getPhotoNotificationCopy(args);

    await createNotification(ctx, {
      ownerId,
      productId: args.productId,
      sourceType: "photo",
      sourceId: args.id,
      dedupeKey: `photo:${args.id}:created`,
      title: notificationCopy.title,
      preview: notificationCopy.preview,
      message: notificationCopy.message,
      createdAt: args.createdAt,
    });

    return photoDocumentId;
  },
});

export const saveFromAutomation = mutation({
  args: saveFromAutomationArgs,
  handler: async (ctx, { secret, ownerId, automation, ...args }) => {
    assertAutomationWorkerSecret(secret);

    await rateLimiter.limit(ctx, "automationAssetSaveDaily", {
      key: ownerId,
      throws: true,
    });
    await rateLimiter.limit(ctx, "automationAssetSaveGlobalDaily", {
      throws: true,
    });
    await assertProductBelongsToOwner(ctx, ownerId, args.productId);

    const existingPhoto = await ctx.db
      .query("photoAssets")
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", args.id),
      )
      .unique();
    const photo = {
      ownerId,
      ...args,
      automation,
    };

    if (existingPhoto) {
      await ctx.db.patch(existingPhoto._id, photo);
      return existingPhoto._id;
    }

    const photoDocumentId = await ctx.db.insert("photoAssets", photo);

    return photoDocumentId;
  },
});

export const saveFromProvider = mutation({
  args: saveFromProviderArgs,
  handler: async (ctx, { secret, ownerId, automation, ...args }) => {
    assertProviderWorkerSecret(secret);

    if (automation) {
      await rateLimiter.limit(ctx, "automationAssetSaveDaily", {
        key: ownerId,
        throws: true,
      });
      await rateLimiter.limit(ctx, "automationAssetSaveGlobalDaily", {
        throws: true,
      });
    } else {
      await rateLimiter.limit(ctx, "convexRecordSave", {
        key: ownerId,
        throws: true,
      });
    }
    await assertProductBelongsToOwner(ctx, ownerId, args.productId);

    const existingPhoto = await ctx.db
      .query("photoAssets")
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", args.id),
      )
      .unique();
    const photo = {
      ownerId,
      ...args,
      ...(automation ? { automation } : {}),
    };

    if (existingPhoto) {
      await ctx.db.patch(existingPhoto._id, photo);
      return existingPhoto._id;
    }

    const photoDocumentId = await ctx.db.insert("photoAssets", photo);

    if (!automation) {
      const notificationCopy = getPhotoNotificationCopy(args);

      await createNotification(ctx, {
        ownerId,
        productId: args.productId,
        sourceType: "photo",
        sourceId: args.id,
        dedupeKey: `photo:${args.id}:created`,
        title: notificationCopy.title,
        preview: notificationCopy.preview,
        message: notificationCopy.message,
        createdAt: args.createdAt,
      });
    }

    return photoDocumentId;
  },
});

export const updateMetadata = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    tags: assetTagsValidator,
    avatarDescription: v.optional(v.string()),
    outfitDescription: v.optional(v.string()),
    locationDescription: v.optional(v.string()),
    poseDescription: v.optional(v.string()),
    updatedAt: v.string(),
  },
  handler: async (
    ctx,
    {
      id,
      name,
      tags,
      avatarDescription,
      outfitDescription,
      locationDescription,
      poseDescription,
      updatedAt,
    },
  ) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    const photo = await ctx.db
      .query("photoAssets")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!photo) {
      throw new Error("Photo not found.");
    }

    await ctx.db.patch(photo._id, {
      name,
      tags,
      ...(avatarDescription === undefined ? {} : { avatarDescription }),
      ...(outfitDescription === undefined ? {} : { outfitDescription }),
      ...(locationDescription === undefined ? {} : { locationDescription }),
      ...(poseDescription === undefined ? {} : { poseDescription }),
      updatedAt,
    });
  },
});

export const remove = mutation({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexRecordDelete", {
      key: ownerId,
      throws: true,
    });

    const photo = await ctx.db
      .query("photoAssets")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!photo) {
      return null;
    }

    await ctx.db.delete(photo._id);
    return photo;
  },
});
