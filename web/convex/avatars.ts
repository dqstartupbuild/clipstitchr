import { v } from "convex/values";
import { assertProductBelongsToOwner } from "./assertProductBelongsToOwner";
import { assertRateLimitApiSecret } from "./auth/assertRateLimitApiSecret";
import { getAuthenticatedOwnerId } from "./auth/getAuthenticatedOwnerId";
import { mutation, query } from "./_generated/server";
import { createNotification } from "./createNotification";
import { getAvatarNotificationCopy } from "./getAvatarNotificationCopy";
import { rateLimiter } from "./rateLimiter";
import { avatarWardrobeStyleValidator } from "./validators/avatarWardrobeStyle";

const AVATAR_LIST_LIMIT = 120;

export const list = query({
  args: {
    productId: v.optional(v.string()),
  },
  handler: async (ctx, { productId }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    if (productId) {
      return await ctx.db
        .query("avatars")
        .withIndex("by_owner_product_created", (q) =>
          q.eq("ownerId", ownerId).eq("productId", productId),
        )
        .order("desc")
        .take(AVATAR_LIST_LIMIT);
    }

    return await ctx.db
      .query("avatars")
      .withIndex("by_owner_created", (q) => q.eq("ownerId", ownerId))
      .order("desc")
      .take(AVATAR_LIST_LIMIT);
  },
});

export const get = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    return await ctx.db
      .query("avatars")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();
  },
});

export const save = mutation({
  args: {
    id: v.string(),
    productId: v.optional(v.string()),
    name: v.string(),
    description: v.optional(v.string()),
    wardrobeStyle: v.optional(avatarWardrobeStyleValidator),
    cliprVoiceId: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexRecordSave", {
      key: ownerId,
      throws: true,
    });
    await assertProductBelongsToOwner(ctx, ownerId, args.productId);

    const existingAvatar = await ctx.db
      .query("avatars")
      .withIndex("by_owner_id", (q) =>
        q.eq("ownerId", ownerId).eq("id", args.id),
      )
      .unique();
    const avatar = {
      ownerId,
      ...args,
    };

    if (existingAvatar) {
      await ctx.db.patch(existingAvatar._id, avatar);
      return existingAvatar._id;
    }

    const avatarDocumentId = await ctx.db.insert("avatars", avatar);
    const notificationCopy = getAvatarNotificationCopy(args);

    await createNotification(ctx, {
      ownerId,
      productId: args.productId,
      sourceType: "avatar",
      sourceId: args.id,
      dedupeKey: `avatar:${args.id}:created`,
      title: notificationCopy.title,
      preview: notificationCopy.preview,
      message: notificationCopy.message,
      createdAt: args.createdAt,
    });

    return avatarDocumentId;
  },
});

export const update = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    productId: v.optional(v.string()),
    wardrobeStyle: v.optional(avatarWardrobeStyleValidator),
    cliprVoiceId: v.optional(v.string()),
    updatedAt: v.string(),
  },
  handler: async (
    ctx,
    { id, name, description, productId, wardrobeStyle, cliprVoiceId, updatedAt },
  ) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);

    await rateLimiter.limit(ctx, "convexMetadataUpdate", {
      key: ownerId,
      throws: true,
    });

    const avatar = await ctx.db
      .query("avatars")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!avatar) {
      throw new Error("Avatar not found.");
    }

    let requestedProductId: string | undefined;

    if (productId !== undefined) {
      requestedProductId = productId.trim();

      if (!requestedProductId) {
        throw new Error("Choose a product before linking this avatar.");
      }

      await assertProductBelongsToOwner(ctx, ownerId, requestedProductId);
    }

    await ctx.db.patch(avatar._id, {
      name,
      ...(description === undefined ? {} : { description }),
      ...(productId === undefined ? {} : { productId: requestedProductId }),
      ...(wardrobeStyle === undefined ? {} : { wardrobeStyle }),
      ...(cliprVoiceId === undefined ? {} : { cliprVoiceId }),
      updatedAt,
    });

    if (productId !== undefined && requestedProductId !== avatar.productId) {
      const avatarPhotos = await ctx.db
        .query("photoAssets")
        .withIndex("by_owner_avatar_created", (q) =>
          q.eq("ownerId", ownerId).eq("avatarId", id),
        )
        .collect();

      for (const photo of avatarPhotos) {
        await ctx.db.patch(photo._id, {
          productId: requestedProductId,
          updatedAt,
        });
      }
    }
  },
});

export const getDeleteBundle = query({
  args: {
    id: v.string(),
  },
  handler: async (ctx, { id }) => {
    const ownerId = await getAuthenticatedOwnerId(ctx);
    const avatar = await ctx.db
      .query("avatars")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!avatar) {
      return null;
    }

    const ownerPhotos = await ctx.db
      .query("photoAssets")
      .withIndex("by_owner_avatar_created", (q) =>
        q.eq("ownerId", ownerId).eq("avatarId", id),
      )
      .collect();

    return {
      avatar,
      photos: ownerPhotos,
    };
  },
});

export const removeWithPhotos = mutation({
  args: {
    id: v.string(),
    photoIds: v.array(v.string()),
    secret: v.string(),
  },
  handler: async (ctx, { id, photoIds, secret }) => {
    assertRateLimitApiSecret(secret);

    const ownerId = await getAuthenticatedOwnerId(ctx);
    const avatar = await ctx.db
      .query("avatars")
      .withIndex("by_owner_id", (q) => q.eq("ownerId", ownerId).eq("id", id))
      .unique();

    if (!avatar) {
      return {
        deletedAvatar: false,
        deletedPhotoCount: 0,
      };
    }

    const ownerPhotos = await ctx.db
      .query("photoAssets")
      .withIndex("by_owner_avatar_created", (q) =>
        q.eq("ownerId", ownerId).eq("avatarId", id),
      )
      .collect();
    const avatarPhotos = ownerPhotos;
    const expectedPhotoIds = new Set(photoIds);
    const hasUncleanedPhoto = avatarPhotos.some(
      (photo) => !expectedPhotoIds.has(photo.id),
    );

    if (hasUncleanedPhoto) {
      throw new Error("Avatar photos changed while deleting. Try again.");
    }

    for (const photo of avatarPhotos) {
      await ctx.db.delete(photo._id);
    }

    await ctx.db.delete(avatar._id);

    const preferences = await ctx.db
      .query("avatarPreferences")
      .withIndex("by_owner", (q) => q.eq("ownerId", ownerId))
      .collect();

    for (const preference of preferences) {
      if (preference.defaultAvatarId === id) {
        await ctx.db.delete(preference._id);
      }
    }

    return {
      deletedAvatar: true,
      deletedPhotoCount: avatarPhotos.length,
    };
  },
});
